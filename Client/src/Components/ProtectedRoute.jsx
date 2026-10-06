import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext.jsx";

function AuthLoading() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

export function ProtectedRoute({ children }) {
  const { currentUser, authReady } = useAuth();
  if (!authReady) return <AuthLoading />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

export function ManagerRoute({ children }) {
  const { currentUser, authReady } = useAuth();
  if (!authReady) return <AuthLoading />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== "manager") return <Navigate to="/" replace />;
  return children;
}
