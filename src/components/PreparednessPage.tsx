import { useState } from "react";
import { CheckCircle2, Circle, FileDown, Share, AlertTriangle, Flame, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PreparednessPage = () => {
  const [activeHazard, setActiveHazard] = useState("all");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const hazards = [
    { id: "all", label: "All Types", icon: AlertTriangle, color: "text-primary" },
    { id: "wildfire", label: "Wildfire", icon: Flame, color: "text-coral" },
    { id: "flood", label: "Flood", icon: Waves, color: "text-blue-600" },
    { id: "storm", label: "Storm", icon: AlertTriangle, color: "text-accent" }
  ];

  const checklists = {
    all: {
      now: [
        { id: "all-now-1", title: "Make a household emergency plan", notes: "evacuation routes, meeting spots, communication plan", links: ["ready.gov/plan"] },
        { id: "all-now-2", title: "Assemble an emergency supply kit", notes: "3+ days food, 1 gallon water per person per day, meds, flashlight, batteries, NOAA weather radio", links: ["ready.gov/kit"] },
        { id: "all-now-3", title: "Keep important documents safe", notes: "fireproof/waterproof safe + encrypted digital copies", links: [] },
        { id: "all-now-4", title: "Sign up for local alerts and FEMA app", notes: "Stay informed about emergencies in your area", links: [] },
        { id: "all-now-5", title: "Photograph property and review insurance", notes: "update insurance coverage as needed", links: [] }
      ],
      coming: [
        { id: "all-coming-1", title: "Stay tuned to NOAA Weather Radio, FEMA app, or local alerts", notes: "Monitor official channels for updates", links: [] },
        { id: "all-coming-2", title: "Charge phones and backup batteries", notes: "Ensure all devices are fully charged", links: [] },
        { id: "all-coming-3", title: "Refill prescriptions, fuel vehicles, and pack 'go bags'", notes: "Prepare for potential evacuation", links: [] },
        { id: "all-coming-4", title: "Secure pets", notes: "carriers, leashes, food, water", links: [] }
      ],
      during: [
        { id: "all-during-1", title: "Evacuate immediately if ordered", notes: "Don't delay when authorities give evacuation orders", links: [] },
        { id: "all-during-2", title: "Shelter in safest place based on threat type", notes: "Follow specific shelter guidelines for your situation", links: [] },
        { id: "all-during-3", title: "Keep emergency kit and devices with you", notes: "Stay prepared and connected", links: [] },
        { id: "all-during-4", title: "Help neighbors if safe to do so", notes: "Community support during emergencies", links: [] }
      ],
      after: [
        { id: "all-after-1", title: "Return home only when officials say it's safe", notes: "Wait for all-clear from authorities", links: [] },
        { id: "all-after-2", title: "Wear protective gear when cleaning debris", notes: "boots, gloves, masks", links: [] },
        { id: "all-after-3", title: "Document damage before cleanup or repairs", notes: "Take photos/videos for insurance", links: [] },
        { id: "all-after-4", title: "Contact insurance promptly; apply for FEMA assistance if eligible", notes: "Start recovery process quickly", links: ["fema.gov/assistance"] },
        { id: "all-after-5", title: "Watch for hazards", notes: "power lines, gas leaks, unstable structures", links: [] }
      ]
    },
    wildfire: {
      now: [
        { id: "wildfire-now-1", title: "Create defensible space", notes: "clear brush and flammable material 30–100 ft from home", links: ["ready.gov/wildfires"] },
        { id: "wildfire-now-2", title: "Clean roofs, gutters, and vents regularly", notes: "Remove debris that could ignite", links: [] },
        { id: "wildfire-now-3", title: "Use fire-resistant materials when possible", notes: "For roofing, siding, and landscaping", links: [] },
        { id: "wildfire-now-4", title: "Store tools", notes: "hoses, shovels, rakes, buckets", links: [] },
        { id: "wildfire-now-5", title: "Add N95 masks to supply kit for smoke", notes: "Protect against smoke inhalation", links: [] }
      ],
      coming: [
        { id: "wildfire-coming-1", title: "Move flammable items away from house", notes: "patio furniture, firewood, propane", links: [] },
        { id: "wildfire-coming-2", title: "Shut off gas and propane", notes: "Reduce fire fuel sources", links: [] },
        { id: "wildfire-coming-3", title: "Close all windows, doors, and vents", notes: "Prevent embers from entering", links: [] },
        { id: "wildfire-coming-4", title: "Park car facing outward, fueled and packed", notes: "Ready for quick evacuation", links: [] },
        { id: "wildfire-coming-5", title: "Monitor fire updates closely", notes: "Stay informed about fire progression", links: [] }
      ],
      during: [
        { id: "wildfire-during-1", title: "Leave at once if evacuation is ordered", notes: "Don't delay evacuation orders", links: [] },
        { id: "wildfire-during-2", title: "Wear protective clothing", notes: "long sleeves, boots, N95 mask", links: [] },
        { id: "wildfire-during-3", title: "Drive with windows closed, air on recirculate", notes: "Protect against smoke while driving", links: [] },
        { id: "wildfire-during-4", title: "If trapped: Stay in cleared area or inside car", notes: "Seek shelter in safest available location", links: [] },
        { id: "wildfire-during-5", title: "Lie face down in a ditch/depression if outdoors", notes: "Last resort protection from flames", links: [] }
      ],
      after: [
        { id: "wildfire-after-1", title: "Be alert for smoldering hot spots and weakened structures", notes: "Fire can reignite or structures can collapse", links: [] },
        { id: "wildfire-after-2", title: "Check attic, roof, and yard for embers", notes: "Look for remaining fire hazards", links: [] },
        { id: "wildfire-after-3", title: "Wear N95 masks to avoid breathing ash", notes: "Protect respiratory health", links: [] },
        { id: "wildfire-after-4", title: "File insurance claim promptly", notes: "Document all fire damage", links: [] }
      ]
    },
    flood: {
      now: [
        { id: "flood-now-1", title: "Check FEMA flood maps for risk", notes: "Know your flood zone", links: ["ready.gov/floods"] },
        { id: "flood-now-2", title: "Buy flood insurance", notes: "standard homeowner's does not cover floods", links: [] },
        { id: "flood-now-3", title: "Elevate appliances, utilities, and electrical panels", notes: "Move above potential flood level", links: [] },
        { id: "flood-now-4", title: "Install sump pump with backup", notes: "Prepare for water removal", links: [] },
        { id: "flood-now-5", title: "Store valuables/documents in waterproof containers", notes: "Protect important items", links: [] }
      ],
      coming: [
        { id: "flood-coming-1", title: "Move valuables and electronics to higher floors", notes: "Protect from rising water", links: [] },
        { id: "flood-coming-2", title: "Fill clean containers with water; fill bathtub", notes: "for washing/cleaning if water supply is cut", links: [] },
        { id: "flood-coming-3", title: "Place sandbags around doors and drains if available", notes: "Try to divert water away", links: [] },
        { id: "flood-coming-4", title: "Turn off gas, electricity, and water if advised", notes: "Follow utility shutdown procedures", links: [] }
      ],
      during: [
        { id: "flood-during-1", title: "Never walk or drive through floodwaters", notes: "Turn Around, Don't Drown - 6 inches can knock you down", links: [] },
        { id: "flood-during-2", title: "Move to higher ground or highest floor if trapped", notes: "Get above the water level", links: [] },
        { id: "flood-during-3", title: "Disconnect power only if safe", notes: "Avoid electrical hazards in water", links: [] },
        { id: "flood-during-4", title: "Keep tuned to alerts", notes: "Monitor conditions and evacuation orders", links: [] }
      ],
      after: [
        { id: "flood-after-1", title: "Avoid standing water", notes: "contamination/electricity risk", links: [] },
        { id: "flood-after-2", title: "Check buildings for structural damage before entering", notes: "Ensure safety before re-entry", links: [] },
        { id: "flood-after-3", title: "Discard any food, water, or medicine touched by floodwater", notes: "Prevent contamination illness", links: [] },
        { id: "flood-after-4", title: "Dry home quickly to prevent mold", notes: "Use fans, dehumidifiers, open windows", links: [] }
      ]
    },
    storm: {
      now: [
        { id: "storm-now-1", title: "Know if you're in a hurricane evacuation zone or tornado-prone area", notes: "Understand your specific risks", links: ["ready.gov/hurricanes", "ready.gov/tornadoes"] },
        { id: "storm-now-2", title: "Reinforce home", notes: "storm shutters, secure roof/doors", links: [] },
        { id: "storm-now-3", title: "Stockpile food, water, and medicine for 3+ days", notes: "Prepare for extended power outages", links: [] },
        { id: "storm-now-4", title: "Identify shelters", notes: "basement/interior room for tornado; community shelter for hurricane", links: [] },
        { id: "storm-now-5", title: "Back up devices and store property records", notes: "Protect digital information", links: [] }
      ],
      coming: [
        { id: "storm-coming-1", title: "Bring outdoor furniture/items indoors", notes: "Prevent them from becoming projectiles", links: [] },
        { id: "storm-coming-2", title: "Charge all electronics; set fridge/freezer to coldest setting", notes: "Prepare for power outages", links: [] },
        { id: "storm-coming-3", title: "Fuel vehicles; park in garage or away from trees", notes: "Protect vehicles and ensure mobility", links: [] },
        { id: "storm-coming-4", title: "Secure windows with shutters/plywood", notes: "Protect against wind and debris", links: [] },
        { id: "storm-coming-5", title: "Identify safe room or shelter location", notes: "Know where to go when storm hits", links: [] }
      ],
      during: [
        { id: "storm-during-1", title: "Hurricane: Shelter in interior room, away from windows/glass doors", notes: "Stay away from wind and flying debris", links: [] },
        { id: "storm-during-2", title: "Tornado: Shelter in basement or lowest-floor interior room", notes: "protect head with blankets or helmets", links: [] },
        { id: "storm-during-3", title: "Stay tuned to alerts", notes: "Monitor weather conditions", links: [] },
        { id: "storm-during-4", title: "Do not leave until officials confirm storm has passed", notes: "Eye of hurricane can be deceiving", links: [] }
      ],
      after: [
        { id: "storm-after-1", title: "Avoid downed power lines and flooded areas", notes: "Stay safe during initial assessment", links: [] },
        { id: "storm-after-2", title: "Use generators outdoors only, at least 20 feet from homes", notes: "Prevent carbon monoxide poisoning", links: [] },
        { id: "storm-after-3", title: "Check on vulnerable neighbors", notes: "Community support during recovery", links: [] },
        { id: "storm-after-4", title: "Photograph/document damage before cleanup", notes: "Evidence for insurance claims", links: [] },
        { id: "storm-after-5", title: "Discard spoiled or contaminated food/water", notes: "Prevent foodborne illness", links: [] }
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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
        <Tabs defaultValue="now" className="w-full">
          <TabsList className="grid w-full grid-cols-4 text-xs">
            <TabsTrigger value="now">Now</TabsTrigger>
            <TabsTrigger value="coming">It's Coming</TabsTrigger>
            <TabsTrigger value="during">During</TabsTrigger>
            <TabsTrigger value="after">Recovery</TabsTrigger>
          </TabsList>
          
          {["now", "coming", "during", "after"].map((phase) => (
            <TabsContent key={phase} value={phase} className="mt-4">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-title">
                    {phase === "now" && "Now - Prepare for any disaster"}
                    {phase === "coming" && "It's Coming - Final preparations"}
                    {phase === "during" && "During - Stay safe"}
                    {phase === "after" && "Recovery - After the disaster"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentChecklist[phase as keyof typeof currentChecklist]?.map((item) => (
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