import { Home, Shield, Cloud, LifeBuoy, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "before", label: "Before", icon: Shield, path: "/preparedness" },
  { id: "during", label: "During", icon: Cloud, path: "/during" },
  { id: "after", label: "After", icon: LifeBuoy, path: "/after" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine current active tab based on URL
  const getCurrentTab = () => {
    if (location.pathname === "/") return "home";
    if (location.pathname === "/preparedness" || location.pathname === "/self-assessment") return "before";
    if (location.pathname === "/during") return "during";
    if (location.pathname === "/after") return "after";
    if (location.pathname === "/settings") return "settings";
    return activeTab || "home";
  };

  const handleTabClick = (tab: { id: string; path: string }) => {
    navigate(tab.path);
  };

  const currentActiveTab = getCurrentTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentActiveTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-smooth",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  "transition-smooth",
                  isActive && "drop-shadow-sm"
                )}
              />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;