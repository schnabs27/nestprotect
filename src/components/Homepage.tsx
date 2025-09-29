import { useState, useEffect } from "react";
import { CalendarIcon, Home, Calendar, Info } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import MobileNavigation from "@/components/MobileNavigation";

const Homepage = () => {
  const [completionDate, setCompletionDate] = useState<Date>();
  const [prepProgress, setPrepProgress] = useState({ completed: 0, total: 10 });
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [showEducationalDisclaimer, setShowEducationalDisclaimer] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch preparedness progress for authenticated users
  useEffect(() => {
    const fetchPrepProgress = async () => {
      if (!user) {
        setPrepProgress({ completed: 0, total: 10 });
        return;
      }

      try {
        const allNowToplineItems = ['know-risk', 'household-plan', 'emergency-kit', 'go-bags', 'important-documents', 'shelter-plan', 'communication-plan', 'financial-prep', 'special-needs', 'practice-plan'];
        
        const { data: progressData } = await supabase
          .from('user_preparedness_progress')
          .select('task_id, completed')
          .eq('user_id', user.id)
          .in('task_id', allNowToplineItems);

        const completedTasks = progressData?.filter(item => item.completed).length || 0;
        setPrepProgress({ completed: completedTasks, total: allNowToplineItems.length });
      } catch (error) {
        console.error('Error fetching prep progress:', error);
        setPrepProgress({ completed: 0, total: 10 });
      }
    };

    fetchPrepProgress();
  }, [user]);

  // Fetch assessment score for authenticated users
  useEffect(() => {
    const fetchAssessmentScore = async () => {
      if (!user) {
        // For non-authenticated users, use localStorage as fallback
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
          // Fallback to localStorage if no database record
          const score = parseInt(localStorage.getItem('selfAssessmentScore') || '0');
          setAssessmentScore(score);
        }
      } catch (error) {
        console.error('Error fetching assessment score:', error);
        // Fallback to localStorage
        const score = parseInt(localStorage.getItem('selfAssessmentScore') || '0');
        setAssessmentScore(score);
      }
    };

    fetchAssessmentScore();
  }, [user]);

  const assessmentTotalItems = 8; // Total assessment statements (matches SelfAssessmentPage)

  const getDaysUntilDate = () => {
    if (!completionDate) return null;
    const days = differenceInDays(completionDate, new Date());
    return Math.max(0, days);
  };

  const daysRemaining = getDaysUntilDate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Nestor Introduction */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <img 
              src="/lovable-uploads/564fda98-1db0-44eb-97de-a693f9254dea.png" 
              alt="Nestor - Your disaster preparedness guide"
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-title">Hi, glad to see you!</h1>
            <p className="text-muted-foreground">
              I'm here to guide you through basic natural disaster prep. Let's see how you're doing.
            </p>
          </div>
        </div>

        {/* Scoreboards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Self-Assessment Scoreboard */}
          <Card className="shadow-soft bg-gradient-purple border-purple-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white text-center">Self-Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {assessmentScore}/{assessmentTotalItems}
                </div>
                <p className="text-sm text-purple-100">Statements marked true</p>
              </div>
              <Button 
                onClick={() => navigate("/self-assessment")}
                className="w-full bg-white hover:bg-gray-100 text-black"
              >
                Take Self-Assessment
              </Button>
            </CardContent>
          </Card>

          {/* Prep Scoreboard */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-title text-center">Emergency Prep Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {prepProgress.completed}/{prepProgress.total}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <p className="text-sm text-muted-foreground">Basic prep tasks completed</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tasks listed in the "do these now" stage for all types of disaster.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/preparedness")}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                Continue Emergency Prep
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Completion Date Goal */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-title text-center">
              Emergency Prep Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  I want to complete my emergency prep by:
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !completionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {completionDate ? format(completionDate, "PPP") : "Pick a date"}
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
                  <a 
                    href="https://calendar.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary/80 underline"
                  >
                    Create a reminder (Google Calendar)
                  </a>
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
          </CardContent>
        </Card>

        {/* Add to Phone Button */}
        <div className="text-center pt-4">
          <Button 
            onClick={() => navigate("/shortcut")}
            className="w-full bg-gradient-phone hover:opacity-90 text-white"
          >
            Add NestProtect to Your Phone
          </Button>
        </div>

        {/* Educational Disclaimer */}
        {showEducationalDisclaimer && (
          <Card className="bg-white shadow-soft">
            <CardContent className="p-4 space-y-3">
              <p className="text-foreground text-sm leading-relaxed">
                The NestProtect app is for education only. Emergencies are serious. Contact 911 if you think you might be in danger.
              </p>
              <div className="text-center">
                <Button 
                  onClick={() => setShowEducationalDisclaimer(false)}
                  variant="outline"
                  className="w-full"
                >
                  I understand
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <MobileNavigation />
    </div>
  );
};

export default Homepage;