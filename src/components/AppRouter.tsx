import { useAuth } from "@/components/AuthProvider";
import AuthPage from "@/components/AuthPage";
import Homepage from "@/components/Homepage";
import { useNavigate } from "react-router-dom";

const AppRouter = () => {
  const { user, loading, isGuest, setGuestMode } = useAuth();
  const navigate = useNavigate();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show auth page if no user and not guest
  if (!user && !isGuest) {
    return (
      <AuthPage 
        onAuthSuccess={() => {
          // User will be automatically updated by auth state change
          navigate("/");
        }}
        onGuestAccess={() => {
          setGuestMode(true);
          navigate("/");
        }}
      />
    );
  }

  // Show homepage for authenticated users or guests
  return <Homepage />;
};

export default AppRouter;