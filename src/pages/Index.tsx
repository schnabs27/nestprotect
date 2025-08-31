import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import AuthPage from "@/components/AuthPage";
import MobileNavigation from "@/components/MobileNavigation";
import ZipCodeHeader from "@/components/ZipCodeHeader";
import ResourcesPage from "@/components/ResourcesPage";
import WeatherPage from "@/components/WeatherPage";
import PreparednessPage from "@/components/PreparednessPage";
import DocumentsPage from "@/components/DocumentsPage";
import InventoryPage from "@/components/InventoryPage";
import ProfilePage from "@/components/ProfilePage";

const Index = () => {
  const [activeTab, setActiveTab] = useState("before");
  const { user, loading, isGuest, setGuestMode } = useAuth();

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
        }}
        onGuestAccess={() => setGuestMode(true)}
      />
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case "before":
        return <PreparednessPage />;
      case "during":
        return <WeatherPage />;
      case "after":
        return <ResourcesPage />;
      case "settings":
        return <ProfilePage />;
      default:
        return <PreparednessPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ZipCodeHeader />
      {renderPage()}
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;