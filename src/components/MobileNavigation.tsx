import { Shield, Cloud, LifeBuoy, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const tabs = [
  { id: "before", label: "Before", icon: Shield, path: "/" },
  { id: "during", label: "During", icon: Cloud, path: "/" },
  { id: "after", label: "After", icon: LifeBuoy, path: "/" },
  { id: "settings", label: "Settings", icon: Settings, path: "/" },
];

const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine current active tab based on URL when not on index page
  const getCurrentTab = () => {
    if (location.pathname === "/self-assessment") return "before";
    return activeTab || "before";
  };

  const handleTabClick = (tab: { id: string; path: string }) => {
    if (location.pathname === "/" && onTabChange) {
      // On index page, use the callback to switch content
      onTabChange(tab.id);
    } else {
      // On other pages, navigate to index with the selected tab
      navigate("/");
      // Small delay to ensure navigation completes before setting tab
      setTimeout(() => {
        if (onTabChange) onTabChange(tab.id);
      }, 100);
    }
  };

  const currentActiveTab = getCurrentTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="grid grid-cols-4 h-16">
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