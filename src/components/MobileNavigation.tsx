import { Shield, Cloud, CheckSquare, FileText, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "resources", label: "Resources", icon: Shield },
  { id: "weather", label: "Weather", icon: Cloud },
  { id: "preparedness", label: "Ready", icon: CheckSquare },
  { id: "documents", label: "Docs", icon: FileText },
  { id: "inventory", label: "Items", icon: Package },
  { id: "profile", label: "Profile", icon: User },
];

const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="grid grid-cols-6 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
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