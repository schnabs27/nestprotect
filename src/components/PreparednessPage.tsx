import { useState } from "react";
import { CheckCircle2, Circle, FileDown, Share, AlertTriangle, Flame, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PreparednessPage = () => {
  const [activeHazard, setActiveHazard] = useState("flood");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const hazards = [
    { id: "flood", label: "Flood", icon: Waves, color: "text-primary" },
    { id: "fire", label: "Fire", icon: Flame, color: "text-coral" },
    { id: "storm", label: "Storm", icon: AlertTriangle, color: "text-accent" }
  ];

  const checklists = {
    flood: {
      before: [
        { id: "flood-before-1", title: "Create evacuation plan", notes: "Plan multiple routes out of your area", links: ["fema.gov/evacuation"] },
        { id: "flood-before-2", title: "Prepare emergency kit", notes: "Water, food, medications for 3+ days", links: ["ready.gov/kit"] },
        { id: "flood-before-3", title: "Know flood zones", notes: "Check if you're in a flood zone", links: ["fema.gov/flood-maps"] },
        { id: "flood-before-4", title: "Review insurance coverage", notes: "Standard homeowner's doesn't cover floods", links: ["floodsmart.gov"] }
      ],
      during: [
        { id: "flood-during-1", title: "Monitor weather alerts", notes: "Stay informed through official channels", links: ["weather.gov"] },
        { id: "flood-during-2", title: "Evacuate if ordered", notes: "Don't wait - leave immediately", links: [] },
        { id: "flood-during-3", title: "Avoid walking/driving in water", notes: "6 inches can knock you down, 12 inches can carry away a car", links: [] },
        { id: "flood-during-4", title: "Get to higher ground", notes: "Move to the highest floor if trapped", links: [] }
      ],
      after: [
        { id: "flood-after-1", title: "Wait for all-clear", notes: "Don't return until authorities say it's safe", links: [] },
        { id: "flood-after-2", title: "Document damage", notes: "Take photos/videos for insurance", links: [] },
        { id: "flood-after-3", title: "Contact insurance company", notes: "File claims as soon as possible", links: [] },
        { id: "flood-after-4", title: "Be careful with cleanup", notes: "Wear protective gear, watch for hazards", links: ["cdc.gov/disasters/cleanup"] }
      ]
    },
    fire: {
      before: [
        { id: "fire-before-1", title: "Create defensible space", notes: "Clear vegetation 30+ feet around home", links: ["readyforwildfire.org"] },
        { id: "fire-before-2", title: "Prepare go-bag", notes: "Keep packed and ready by exit", links: [] },
        { id: "fire-before-3", title: "Plan evacuation routes", notes: "Know multiple ways out of your neighborhood", links: [] },
        { id: "fire-before-4", title: "Install smoke alarms", notes: "Test monthly, change batteries yearly", links: [] }
      ],
      during: [
        { id: "fire-during-1", title: "Follow evacuation orders", notes: "Leave immediately when told", links: [] },
        { id: "fire-during-2", title: "Close all windows/doors", notes: "Turn off gas, leave lights on", links: [] },
        { id: "fire-during-3", title: "Stay low if trapped", notes: "Smoke rises - crawl below it", links: [] },
        { id: "fire-during-4", title: "Call 911", notes: "Report your location if trapped", links: [] }
      ],
      after: [
        { id: "fire-after-1", title: "Wait for all-clear", notes: "Don't return until authorities allow", links: [] },
        { id: "fire-after-2", title: "Check for hazards", notes: "Look for hot spots, damaged structures", links: [] },
        { id: "fire-after-3", title: "Document everything", notes: "Photos for insurance and FEMA", links: [] },
        { id: "fire-after-4", title: "Contact professionals", notes: "Have electrical/gas systems inspected", links: [] }
      ]
    },
    storm: {
      before: [
        { id: "storm-before-1", title: "Secure outdoor items", notes: "Bring in or tie down anything that could fly", links: [] },
        { id: "storm-before-2", title: "Stock emergency supplies", notes: "Water, food, flashlights, batteries", links: ["ready.gov/kit"] },
        { id: "storm-before-3", title: "Charge devices", notes: "Phones, tablets, portable chargers", links: [] },
        { id: "storm-before-4", title: "Know shelter locations", notes: "Identify safest room in your home", links: [] }
      ],
      during: [
        { id: "storm-during-1", title: "Stay indoors", notes: "Avoid windows, stay in interior rooms", links: [] },
        { id: "storm-during-2", title: "Monitor weather radio", notes: "Listen for tornado warnings", links: [] },
        { id: "storm-during-3", title: "Avoid electrical hazards", notes: "Unplug appliances, avoid water", links: [] },
        { id: "storm-during-4", title: "Take shelter if tornado warning", notes: "Basement or interior room, lowest floor", links: [] }
      ],
      after: [
        { id: "storm-after-1", title: "Check for injuries", notes: "Give first aid, call 911 if needed", links: [] },
        { id: "storm-after-2", title: "Inspect home safely", notes: "Look for structural damage, gas leaks", links: [] },
        { id: "storm-after-3", title: "Avoid downed power lines", notes: "Stay at least 35 feet away", links: [] },
        { id: "storm-after-4", title: "Document damage", notes: "Take photos before cleanup starts", links: [] }
      ]
    }
  };

  const toggleCheck = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const currentChecklist = checklists[activeHazard as keyof typeof checklists];

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 pt-12">
        <h1 className="text-2xl font-bold mb-2">Emergency Preparedness</h1>
        <p className="text-primary-foreground/90 text-sm">
          Stay ready for natural disasters
        </p>
      </div>

      <div className="p-4">
        {/* Hazard Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-title mb-3">Select Hazard Type</h2>
          <div className="grid grid-cols-3 gap-2">
            {hazards.map((hazard) => {
              const Icon = hazard.icon;
              return (
                <Button
                  key={hazard.id}
                  variant={activeHazard === hazard.id ? "default" : "outline"}
                  className={`h-16 flex flex-col gap-1 ${
                    activeHazard === hazard.id 
                      ? "bg-gradient-primary border-0 text-primary-foreground" 
                      : ""
                  }`}
                  onClick={() => setActiveHazard(hazard.id)}
                >
                  <Icon size={20} className={activeHazard === hazard.id ? "" : hazard.color} />
                  <span className="text-xs">{hazard.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Checklist Tabs */}
        <Tabs defaultValue="before" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="before">Before</TabsTrigger>
            <TabsTrigger value="during">During</TabsTrigger>
            <TabsTrigger value="after">After</TabsTrigger>
          </TabsList>
          
          {["before", "during", "after"].map((phase) => (
            <TabsContent key={phase} value={phase} className="mt-4">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-title capitalize">
                    {phase} the {hazards.find(h => h.id === activeHazard)?.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentChecklist[phase as keyof typeof currentChecklist].map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-smooth"
                    >
                      <button
                        onClick={() => toggleCheck(item.id)}
                        className="mt-1"
                      >
                        {checkedItems.has(item.id) ? (
                          <CheckCircle2 size={20} className="text-primary" />
                        ) : (
                          <Circle size={20} className="text-muted-foreground" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <h4 className={`font-medium ${checkedItems.has(item.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.notes}
                        </p>
                        {item.links.length > 0 && (
                          <div className="mt-2">
                            {item.links.map((link, index) => (
                              <a
                                key={index}
                                href={`https://${link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline mr-3"
                              >
                                {link}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <Button variant="outline" className="w-full">
            <FileDown size={16} className="mr-2" />
            Export as PDF
          </Button>
          <Button variant="outline" className="w-full">
            <Share size={16} className="mr-2" />
            Save to Google Drive
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreparednessPage;