const { Server } = require("socket.io");
const { isAllowedOrigin } = require("../config/corsOrigins");
const logger = require("../utils/logger");

let io = null;

const roomName = (bookCode) => `book:${String(bookCode).trim()}`;

const sanitizeBookCode = (value) => {
  if (typeof value !== "string") return "";
  const code = value.trim();
  if (!code || code.length > 120) return "";
  return code;
};

const attachSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    logger.debug({ id: socket.id }, "socket connected");

    socket.on("joinBook", (bookCode, ack) => {
      const code = sanitizeBookCode(bookCode);
      if (code) socket.join(roomName(code));
      if (typeof ack === "function") ack(Boolean(code));
    });

    socket.on("leaveBook", (bookCode, ack) => {
      const code = sanitizeBookCode(bookCode);
      if (code) socket.leave(roomName(code));
      if (typeof ack === "function") ack(Boolean(code));
    });

    socket.on("disconnect", () => {
      logger.debug({ id: socket.id }, "socket disconnected");
    });
  });

  return io;
};

const emitToBook = (bookCode, event, payload) => {
  if (!io) return;
  const code = sanitizeBookCode(bookCode);
  if (!code) return;
  io.to(roomName(code)).emit(event, payload);
};

const getIo = () => io;

const resetIo = () => {
  io = null;
};

module.exports = {
  attachSocket,
  emitToBook,
  getIo,
  resetIo,
  roomName
};
