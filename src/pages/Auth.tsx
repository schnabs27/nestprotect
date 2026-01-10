import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import AuthPage from "@/components/AuthPage";

const Auth = () => {
  const navigate = useNavigate();
  const { user, isGuest, setGuestMode } = useAuth();

  // Redirect authenticated users to home
  useEffect(() => {
    if (user || isGuest) {
      navigate("/");
    }
  }, [user, isGuest, navigate]);

  const handleAuthSuccess = () => {
    // User will be automatically redirected by the useEffect above
    // when the auth state changes
  };

  const handleGuestAccess = () => {
    setGuestMode(true);
    navigate("/");
  };

  return (
    <AuthPage 
      onAuthSuccess={handleAuthSuccess}
      onGuestAccess={handleGuestAccess}
    />
  );
};

export default Auth;