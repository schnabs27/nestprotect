import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, Circle, FileDown, Share, AlertTriangle, Flame, Waves, ChevronDown } from "lucide-react";
import nestorPreparedness from '@/assets/nestor-preparedness.png';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import MobileNavigation from "@/components/MobileNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

/**
 * PREPAREDNESS PAGE - Disaster Prep Checklists
 * 
 * PURPOSE:
 * Displays interactive checklists for preparing for natural disasters.
 * Users can check off tasks, which are saved to their account or browser.
 * 
 * STRUCTURE:
 * - Hazard filter buttons (All, Wildfire, Flood, Storm)
 * - Phase tabs (Now, Coming, During, After)
 * - Expandable checklist sections with critical and additional tasks
 * 
 * DATA ORGANIZATION:
 * The `checklists` object contains all tasks:
 *   checklists[hazardType][phase] = array of checklist sections
 *   - hazardType: "all", "wildfire", "flood", "storm"
 *   - phase: "now", "coming", "during", "after"
 * 
 * PROGRESS TRACKING:
 * - Authenticated users: saved to Supabase database
 * - Guest users: saved to browser localStorage
 * - State managed in checkedItems Set (task IDs)
 * 
 * KEY FEATURES:
 * - Auto-detects URLs in task text and makes them clickable
 * - Collapsible sections (openItems Set tracks expanded state)
 * - Real-time sync with database on checkbox changes
 */

const PreparednessPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [activeHazard, setActiveHazard] = useState("all");
  const [activeTab, setActiveTab] = useState("now");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load user progress from database or localStorage
  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        // Load from database for authenticated users
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('user_preparedness_progress')
            .select('task_id, completed')
            .eq('user_id', user.id)
            .eq('completed', true);

          if (error) throw error;

          const completedTasks = new Set(data?.map(item => item.task_id) || []);
          setCheckedItems(completedTasks);
        } catch (error) {
          console.error('Error loading progress:', error);
          toast.error('Failed to load your progress');
          // Fall back to localStorage
          const saved = localStorage.getItem('prepCheckedItems');
          setCheckedItems(saved ? new Set(JSON.parse(saved)) : new Set());
        } finally {
          setLoading(false);
        }
      } else {
        // Load from localStorage for non-authenticated users
        const saved = localStorage.getItem('prepCheckedItems');
        setCheckedItems(saved ? new Set(JSON.parse(saved)) : new Set());
      }
    };

    loadProgress();
  }, [user]);

  // Handle navigation state to set initial tab and hazard
  useEffect(() => {
    if (location.state?.activeTab && location.state?.activeHazard) {
      setActiveHazard(location.state.activeHazard);
      setActiveTab(location.state.activeTab === "recovery" ? "after" : location.state.activeTab);
    }
  }, [location.state]);

  // Helper function to render text with clickable links
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const hazards = [
    { id: "all", label: "All Types", icon: AlertTriangle, color: "text-primary" },
    { id: "wildfire", label: "Wildfire", icon: Flame, color: "text-coral" },
    { id: "flood", label: "Flood", icon: Waves, color: "text-blue-600" },
    { id: "storm", label: "Storm", icon: AlertTriangle, color: "text-accent" }
  ];

  const checklists = {
    all: {
      now: [
        {
          id: "know-risk",
          title: "Know your risk for each type of disaster.",
          criticalTasks: [
            { id: "risk-1", text: "Search your address at https://hazards.fema.gov/nri/map to identify risks (flood, wildfire, storm, etc.)." },
            { id: "risk-2", text: "Prepare for the risks with \"Very High\" ratings in your area." }
          ],
          additionalTasks: [
            { id: "risk-3", text: "Share the FEMA map results with your household." },
            { id: "risk-4", text: "Bookmark the FEMA National Risk Index for quick reference." }
          ],
          learnMore: "https://hazards.fema.gov/nri/map"
        },
        {
          id: "household-plan",
          title: "Make a household emergency plan.",
          criticalTasks: [
            { id: "plan-1", text: "Create a shared Google Doc titled \"Family Emergency Plan\" with household info and roles." },
            { id: "plan-2", text: "In Google Contacts, add an out-of-area contact under a new label \"Emergency.\"" },
            { id: "plan-3", text: "In Google Maps, make a list \"Emergency Meeting Places\" and save two locations (near home and outside neighborhood)." }
          ],
          additionalTasks: [
            { id: "plan-4", text: "Save two evacuation routes in Google Maps and download offline maps." },
            { id: "plan-5", text: "Assign roles in your Google Doc (who grabs kit, manages pets, helps elderly)." },
            { id: "plan-6", text: "Set a Google Calendar reminder to practice twice a year." }
          ],
          learnMore: "https://www.ready.gov/plan"
        },
        {
          id: "emergency-kit",
          title: "Assemble an at-home emergency supply kit.",
          criticalTasks: [
            { id: "kit-1", text: "At least a 3-day supply of water (1 gallon per person per day)" },
            { id: "kit-2", text: "At least a 3-day supply of non-perishable food" },
            { id: "kit-3", text: "A first aid kit, basic medicines, and personal hygiene items" },
            { id: "kit-4", text: "A flashlight and a battery-powered radio" },
            { id: "kit-5", text: "Backup power: batteries, charged power bank, and/or generator" }
          ],
          additionalTasks: [
            { id: "kit-6", text: "Extra clothing, blankets, and sturdy shoes" },
            { id: "kit-7", text: "Cash in small bills and local maps" },
            { id: "kit-8", text: "Tools such as a wrench or pliers for turning off utilities" },
            { id: "kit-9", text: "Supplies as needed for infants, elderly and/or pets" }
          ],
          learnMore: "https://www.ready.gov/kit"
        },
        {
          id: "go-bags",
          title: "Maintain a go-bag for each person in case you need to evacuate.",
          criticalTasks: [
            { id: "gobag-1", text: "3 days of clothing and personal items" },
            { id: "gobag-2", text: "Water bottles and lightweight, non-perishable snacks" },
            { id: "gobag-3", text: "Copies of IDs, insurance information, critical phone numbers, and printed map in waterproof bag" },
            { id: "gobag-4", text: "Necessary medications and a small first aid kit" },
            { id: "gobag-5", text: "Lightweight poncho and flashlight" }
          ],
          additionalTasks: [
            { id: "gobag-6", text: "Power chargers and charged portable power bank" },
            { id: "gobag-7", text: "Some cash in small bills" },
            { id: "gobag-8", text: "Items for children, elderly, or pets as needed" },
            { id: "gobag-9", text: "Maintain a car kit with water, snacks, blankets, and a phone charger in case you become stranded or stuck in traffic." }
          ],
          learnMore: "https://www.ready.gov/kit"
        },
        {
          id: "documents",
          title: "Keep important documents safe.",
          criticalTasks: [
            { id: "docs-1", text: "Use the Google Drive app → Scan → upload IDs, insurance, and medical records." },
            { id: "docs-2", text: "Organize into a folder \"Emergency Documents\" and share only with trusted family." }
          ],
          additionalTasks: [
            { id: "docs-3", text: "Mark key files \"Available Offline\" in Drive." },
            { id: "docs-4", text: "Place physical originals in a fireproof, waterproof container at home." },
            { id: "docs-5", text: "Add a one-page Google Doc summary of where originals are stored." }
          ],
          learnMore: "https://www.ready.gov/protecting-documents"
        },
        {
          id: "alerts",
          title: "Sign up for local alerts and FEMA app.",
          criticalTasks: [
            { id: "alerts-1", text: "Download and enable alerts in the FEMA App (Android or iOS)." },
            { id: "alerts-2", text: "Search Google for \"[Your City] emergency alerts\" and register with your local system." },
            { id: "alerts-3", text: "Enable Wireless Emergency Alerts in phone settings." }
          ],
          additionalTasks: [
            { id: "alerts-4", text: "In Google Contacts, create a label \"Emergency Services\" and add police, fire, utilities, and emergency management." },
            { id: "alerts-5", text: "Test by sending a message to your \"Emergency\" label group." }
          ],
          learnMore: "https://www.fema.gov/mobile-app"
        },
        {
          id: "inventory",
          title: "Photograph property and review insurance.",
          criticalTasks: [
            { id: "inventory-1", text: "Take photos of every room and major item, then save in a Google Photos album \"Home Inventory.\"" },
            { id: "inventory-2", text: "Upload receipts and warranties to a Google Drive folder \"Home Inventory.\"" }
          ],
          additionalTasks: [
            { id: "inventory-3", text: "Use the Info field in Photos to add notes such as serial numbers and purchase year." },
            { id: "inventory-4", text: "Search Drive or email for your insurance policy and confirm coverage for local hazards such as flood, wildfire, or storm." },
            { id: "inventory-5", text: "Update photos after major purchases and share the album with a trusted family member." }
          ],
          learnMore: "https://www.ready.gov/financial-preparedness"
        },
        {
          id: "deadline",
          title: "Set a deadline to complete your prep.",
          criticalTasks: [
            { id: "deadline-1", text: "Schedule an emergency practice day when you will have all or most of your prep completed." },
            { id: "deadline-2", text: "Schedule weekly work sessions to complete the tasks before your deadline." }
          ],
          additionalTasks: [
            { id: "deadline-3", text: "Create a Google Keep task list by category for easy completion, such as Shopping or Photos." },
            { id: "deadline-4", text: "Ask your household members to help and share responsibilities." }
          ],
          learnMore: "https://www.ready.gov/plan"
        }
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
        { id: "all-after-1b", title: "Board up new openings to your home caused by the disaster", notes: "Easy access may tempt looters", links: [] },
        { id: "all-after-2", title: "Wear protective gear when cleaning debris", notes: "boots, gloves, masks", links: [] },
        { id: "all-after-3", title: "Document damage before cleanup or repairs", notes: "Take photos/videos for insurance", links: [] },
        { id: "all-after-4", title: "Contact insurance promptly; apply for FEMA assistance if eligible", notes: "Start recovery process quickly", links: ["fema.gov/assistance"] },
        { id: "all-after-5", title: "Watch for hazards", notes: "power lines, gas leaks, unstable structures", links: [] },
        { id: "all-after-6", title: "Use generators outdoors only, at least 20 feet from homes", notes: "Prevent carbon monoxide poisoning", links: [] },
        { id: "all-after-7", title: "Check on vulnerable neighbors", notes: "Community support during recovery", links: [] },
        { id: "all-after-8", title: "Discard spoiled or contaminated food/water", notes: "Prevent foodborne illness", links: [] },
        { id: "all-after-9", title: "Apply fencing and \"Do Not Enter\" signage", notes: "Discourage visitors who may hurt themselves or further damage your property", links: [] },
        { id: "all-after-10", title: "Be confident, ask questions", notes: "Strangers may show up and insist you use their services - but they are not in charge. Remember you have the right to make researched, thoughtful decisions for your best interest.", links: [] }
      ]
    },
    wildfire: {
      now: [
        {
          id: "defensible-space",
          title: "Clear defensible space around your home.",
          criticalTasks: [
            { id: "space-1", text: "Remove dry leaves, pine needles, and debris from your roof, gutters, and deck." },
            { id: "space-2", text: "Clear flammable vegetation and brush within 30 feet of your house." },
            { id: "space-3", text: "Trim tree branches at least 10 feet away from your home and power lines." }
          ],
          additionalTasks: [
            { id: "space-4", text: "Create a 100-foot defensible zone if possible, focusing on thinning vegetation." },
            { id: "space-5", text: "Stack firewood, propane tanks, and other combustibles at least 30 feet from the home." },
            { id: "space-6", text: "Use gravel, stone, or other non-combustible materials in landscaping near the house." }
          ],
          learnMore: "https://www.ready.gov/wildfires"
        },
        {
          id: "ember-resistant",
          title: "Install ember-resistant features on your home.",
          criticalTasks: [
            { id: "ember-1", text: "Cover exterior attic and crawl space vents with 1/8-inch metal mesh." },
            { id: "ember-2", text: "Seal gaps in siding, roofing, and around eaves where embers could enter." }
          ],
          additionalTasks: [
            { id: "ember-3", text: "Upgrade to fire-resistant roofing, siding, and double-pane windows if possible." },
            { id: "ember-4", text: "Add metal flashing where wood decking connects to the house." }
          ],
          learnMore: "https://www.ready.gov/wildfires"
        },
        {
          id: "evacuation-routes",
          title: "Identify wildfire evacuation routes and shelters.",
          criticalTasks: [
            { id: "route-1", text: "Use Google Maps to star at least two exit routes from your neighborhood." },
            { id: "route-2", text: "Identify a primary evacuation shelter or friend/family house outside your area." }
          ],
          additionalTasks: [
            { id: "route-3", text: "Download offline maps in Google Maps in case cell service fails." },
            { id: "route-4", text: "Make a list of nearby hotels or motels as backup shelter options." }
          ],
          learnMore: "https://www.ready.gov/wildfires"
        },
        {
          id: "wildfire-alerts",
          title: "Sign up for wildfire alerts.",
          criticalTasks: [
            { id: "alert-1", text: "Download FEMA App and enable notifications." },
            { id: "alert-2", text: "Register for local emergency alert systems through your county or city." }
          ],
          additionalTasks: [
            { id: "alert-3", text: "In Google Contacts, create an \"Emergency\" label and add alert hotlines and contacts." },
            { id: "alert-4", text: "Follow your state's forestry or fire agency on social media for real-time updates." }
          ],
          learnMore: "https://www.fema.gov/mobile-app"
        }
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
        {
          id: "flood-zone",
          title: "Know your flood zone and evacuation routes.",
          criticalTasks: [
            { id: "zone-1", text: "Look up your address on FEMA's Flood Map Service Center." },
            { id: "zone-2", text: "Identify two evacuation routes to higher ground and save them in Google Maps." }
          ],
          additionalTasks: [
            { id: "zone-3", text: "Download offline maps in Google Maps in case cell service fails." },
            { id: "zone-4", text: "Bookmark your city or county's flood evacuation maps on your phone." }
          ],
          learnMore: "https://msc.fema.gov"
        },
        {
          id: "elevate-appliances",
          title: "Elevate major appliances and utilities if possible.",
          criticalTasks: [
            { id: "elevate-1", text: "Move furnaces, water heaters, and electrical panels above expected flood levels if feasible." },
            { id: "elevate-2", text: "Place small appliances and electronics on shelves or upper floors." }
          ],
          additionalTasks: [
            { id: "elevate-3", text: "Hire a contractor to install flood vents or elevate HVAC systems." },
            { id: "elevate-4", text: "Use waterproof containers for items that cannot be moved." }
          ],
          learnMore: "https://www.ready.gov/floods"
        },
        {
          id: "sump-pump",
          title: "Install a sump pump with backup power.",
          criticalTasks: [
            { id: "pump-1", text: "Install a sump pump in your basement or lowest floor to remove water during floods." },
            { id: "pump-2", text: "Ensure the pump discharges water at least 20 feet from your home." }
          ],
          additionalTasks: [
            { id: "pump-3", text: "Add a battery backup or generator connection in case of power outages." },
            { id: "pump-4", text: "Test the pump every few months to make sure it's working." }
          ],
          learnMore: "https://www.ready.gov/floods"
        },
        {
          id: "waterproof-storage",
          title: "Store valuables in waterproof containers.",
          criticalTasks: [
            { id: "storage-1", text: "Place documents, jewelry, and essential medications in watertight bags or bins." },
            { id: "storage-2", text: "Keep them in an easy-to-carry container near your emergency kit." }
          ],
          additionalTasks: [
            { id: "storage-3", text: "Use a waterproof/fireproof safe for irreplaceable items." },
            { id: "storage-4", text: "Make digital backups and upload to Google Drive or another secure cloud." }
          ],
          learnMore: "https://www.ready.gov/protecting-documents"
        },
        {
          id: "flood-insurance",
          title: "Buy flood insurance if you are in a flood-prone area.",
          criticalTasks: [
            { id: "insurance-1", text: "Check whether your home is in a Special Flood Hazard Area." },
            { id: "insurance-2", text: "Contact the National Flood Insurance Program (NFIP) or your insurance agent." }
          ],
          additionalTasks: [
            { id: "insurance-3", text: "Review what your policy covers (structure vs. contents)." },
            { id: "insurance-4", text: "Store your policy and claims numbers in Google Drive for quick access." },
            { id: "insurance-5", text: "Create an \"Emergency Fund\" savings account for potential out-of-pocket costs." }
          ],
          learnMore: "https://www.floodsmart.gov"
        }
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
        {
          id: "shelter-options",
          title: "Identify in-place shelter options at home, work, or school.",
          criticalTasks: [
            { id: "shelter-1", text: "Choose a small, windowless, interior room on the lowest level of your home (e.g., basement or interior bathroom)." },
            { id: "shelter-2", text: "At work or school, learn where the designated severe weather shelter areas are." }
          ],
          additionalTasks: [
            { id: "shelter-3", text: "Reinforce your chosen shelter space with extra blankets, helmets, or padding to protect from debris." },
            { id: "shelter-4", text: "Mark shelter areas clearly for all family members or coworkers." }
          ],
          learnMore: "https://www.ready.gov/tornadoes"
        },
        {
          id: "secure-home",
          title: "Secure or reinforce your home against storm damage.",
          criticalTasks: [
            { id: "secure-1", text: "Check and reinforce windows and doors; consider installing storm shutters." },
            { id: "secure-2", text: "Bring in outdoor items (furniture, trash bins, decorations) that could become projectiles." }
          ],
          additionalTasks: [
            { id: "secure-3", text: "Reinforce your roof and garage door if you live in a hurricane-prone area." },
            { id: "secure-4", text: "Trim nearby trees and branches to reduce the risk of damage." }
          ],
          learnMore: "https://www.ready.gov/hurricanes"
        },
        {
          id: "storm-supplies",
          title: "Stock emergency supplies specific to storms.",
          criticalTasks: [
            { id: "supplies-1", text: "Keep a 3-day supply of water and non-perishable food ready." },
            { id: "supplies-2", text: "Have flashlights, extra batteries, and a hand-crank radio accessible." },
            { id: "supplies-3", text: "Keep power banks and/or a generator, checked regularly to ensure they work." }
          ],
          additionalTasks: [
            { id: "supplies-4", text: "Store plastic sheeting and duct tape to temporarily cover broken windows." },
            { id: "supplies-5", text: "Include extra blankets or ponchos for warmth and protection from rain." },
            { id: "supplies-6", text: "Keep a cooler ready to preserve food." }
          ],
          learnMore: "https://www.ready.gov/kit"
        }
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
        { id: "storm-after-2", title: "Protect yourself from hazards", notes: "Shattered glass, broken wood, exposed nails, insulation, and large debris are frequent after strong winds", links: [] },
        { id: "storm-after-3", title: "Cover belongings to minimize further damage", notes: "Post-storm secondary rain is common", links: [] },
        { id: "storm-after-4", title: "If you smell gas, leave immediately", notes: "Contact the police or utilities company about a possible gas line rupture", links: [] }
      ]
    }
  };

  const toggleCheck = async (itemId: string) => {
    const newChecked = new Set(checkedItems);
    const isCompleted = !checkedItems.has(itemId);
    
    if (isCompleted) {
      newChecked.add(itemId);
    } else {
      newChecked.delete(itemId);
    }
    
    setCheckedItems(newChecked);

    if (user) {
      // Save to database for authenticated users
      try {
        if (isCompleted) {
          const { error } = await supabase
            .from('user_preparedness_progress')
            .upsert({
              user_id: user.id,
              task_id: itemId,
              completed: true
            }, {
              onConflict: 'user_id,task_id'
            });

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('user_preparedness_progress')
            .delete()
            .eq('user_id', user.id)
            .eq('task_id', itemId);

          if (error) throw error;
        }
      } catch (error) {
        console.error('Error saving progress:', error);
        toast.error('Failed to save progress');
        // Revert the change on error
        setCheckedItems(checkedItems);
      }
    } else {
      // Save to localStorage for non-authenticated users
      localStorage.setItem('prepCheckedItems', JSON.stringify(Array.from(newChecked)));
    }
  };

  const toggleOpen = (itemId: string) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(itemId)) {
      newOpen.delete(itemId);
    } else {
      newOpen.add(itemId);
    }
    setOpenItems(newOpen);
  };

  const currentChecklist = checklists[activeHazard as keyof typeof checklists];

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <img 
              src={nestorPreparedness}
              alt="Nestor with checklist - Your preparedness guide"
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-title">Prepare for an emergency.</h1>
          </div>
        </div>

        {/* Hazard Selection */}
        <div className="mb-6">
          <p className="text-body mb-4 text-center">
            If a wildfire, flood, or storm hits... <strong>are you prepared?</strong> Check off these tasks to help!
          </p>
          <p className="text-body mb-4 text-center">
            First, complete the basic prep for all types of disaster. Then, add the prep for your high-risk scenarios.
          </p>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    {phase === "now" && `Now - ${activeHazard === "all" ? "Basic prep for all disasters" : `Prepare for ${hazards.find(h => h.id === activeHazard)?.label.toLowerCase() || "disaster"}`}`}
                    {phase === "coming" && "It's Coming - Final preparations"}
                    {phase === "during" && "During - Stay safe"}
                    {phase === "after" && "Recovery - After the disaster"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {phase === "now" && (activeHazard === "all" || activeHazard === "wildfire" || activeHazard === "flood") ? (
                    // Interactive checklist for hazards with detailed structure
                    currentChecklist.now.map((section: any) => (
                      <Collapsible 
                        key={section.id} 
                        open={openItems.has(section.id)}
                        onOpenChange={() => toggleOpen(section.id)}
                      >
                        <div className="border border-border rounded-lg">
                          <CollapsibleTrigger className="w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-smooth">
                            <Checkbox
                              checked={checkedItems.has(section.id)}
                              onCheckedChange={() => toggleCheck(section.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 text-left">
                              <h4 className={`font-medium ${checkedItems.has(section.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {section.title}
                              </h4>
                            </div>
                            <ChevronDown 
                              size={16} 
                              className={`text-muted-foreground transition-transform ${openItems.has(section.id) ? 'rotate-180' : ''}`} 
                            />
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="px-4 pb-4">
                            <div className="space-y-4 ml-7">
                              {/* Critical Tasks */}
                              <div>
                                <h5 className="font-medium text-sm text-foreground mb-2">Critical items</h5>
                                <div className="space-y-2">
                                  {section.criticalTasks.map((task: any) => (
                                    <div key={task.id} className="flex items-start gap-2">
                                      <Checkbox
                                        checked={checkedItems.has(task.id)}
                                        onCheckedChange={() => toggleCheck(task.id)}
                                        className="mt-0.5"
                                      />
                                       <span className={`text-sm ${checkedItems.has(task.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                         {renderTextWithLinks(task.text)}
                                       </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Additional Tasks */}
                              <div>
                                <h5 className="font-medium text-sm text-foreground mb-2">Additional items</h5>
                                <div className="space-y-2">
                                  {section.additionalTasks.map((task: any) => (
                                    <div key={task.id} className="flex items-start gap-2">
                                      <Checkbox
                                        checked={checkedItems.has(task.id)}
                                        onCheckedChange={() => toggleCheck(task.id)}
                                        className="mt-0.5"
                                      />
                                       <span className={`text-sm ${checkedItems.has(task.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                         {renderTextWithLinks(task.text)}
                                       </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Learn More */}
                              {section.learnMore && (
                                <div className="pt-2 border-t border-border">
                                   <p className="text-xs text-muted-foreground">
                                     Learn More: <a 
                                       href={section.learnMore} 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       className="text-primary hover:underline"
                                     >
                                       {section.learnMore}
                                     </a>
                                   </p>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))
                  ) : (
                    // Original checklist for other tabs/hazards
                    currentChecklist[phase as keyof typeof currentChecklist]?.map((item: any) => (
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
                          {item.links && item.links.length > 0 && (
                            <div className="mt-2">
                              {item.links.map((link: string, index: number) => (
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
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Additional guidance message */}
        {activeTab === "now" && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold">Continue your progress:</span> review additional tasks by type and stage.
            </p>
          </div>
        )}

      </div>
      <MobileNavigation />
    </div>
  );
};

export default PreparednessPage;