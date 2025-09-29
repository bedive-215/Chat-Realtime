import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useChatStore } from "./store/useChatStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, accessToken, initializeSocket } = useAuthStore();
  const { theme } = useThemeStore();
  const { getUser, users, setupSocketListeners, cleanupSocketListeners } = useChatStore();

  // Check authentication
  useEffect(() => {
    if (!accessToken) {
      checkAuth();
    }
  }, [checkAuth, accessToken]);

  useEffect(() => {
    if (authUser && accessToken) {
      getUser();
    }
  }, [authUser, accessToken, getUser]);

  useEffect(() => {
    if (authUser && accessToken) {
      setupSocketListeners();
      
      return () => {
        cleanupSocketListeners();
      };
    }
  }, [authUser, accessToken, setupSocketListeners, cleanupSocketListeners]);

  useEffect(() => {
    if (authUser) {
      initializeSocket();
    }
  }, [authUser, initializeSocket]);

  console.log(authUser);
  console.log(users);

  if (isCheckingAuth) return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin"></Loader>
    </div>
  )

  return (
    <div data-theme={theme}>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;