import { useEffect } from "react";
import { useSocket } from "../context/SocketContext.jsx";

/** Join `book:<bookCode>` while this screen is open so live like/comment events arrive. */
export function useBookRoom(bookCode) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !bookCode) return undefined;
    socket.emit("joinBook", bookCode);
    return () => {
      socket.emit("leaveBook", bookCode);
    };
  }, [socket, bookCode]);

  return socket;
}
