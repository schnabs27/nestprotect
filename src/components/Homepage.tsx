import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserLocation } from "@/hooks/useUserLocation";
import MobileNavigation from "@/components/MobileNavigation";

const Homepage = () => {
  const [prepProgress, setPrepProgress] = useState({ completed: 0, total: 10 });
  const [assessmentScore, setAssessmentScore] = useState(0);
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
        .eq('zipcode', parseInt(zip))
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 space-y-4">
 
        {/* Nestor Introduction */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <img 
              src="/images/nestprotect-crystal-ball.gif" 
              alt="Nestor sees disaster in the future through a crystal ball"
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-title">A disaster may be in your future.</h1>
            <p className="text-muted-foreground">
              How you prepare now can make all the difference.
            </p>
          </div>
        </div>

{/* Risk Assessment Card */}
        <Card className="shadow-soft">
          <CardContent className="p-6 text-center">
            <CardTitle className="text-lg text-title text-center">Your Risks</CardTitle>
            <p className="mb-4 leading-relaxed" style={{ color: '#4b5563' }}>
              Your area has had these risks in the past, according to FEMA.
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
                    background: 'linear-gradient(135deg, #efefef 0%, #efefef 100%)',
                    color: 'black'
                  }}
                >
                  Search Risks by Zipcode
                </Button>
              </div>
              
              {riskData && (
                <div className="mt-4 space-y-2">
                  <div>
                    <span style={{ color: '#4b5563' }}>Risk Rating: </span>
                    <span style={{ color: '#0162e8' }} className="font-semibold">
                      {riskData.risk_rating || 'Not available'}
                    </span>
                  </div>
                  {riskData.high_risks && (
                    <div>
                      <span style={{ color: '#4b5563' }}>High Risks: </span>
                      <span style={{ color: '#0162e8' }} className="font-semibold">
                        {riskData.high_risks}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scoreboards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Prep Scoreboard */}
          <Card className="shadow-soft">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg text-title text-center">Your Readiness Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-center">
                <div className="text-3xl font-bold text-title">
                  {assessmentScore}/{assessmentTotalItems}
                </div>
                <div className="flex items-center justify-center gap-1 pt-2 pb-2">
                  <p className="text-sm text-muted-foreground">According to my crystal ball, you could use more prep.</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/self-assessment")}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                Take Nestor's Readiness Test
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>

              {/* Settings Link */}
        <div className="text-center pb-4">
          <a
            href="/settings"
            className="text-primary hover:text-primary/80 underline text-sm"
          >
            Go to Account Settings
          </a>
        </div>

      <MobileNavigation />
    </div>
  );
};

export default Homepage;