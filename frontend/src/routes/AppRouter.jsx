import { Navigate, Route, Routes } from "react-router-dom";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Onboarding from "@/pages/Onboarding";
import Feed from "@/pages/Feed";
import Requests from "@/pages/Requests";
import Matches from "@/pages/Matches";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/matches" element={<Matches />} />
      <Route path="/chat/:matchId" element={<Chat />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
