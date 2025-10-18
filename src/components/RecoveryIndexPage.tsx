import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown, Calendar } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import nestorPreparedness from '@/assets/nestor-preparedness.png';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import MobileNavigation from "@/components/MobileNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

interface ChecklistTask {
  id: string;
  task_key: string;
  section_id: string;
  task_description: string;
  is_critical: boolean;
  sort_order: number;
}

interface ChecklistSection {
  id: string;
  section_key: string;
  title: string;
  hazard_type: string;
  phase: string;
  learn_more_url: string | null;
  sort_order: number;
}

const PreparednessPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { toast: toastHook } = useToast();
  const [activeHazard, setActiveHazard] = useState("all");
  const [activeTab, setActiveTab] = useState("now");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [completionDate, setCompletionDate] = useState<Date>();

  const getDaysUntilDate = () => {
    if (!completionDate) return null;
    const days = differenceInDays(completionDate, new Date());
    return Math.max(0, days);
  };

  const daysRemaining = getDaysUntilDate();

  // Load sections and tasks from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('checklist_sections')
          .select('*')
          .order('sort_order', { ascending: true });

        if (sectionsError) throw sectionsError;

        // Load tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('checklist_tasks')
          .select('*')
          .order('sort_order', { ascending: true });

        if (tasksError) throw tasksError;

        setSections(sectionsData || []);
        setTasks(tasksData || []);
      } catch (error) {
        console.error('Error loading checklist data:', error);
        toast.error('Failed to load checklist data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load user progress from database or localStorage
  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('prep_task_user_state')
            .select('task_id, is_checked')
            .eq('user_id', user.id)
            .eq('is_checked', true);

          if (error) throw error;

          const completedTasks = new Set(data?.map(item => item.task_id) || []);
          setCheckedItems(completedTasks);
        } catch (error) {
          console.error('Error loading progress:', error);
          toast.error('Failed to load your progress');
          const saved = localStorage.getItem('prepCheckedItems');
          setCheckedItems(saved ? new Set(JSON.parse(saved)) : new Set());
        }
      } else {
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

  const toggleCheck = async (itemId: string) => {
    const previousChecked = new Set(checkedItems);
    const newChecked = new Set(checkedItems);
    const isCompleted = !checkedItems.has(itemId);
    
    if (isCompleted) {
      newChecked.add(itemId);
    } else {
      newChecked.delete(itemId);
    }
    
    setCheckedItems(newChecked);

    if (user) {
      try {
        if (isCompleted) {
          const { error } = await supabase
            .from('prep_task_user_state')
            .upsert({
              user_id: user.id,
              task_id: itemId,
              is_checked: true
            }, {
              onConflict: 'user_id,task_id'
            });

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('prep_task_user_state')
            .delete()
            .eq('user_id', user.id)
            .eq('task_id', itemId);

          if (error) throw error;
        }
      } catch (error) {
        console.error('Error saving progress:', error);
        toast.error('Failed to save progress');
        setCheckedItems(previousChecked);
      }
    } else {
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

  // Check if a section is fully completed
  const isSectionCompleted = (sectionId: string) => {
    const sectionTasks = tasks.filter(t => t.section_id === sectionId);
    if (sectionTasks.length === 0) return false;
    return sectionTasks.every(task => checkedItems.has(task.id));
  };

  // Filter sections based on active hazard and phase
  const filteredSections = sections.filter(section => {
    if (section.phase !== activeTab) return false;
    if (activeHazard === "all") return section.hazard_type === "all";
    return section.hazard_type === activeHazard;
  });

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
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading checklist...</p>
              </div>
            ) : filteredSections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No checklist items found</p>
              </div>
            ) : (
              filteredSections.map((section) => {
                const sectionTasks = tasks.filter(t => t.section_id === section.id);
                const criticalTasks = sectionTasks.filter(t => t.is_critical);
                const additionalTasks = sectionTasks.filter(t => !t.is_critical);
                const sectionCompleted = isSectionCompleted(section.id);

                return (
                  <Collapsible 
                    key={section.id} 
                    open={openItems.has(section.id)}
                    onOpenChange={() => toggleOpen(section.id)}
                  >
                    <div className="border border-border rounded-lg">
                      <CollapsibleTrigger className="w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-smooth">
                        <Checkbox
                          checked={sectionCompleted}
                          onCheckedChange={() => {
                            // Toggle all tasks in section
                            const allTaskIds = sectionTasks.map(t => t.id);
                            if (sectionCompleted) {
                              // Uncheck all
                              allTaskIds.forEach(id => {
                                if (checkedItems.has(id)) toggleCheck(id);
                              });
                            } else {
                              // Check all
                              allTaskIds.forEach(id => {
                                if (!checkedItems.has(id)) toggleCheck(id);
                              });
                            }
                          }}
                          className="mt-0.5"
                        />
                        <div className="flex-1 text-left">
                          <h4 className={`font-medium ${sectionCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
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
                          {criticalTasks.length > 0 && (
                            <div>
                              <h5 className="font-medium text-sm text-foreground mb-2">Critical items</h5>
                              <div className="space-y-2">
                                {criticalTasks.map((task) => (
                                  <div key={task.id} className="flex items-start gap-2">
                                    <Checkbox
                                      checked={checkedItems.has(task.id)}
                                      onCheckedChange={() => toggleCheck(task.id)}
                                      className="mt-0.5"
                                    />
                                    <span className={`text-sm ${checkedItems.has(task.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                      {renderTextWithLinks(task.task_description)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Additional Tasks */}
                          {additionalTasks.length > 0 && (
                            <div>
                              <h5 className="font-medium text-sm text-foreground mb-2">Additional items</h5>
                              <div className="space-y-2">
                                {additionalTasks.map((task) => (
                                  <div key={task.id} className="flex items-start gap-2">
                                    <Checkbox
                                      checked={checkedItems.has(task.id)}
                                      onCheckedChange={() => toggleCheck(task.id)}
                                      className="mt-0.5"
                                    />
                                    <span className={`text-sm ${checkedItems.has(task.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                      {renderTextWithLinks(task.task_description)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Learn More */}
                          {section.learn_more_url && (
                            <div className="pt-2 border-t border-border">
                              <p className="text-xs text-muted-foreground">
                                Learn More: <a 
                                  href={section.learn_more_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-primary hover:underline"
                                >
                                  {section.learn_more_url}
                                </a>
                              </p>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Completion Date Goal */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-title text-center">
              Prep and Practice!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Make a plan. Don't wait for an emergency!
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-center text-center font-normal",
                        !completionDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {completionDate ? format(completionDate, "PPP") : "My deadline to be prepared"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={completionDate}
                      onSelect={setCompletionDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <div className="mt-2 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!completionDate) {
                        toastHook({
                          title: "Please select a date first",
                          description: "Choose your emergency prep completion date above",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      const startDate = new Date(completionDate);
                      startDate.setHours(10, 0, 0);
                      const endDate = new Date(startDate);
                      endDate.setHours(11, 0, 0);
                      
                      const formatGoogleDate = (date: Date) => {
                        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                      };
                      
                      const details = encodeURIComponent(
                        "You can't schedule your emergencies. But you can prepare for them. Protect your home, loved ones, and valuables before a disaster. Use NestProtect to help: https://nestprotect.app/."
                      );
                      
                      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Complete Disaster Prep')}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${details}`;
                      
                      window.open(googleCalendarUrl, '_blank');
                    }}
                    className="w-full bg-black text-white hover:bg-gray-700"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Add to Google Calendar
                  </Button>
                </div>
              </div>
              
              {daysRemaining !== null && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {daysRemaining}
                  </div>
                  <p className="text-sm text-muted-foreground">days remaining</p>
                </div>
              )}
            </div>

            {daysRemaining !== null && (
              <div className="flex justify-center pt-4">
                <img 
                  src="/images/giffy-countdown.gif" 
                  alt="Countdown timer animation"
                  className="object-contain"
                  style={{ width: '400px', height: '181px' }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default PreparednessPage;