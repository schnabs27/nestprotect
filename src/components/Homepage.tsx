import { useState, useEffect } from "react";
import { CalendarIcon, Home, Calendar, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import MobileNavigation from "@/components/MobileNavigation";

const Homepage = () => {
  const [completionDate, setCompletionDate] = useState<Date>();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [prepProgress, setPrepProgress] = useState({ completed: 0, total: 10 });
  const [assessmentScore, setAssessmentScore] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Show disclaimer dialog when user signs in
  useEffect(() => {
    if (user) {
      const hasSeenDisclaimer = sessionStorage.getItem(`disclaimer-seen-${user.id}`);
      if (!hasSeenDisclaimer) {
        setShowDisclaimer(true);
      }
    }
  }, [user]);

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

  const handleDisclaimerAccept = () => {
    if (user) {
      sessionStorage.setItem(`disclaimer-seen-${user.id}`, 'true');
    }
    setShowDisclaimer(false);
  };

  const assessmentTotalItems = 8; // Total assessment statements (matches SelfAssessmentPage)

  const getDaysUntilDate = () => {
    if (!completionDate) return null;
    const days = differenceInDays(completionDate, new Date());
    return Math.max(0, days);
  };

  const daysRemaining = getDaysUntilDate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Disclaimer Dialog */}
      <Dialog open={showDisclaimer} onOpenChange={() => {}}>
        <DialogContent className="max-w-md bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-400 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-amber-500 rounded-full">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-amber-900">
              Disclaimer
            </DialogTitle>
            <DialogDescription className="text-center text-amber-800 leading-relaxed">
              This app provides educational disaster preparedness information only and is not a comprehensive expert resource. For more comprehensive support, please conduct your own resource searches, contact local emergency responders and consult your insurance company for complete guidance tailored to your specific situation and location.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleDisclaimerAccept}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3"
            >
              I understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                <p className="text-sm text-muted-foreground">Prep tasks completed "Now" for all types of disaster</p>
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


        {/* About NestProtect */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-title text-center">About NestProtect™</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Leo, a high school student, created Blue Sky Disaster Relief and the NestProtect app 
              to give people free disaster relief resources. They're the tools his family needed 
              when their home was hit by a tornado. So please use and share!
            </p>
            <p>
              The NestProtect app is focused on data privacy. Recommendations include Google tools 
              because they are free and offer privacy, but please use the tools you prefer.
            </p>
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
      </div>
      <MobileNavigation />
    </div>
  );
};

export default Homepage;