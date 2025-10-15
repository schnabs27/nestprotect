import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
 * - Hazard filter buttons (All, Wildfire, Flood, etc)
 * - Expandable checklist sections with critical and additional tasks
 * 
 * DATA ORGANIZATION:
 * The `checklists` object contains all tasks:
 *   checklists[hazardType] = array of checklist sections
 *   - hazardType: "all", "wildfire", "flood", "storm"
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
const navigate = useNavigate();
const [assessmentScore, setAssessmentScore] = useState(0);
const assessmentTotalItems = 8;

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

  // Fetch assessment score for authenticated users
useEffect(() => {
  const fetchAssessmentScore = async () => {
    if (!user) {
      const score = parseInt(localStorage.getItem('selfAssessmentScore') || '0');
      setAssessmentScore(score);
      return;
    }

    try {
      const { data: assessmentData } = await supabase
        .from('user_assessments')
        .select('score')
        .eq('user_id', user.id)
        .maybeSingle();

      if (assessmentData) {
        setAssessmentScore(assessmentData.score);
      } else {
        const score = parseInt(localStorage.getItem('selfAssessmentScore') || '0');
        setAssessmentScore(score);
      }
    } catch (error) {
      console.error('Error fetching assessment score:', error);
      const score = parseInt(localStorage.getItem('selfAssessmentScore') || '0');
      setAssessmentScore(score);
    }
  };

  fetchAssessmentScore();
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
      ],
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
            Check off these tasks. When an emergency alerts, you'll be ready!
          </p>

{/* Self-Assessment Card */}
<Card className="shadow-soft bg-gradient-purple border-purple-600 mb-4">
  <CardHeader className="pb-1  pt-2">
    <CardTitle className="text-lg text-white text-center">How ready are you?</CardTitle>
  </CardHeader>
  <CardContent className="space-y-1 pt-1 pb-3">
    <div className="text-center">
      <Button 
        onClick={() => navigate("/self-assessment")}
        className="bg-white hover:bg-gray-100 text-black px-8"
        size="lg"
      >
        Take Nestor's Readiness Test
      </Button>
    </div>
    <div className="text-center">
      <div className="text-sm text-white">
        Your current score: <span className="font-bold">{assessmentScore}/{assessmentTotalItems}</span>
      </div>
    </div>
  </CardContent>
</Card>
        </div>
{/* Now Checklist */}
        <Card className="shadow-soft">
          <CardContent className="space-y-1 pt-3 mb-1">
              <CardHeader className="pt-1">
    <CardTitle className="text-lg text-center">The Basics</CardTitle>
    <p className="text-body text-center">
            This basic prep applies to all disaster scenarios.
          </p>
  </CardHeader>
                  {(activeHazard === "all" || activeHazard === "wildfire" || activeHazard === "flood" || activeHazard === "storm") ? (
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
                  ) : null}
                </CardContent>
              </Card>

      </div>
      <MobileNavigation />
    </div>
  );
};

export default PreparednessPage;