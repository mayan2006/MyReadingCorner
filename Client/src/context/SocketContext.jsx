import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getSocketOrigin, getSocketPath } from "../services/socketClient";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const instance = io(getSocketOrigin(), {
      path: getSocketPath(),
      withCredentials: true
    });
    setSocket(instance);
    return () => {
      instance.removeAllListeners();
      instance.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
