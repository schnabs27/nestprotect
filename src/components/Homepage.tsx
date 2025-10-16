import { useState, useEffect } from "react";
import { CalendarIcon, Home, Calendar, Info, AlertCircle, Shield, Eye, Zap, HeartHandshake, Phone } from "lucide-react";
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
  const [showEducationalDisclaimer, setShowEducationalDisclaimer] = useState(true);
  const [searchZipCode, setSearchZipCode] = useState("");
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [show911Confirm, setShow911Confirm] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { zipCode: userZipCode, loading: locationLoading } = useUserLocation();

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

  const handle911Click = () => {
    setShow911Confirm(true);
  };

  const confirmDial911 = () => {
    window.location.href = 'tel:911';
  };

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
              I'm Nestor, your personal natural disaster guide. How can I help you protect your nest today?
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => navigate("/preparedness")}
            className="w-full h-auto py-4 bg-gradient-primary hover:opacity-90 text-left flex items-center gap-3"
          >
            <Shield className="h-6 w-6 flex-shrink-0" />
            <span className="text-base">A disaster is possible. Let's prepare.</span>
          </Button>

          <Button 
            onClick={() => navigate("/during")}
            className="w-full h-auto py-4 bg-gradient-primary hover:opacity-90 text-left flex items-center gap-3"
          >
            <Eye className="h-6 w-6 flex-shrink-0" />
            <span className="text-base">A disaster might come. Help me monitor.</span>
          </Button>

          <Button 
            onClick={() => navigate("/during")}
            className="w-full h-auto py-4 bg-gradient-primary hover:opacity-90 text-left flex items-center gap-3"
          >
            <Zap className="h-6 w-6 flex-shrink-0" />
            <span className="text-base">A disaster is coming. Time to act.</span>
          </Button>

          <Button 
            onClick={() => navigate("/after")}
            className="w-full h-auto py-4 bg-gradient-primary hover:opacity-90 text-left flex items-center gap-3"
          >
            <HeartHandshake className="h-6 w-6 flex-shrink-0" />
            <span className="text-base">A disaster came. I need assistance and supplies.</span>
          </Button>

          <Button 
            onClick={handle911Click}
            className="w-full h-auto py-4 bg-red-600 hover:bg-red-700 text-white text-left flex items-center gap-3"
          >
            <Phone className="h-6 w-6 flex-shrink-0" />
            <span className="text-base font-semibold">Help! I'm hurt, lost or stuck! Dial 911!</span>
          </Button>
        </div>

        {/* 911 Confirmation Dialog */}
        {show911Confirm && (
          <Card className="bg-red-50 border-red-300 shadow-lg">
            <CardContent className="p-4 space-y-3 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
              <p className="text-lg font-semibold text-red-900">Do you want to dial 911?</p>
              <div className="flex gap-3">
                <Button 
                  onClick={confirmDial911}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Yes, Dial 911
                </Button>
                <Button 
                  onClick={() => setShow911Confirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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