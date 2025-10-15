import { Home, CheckSquare, Radio, AlertTriangle, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "prepare", label: "Prepare", icon: CheckSquare, path: "/preparedness" },
  { id: "monitor", label: "Monitor", icon: Radio, path: "/during" },
  { id: "act", label: "Act", icon: AlertTriangle, path: "/act" },
  { id: "recover", label: "Recover", icon: Search, path: "/after" },
];

const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current active tab based on URL
  const getCurrentTab = () => {
    if (location.pathname === "/") return "home";
    if (location.pathname === "/preparedness" || location.pathname === "/self-assessment") return "prepare";
    if (location.pathname === "/during") return "monitor";
    if (location.pathname === "/act") return "act";
    if (location.pathname === "/after") return "recover";
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
          const isActTab = tab.id === "act";
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-smooth",
                isActTab && "bg-orange-50/60 border-l-2 border-r-2 border-orange-500",
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