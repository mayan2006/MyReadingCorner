const http = require("http");
const { io: Client } = require("socket.io-client");
const Book = require("../Models/BookModel");
const { attachSocket, emitToBook, resetIo } = require("../realtime/socket");
const { request, app, signupUser, cookieHeader } = require("./helpers");

const sampleBook = () => ({
  bookCode: "BOOK-LIVE-1",
  categoryCode: "פנטזיה",
  title: "ספר חי",
  summary: "לבדיקת סוקט",
  author: "מחבר",
  img: "https://placehold.co/200x300",
  content: "תוכן"
});

const waitFor = (socket, event) =>
  new Promise((resolve) => {
    socket.once(event, resolve);
  });

describe("Socket.io live book rooms", () => {
  let httpServer;
  let io;
  let origin;

  beforeAll((done) => {
    httpServer = http.createServer(app);
    io = attachSocket(httpServer);
    httpServer.listen(() => {
      const { port } = httpServer.address();
      origin = `http://127.0.0.1:${port}`;
      done();
    });
  });

  afterAll((done) => {
    io.close(() => {
      httpServer.close(() => {
        resetIo();
        done();
      });
    });
  });

  const connectClient = () =>
    new Promise((resolve, reject) => {
      const socket = Client(origin, {
        transports: ["websocket"],
        forceNew: true
      });
      socket.on("connect", () => resolve(socket));
      socket.on("connect_error", reject);
    });

  it("delivers emitToBook only to sockets that joined the book room", async () => {
    const inRoom = await connectClient();
    const outsider = await connectClient();
    await new Promise((resolve) => inRoom.emit("joinBook", "BOOK-ROOM", resolve));

    const gotEvent = waitFor(inRoom, "likeUpdated");
    const outsiderGot = new Promise((resolve, reject) => {
      outsider.once("likeUpdated", () => reject(new Error("outsider received room event")));
      setTimeout(resolve, 120);
    });

    emitToBook("BOOK-ROOM", "likeUpdated", { bookCode: "BOOK-ROOM", count: 3 });

    await expect(gotEvent).resolves.toEqual(
      expect.objectContaining({ bookCode: "BOOK-ROOM", count: 3 })
    );
    await outsiderGot;
    inRoom.close();
    outsider.close();
  });

  it("broadcasts likeUpdated after a REST like toggle", async () => {
    const user = await signupUser({
      userCode: "SOCK-LIKE",
      email: "sock-like@test.com"
    });
    const socket = await connectClient();
    await new Promise((resolve) => socket.emit("joinBook", "BOOK-LIVE-LIKE", resolve));
    const gotEvent = waitFor(socket, "likeUpdated");

    const res = await request(app)
      .post("/bookLike/toggle")
      .set("Cookie", cookieHeader(user))
      .send({ bookCode: "BOOK-LIVE-LIKE" });

    expect(res.status).toBe(200);
    await expect(gotEvent).resolves.toEqual(
      expect.objectContaining({
        bookCode: "BOOK-LIVE-LIKE",
        count: 1,
        liked: true,
        userCode: "SOCK-LIKE"
      })
    );
    socket.close();
  });

  it("broadcasts responseAdded after a REST comment", async () => {
    await Book.create(sampleBook());
    const user = await signupUser({
      userCode: "SOCK-RES",
      email: "sock-res@test.com",
      firstName: "סוקט",
      lastName: "תגובה"
    });
    const socket = await connectClient();
    await new Promise((resolve) => socket.emit("joinBook", "BOOK-LIVE-1", resolve));
    const gotEvent = waitFor(socket, "responseAdded");

    const res = await request(app)
      .post("/bookResponse")
      .set("Cookie", cookieHeader(user))
      .send({ bookCode: "BOOK-LIVE-1", content: "תגובה חיה" });

    expect(res.status).toBe(200);
    const payload = await gotEvent;
    expect(payload.bookCode).toBe("BOOK-LIVE-1");
    expect(payload.response).toEqual(
      expect.objectContaining({
        bookCode: "BOOK-LIVE-1",
        userCode: "SOCK-RES",
        content: "תגובה חיה"
      })
    );
    socket.close();
  });
});
