import { useState } from "react";
import MobileNavigation from "@/components/MobileNavigation";
import ResourcesPage from "@/components/ResourcesPage";
import WeatherPage from "@/components/WeatherPage";
import PreparednessPage from "@/components/PreparednessPage";
import DocumentsPage from "@/components/DocumentsPage";
import InventoryPage from "@/components/InventoryPage";
import ProfilePage from "@/components/ProfilePage";

const Index = () => {
  const [activeTab, setActiveTab] = useState("resources");

  const renderPage = () => {
    switch (activeTab) {
      case "resources":
        return <ResourcesPage />;
      case "weather":
        return <WeatherPage />;
      case "preparedness":
        return <PreparednessPage />;
      case "documents":
        return <DocumentsPage />;
      case "inventory":
        return <InventoryPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <ResourcesPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderPage()}
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;