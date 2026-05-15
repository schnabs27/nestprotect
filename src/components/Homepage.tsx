import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sanitizeZipCode, rateLimiter } from "@/utils/security";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { fetchZipRisk } from '@/lib/offlineCache';
import { useToast } from "@/hooks/use-toast";
import { useUserLocation } from "@/hooks/useUserLocation";
import MobileNavigation from "@/components/MobileNavigation";
import { Link } from "react-router-dom";

const Homepage = () => {
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isEditingZip, setIsEditingZip] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [zipError, setZipError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { zipCode: userZipCode, loading: locationLoading, updateZipCode } = useUserLocation();

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

  // Auto-fetch risk data when zip code changes
  useEffect(() => {
    if (userZipCode) {
      fetchRiskData(userZipCode);
    }
  }, [userZipCode]);

  // Fetch risk data function
  const fetchRiskData = async (zip: string) => {
    if (zip.length !== 5) return;
    
    setLoading(true);
    try {
      const { data, error } = await fetchZipRisk(zip);

      if (error) throw error;

      setRiskData(data);
    } catch (error) {
      console.error('Error fetching risk data:', error);
      setRiskData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleZipUpdate = async () => {
    const clientId = 'zip_update_' + (navigator.userAgent?.slice(0, 50) || 'unknown');
    if (!rateLimiter.isAllowed(clientId, 10, 60000)) {
      setZipError("Too many attempts. Please wait before updating your ZIP code again.");
      return;
    }
    const sanitized = sanitizeZipCode(zipInput);
    if (!/^[0-9]{5}$/.test(sanitized)) {
      setZipError("Please enter a 5-digit US zip code.");
      return;
    }
    try {
      await updateZipCode(sanitized);
      setIsEditingZip(false);
      setZipError("");
    } catch {
      setZipError("Failed to update ZIP code. Please try again.");
    }
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
        
        {/* Zip Code Card */}
        <div
          className="rounded-lg shadow-soft p-6 text-center space-y-3"
          style={{ background: 'linear-gradient(to bottom, #0162e8, #770bda)' }}
        >
          <p className="text-white text-sm">Tailor risks and resources to your zip code:</p>
          {isEditingZip ? (
            <>
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className="w-36 text-center text-4xl rounded-xl px-4 py-2 bg-white outline-none border-none"
                  style={{ fontWeight: 800 }}
                  autoFocus
                />
              </div>
              {zipError && <p className="text-white text-xs">{zipError}</p>}
              <button onClick={handleZipUpdate} className="text-white underline text-sm">
                Update
              </button>
            </>
          ) : (
            <>
              <div
                className="inline-block bg-white rounded-xl px-6 py-2 cursor-pointer"
                onClick={() => { setZipInput(userZipCode || '78028'); setIsEditingZip(true); setZipError(''); }}
              >
                <span className="text-4xl" style={{ fontWeight: 800 }}>
                  {userZipCode || '78028'}
                </span>
              </div>
              <br />
              <button
                onClick={() => { setZipInput(userZipCode || '78028'); setIsEditingZip(true); setZipError(''); }}
                className="text-white underline text-sm"
              >
                Update
              </button>
            </>
          )}
        </div>

        {/* Scoreboards */}
        <div className="grid gap-4 md:grid-cols-2">
{/* Risk Assessment Card */}
        <Card className="shadow-soft">
          <CardContent className="p-6 text-center">
            <CardTitle className="text-lg text-title text-center">Your Risks</CardTitle>
            <p className="mb-4 leading-relaxed" style={{ color: '#4b5563' }}>
              Your area has had these risks in the past, according to FEMA.
            </p>
            
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
          </CardContent>
        </Card>

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

 <div className="text-center pb-4">
  <Link
    to="/settings"
    className="text-primary hover:text-primary/80 underline text-sm"
  >
    Go to Account Settings
  </Link>
</div>

      <MobileNavigation />
    </div>
  );
};

export default Homepage;