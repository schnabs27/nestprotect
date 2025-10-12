import { useState, useEffect } from "react";
import { CalendarIcon, Home, Calendar, Info } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserLocation } from "@/hooks/useUserLocation";
import MobileNavigation from "@/components/MobileNavigation";

const Homepage = () => {
  const [completionDate, setCompletionDate] = useState<Date>();
  const [prepProgress, setPrepProgress] = useState({ completed: 0, total: 10 });
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [showEducationalDisclaimer, setShowEducationalDisclaimer] = useState(true);
  const [searchZipCode, setSearchZipCode] = useState("");
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { zipCode: userZipCode, loading: locationLoading } = useUserLocation();

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

  // Build FEMA URL when zip code is available and auto-fetch risk data
  useEffect(() => {
    if (userZipCode) {
      setSearchZipCode(userZipCode);
      // Auto-fetch risk data for user's zip code
      fetchRiskData(userZipCode);
    }
  }, [userZipCode]);

  // Fetch risk data function
  const fetchRiskData = async (zip: string) => {
    if (zip.length !== 5) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('zips_with_risks')
        .select('risk_rating, high_risks')
        .eq('zipcode', zip)
        .single();

      if (error) throw error;
      
      setRiskData(data);
    } catch (error) {
      console.error('Error fetching risk data:', error);
      setRiskData(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle risk check
  const handleRiskCheck = async () => {
    if (searchZipCode.length !== 5) return;
    fetchRiskData(searchZipCode);
  };

  const assessmentTotalItems = 8;

  const getDaysUntilDate = () => {
    if (!completionDate) return null;
    const days = differenceInDays(completionDate, new Date());
    return Math.max(0, days);
  };

  const daysRemaining = getDaysUntilDate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Educational Disclaimer */}
        {showEducationalDisclaimer && (
          <Card className="bg-white shadow-soft">
            <CardContent className="p-4 space-y-3 text-center">
              <p className="text-muted-foreground text-sm leading-relaxed">
                The NestProtect app is for education only. Emergencies are serious. Contact 911 if you think you might be in danger.
              </p>
              <Button 
                onClick={() => setShowEducationalDisclaimer(false)}
                variant="outline"
                className="w-full bg-yellow-100 text-black hover:bg-yellow-200"
              >
                I understand! Dismiss!
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Nestor Introduction */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <img 
              src="/images/564fda98-1db0-44eb-97de-a693f9254dea.png" 
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
                <p className="text-sm text-purple-100">Keep prepping until you get 8 out of 8!</p>
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
                  <p className="text-sm text-muted-foreground">Do you have the 10 basics done?</p>
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
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
                        toast({
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

        {/* Risk Assessment Card */}
        <Card className="border-0 shadow-lg overflow-hidden" style={{
          background: 'white',
          border: '2px solid transparent',
          backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #b416ff 0%, #0080e0 100%)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box'
        }}>
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-3" style={{ color: '#7f1baf' }}>
              Prepare for Your Risks
            </h3>
            <p className="mb-4 leading-relaxed" style={{ color: '#4b5563' }}>
              FEMA has tracked these risks in your area.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Zipcode"
                  value={searchZipCode}
                  onChange={(e) => setSearchZipCode(e.target.value)}
                  maxLength={5}
                  pattern="[0-9]{5}"
                  className="flex-1"
                />
                <Button 
                  onClick={handleRiskCheck}
                  disabled={loading || searchZipCode.length !== 5}
                  style={{
                    background: 'linear-gradient(135deg, #b416ff 0%, #0080e0 100%)',
                    color: 'white'
                  }}
                >
                  Search Risks by Zipcode
                </Button>
              </div>
              
              {riskData && (
                <div className="mt-4 space-y-2">
                  <div>
                    <span style={{ color: '#4b5563' }}>Risk Rating: </span>
                    <span style={{ color: '#7f1baf' }} className="font-semibold">
                      {riskData.risk_rating || 'Not available'}
                    </span>
                  </div>
                  {riskData.high_risks && (
                    <div>
                      <span style={{ color: '#4b5563' }}>High Risks: </span>
                      <span style={{ color: '#7f1baf' }} className="font-semibold">
                        {riskData.high_risks}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add to Phone Card */}
        <Card className="shadow-soft bg-gradient-phone">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-center">
              <img 
                src="/images/nestprotect-add-to-phone.png" 
                alt="Add to Phone image"
                className="object-contain"
                style={{ width: '150px', height: '150px' }}
              />
            </div>
            <Button 
              onClick={() => navigate("/shortcut")}
              className="w-full bg-white text-black hover:bg-gray-100"
            >
              Add NestProtect to Your Phone
            </Button>
          </CardContent>
        </Card>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default Homepage;