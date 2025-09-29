import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Shield, Users, Clock, Map, LifeBuoy, Sun, AlertTriangle, Home, Copy } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import nestprotectLogo from "@/assets/nestprotect-logo.png";

interface AuthPageProps {
  onAuthSuccess: () => void;
  onGuestAccess: () => void;
}

const AuthPage = ({ onAuthSuccess, onGuestAccess }: AuthPageProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number>(0);
  const [suggestedPassword, setSuggestedPassword] = useState<string>("");
  const [riskData, setRiskData] = useState<{risk_rating?: string, high_risks?: string} | null>(null);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_count');
        if (error) throw error;
        setUserCount(data || 0);
      } catch (err) {
        console.error('Error fetching user count:', err);
      }
    };

    fetchUserCount();

    // Set up real-time subscription for user count updates
    const channel = supabase
      .channel('user-count-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchUserCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            zip_code: zipCode
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        toast.success("Account created! Please check your email and click the verification link before signing in.");
        setError("Please check your email and click the verification link before you can sign in.");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          setError("Invalid email or password. If you just signed up, please check your email and click the verification link first.");
        } else {
          setError(error.message);
        }
      } else {
        onAuthSuccess();
        navigate("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    // Generate secure 12-character password
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + digits + symbols;
    
    // Ensure at least one character from each category
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill remaining 8 characters randomly
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    const shuffled = password.split('').sort(() => Math.random() - 0.5).join('');
    setSuggestedPassword(shuffled);
  };

  const copyAndUsePassword = async () => {
    if (suggestedPassword) {
      setPassword(suggestedPassword);
      try {
        await navigator.clipboard.writeText(suggestedPassword);
        toast.success('Password copied to clipboard and filled in!');
      } catch (err) {
        toast.success('Password filled in!');
      }
    }
  };

  // Risk assessment function

  const handleRiskCheck = async () => {
    if (zipCode.length !== 5) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('zips_with_risks')
        .select('risk_rating, high_risks')
        .eq('zipcode', parseInt(zipCode))
        .maybeSingle();

      if (error) {
        console.error('Error fetching risk data:', error);
        toast.error('Unable to find risk data for this zip code');
        setRiskData(null);
      } else if (data) {
        setRiskData(data);
        toast.success('Risk data found!');
      } else {
        toast.error('No risk data found for this zip code');
        setRiskData(null);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('An error occurred while fetching risk data');
      setRiskData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom, #0080e0, #00d2bc)' }}>
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Branding */}
        <div className="text-center space-y-0.5">
          <img 
            src={nestprotectLogo} 
            alt="NestProtect Logo" 
            className="w-90 h-90 object-contain mx-auto"
          />
          <div className="px-8">
            <h1 className="text-3xl font-bold text-white">NestProtect</h1>
            <p className="text-white mt-2">Natural disasters like storms, floods, and wildfires happen. Let Nestor help you protect your nest.</p>
          </div>
        </div>

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
              Are you at risk?
            </h3>
            <p className="mb-4 leading-relaxed" style={{ color: '#4b5563' }}>
              FEMA predicts disaster by county. Are you ready?
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Zipcode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  maxLength={5}
                  pattern="[0-9]{5}"
                  className="flex-1"
                />
                <Button 
                  onClick={handleRiskCheck}
                  disabled={loading || zipCode.length !== 5}
                  style={{
                    background: 'linear-gradient(135deg, #b416ff 0%, #0080e0 100%)',
                    color: 'white'
                  }}
                >
                  What's my risk?
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

        {/* Value Proposition */}
        <Card className="border-0 shadow-lg">
          <CardContent className="space-y-4 pt-6">
            <p className="text-gray-700 text-center leading-tight">
              Nestor learned the hard way that natural disasters can change everything FAST. Now you can use Nestor's guides and tools to be better prepared.
            </p>
            <div className="w-full">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="text-right pr-4 py-3">
                      <span className="text-lg font-bold text-gray-900">BEFORE</span>
                    </td>
                    <td className="text-left pl-4 py-3">
                      <span className="text-gray-700">
                        <span className="font-bold" style={{ color: '#0080e0' }}>Are you prepared? Take Nestor's quiz.</span> Then prep more with checklists.
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="text-right pr-4 py-3">
                      <span className="text-lg font-bold text-gray-900">DURING</span>
                    </td>
                    <td className="text-left pl-4 py-3">
                      <span className="text-gray-700">Get real-time weather and traffic conditions plus guidance to act quickly.</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-right pr-4 py-3">
                      <span className="text-lg font-bold text-gray-900">AFTER</span>
                    </td>
                    <td className="text-left pl-4 py-3">
                      <span className="text-gray-700">Use easy search and AI tools to find resources to help you recover.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Tabs */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your email is used for account security, not marketing.
                    </p>
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="New Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={12}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 12 characters. {" "}
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Suggest password.
                      </button>
                    </p>
                    {suggestedPassword && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border">
                        <p className="text-xs text-gray-600 mb-1">Suggested password:</p>
                        <div className="flex items-center gap-2">
                          <code 
                            className="text-sm font-mono bg-white px-2 py-1 rounded border flex-1 cursor-pointer hover:bg-gray-100"
                            onClick={copyAndUsePassword}
                          >
                            {suggestedPassword}
                          </code>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={copyAndUsePassword}
                            className="text-xs px-2 py-1 h-auto"
                          >
                            Use This
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <Input
                      type="text"
                      placeholder="Zip Code (optional)"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      maxLength={5}
                      pattern="[0-9]{5}"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Helps for your weather, alerts, and local resource search
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google Sign In */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            {/* Having trouble link */}
            <div className="text-center mt-4">
              <ContactForm>
                <button className="text-sm text-gray-600 hover:text-gray-800 underline">
                  Having trouble?
                </button>
              </ContactForm>
            </div>

          </CardContent>
        </Card>

        {/* About NestProtect */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                About NestProtect
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                NestProtect is a free and privacy-focused app by Blue Sky Disaster Relief, a 501(c)(3) non-profit helping people affected by natural disasters.
              </p>
            </div>
            <div className="mt-4">
              <Button 
                onClick={() => navigate("/about")}
                className="w-full text-white font-medium"
                style={{
                  background: 'linear-gradient(135deg, #0080e0 0%, #00d2bc 100%)'
                }}
              >
                View Details and Screenshots
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500">
          By using NestProtect, you agree to our{" "}
          <a 
            href="/terms" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            terms of service
          </a>{" "}
          and{" "}
          <a 
            href="/privacy" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            privacy policy
          </a>
          .
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          © 2025 www.blueskynow.org
        </p>
      </div>
    </div>
  );
};

export default AuthPage;