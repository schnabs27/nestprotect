import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface AuthPageProps {
  onAuthSuccess: () => void;
  onGuestAccess: () => void;
}

const TRUST_PILLS = [
  { value: "Free",      label: "Forever — non-profit" },
  { value: "Private",   label: "No personal data sold or shared" },
  { value: "17",        label: "Risk types covered" },
  { value: "501(c)(3)", label: "Blue Sky Disaster Relief" },
];

const DATA_SOURCES = ["FEMA", "Red Cross", "HUD", "Google Business", "OpenAI"];

const AuthPage = ({ onAuthSuccess, onGuestAccess }: AuthPageProps) => {
  const navigate = useNavigate();
  const [email, setEmail]                         = useState("");
  const [password, setPassword]                   = useState("");
  const [zipCode, setZipCode]                     = useState("");
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState<string | null>(null);
  const [suggestedPassword, setSuggestedPassword] = useState("");
  const [riskData, setRiskData]                   = useState<{ risk_rating?: string; high_risks?: string } | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "Invalid email or password. If you just signed up, please check your email and click the verification link first."
            : error.message
        );
      } else {
        onAuthSuccess();
        navigate("/");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { zip_code: zipCode },
        },
      });
      if (error) {
        setError(error.message);
      } else {
        toast.success("Account created! Please check your email and click the verification link before signing in.");
        setError("Please check your email and click the verification link before you can sign in.");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) setError(error.message);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const lower   = "abcdefghijklmnopqrstuvwxyz";
    const upper   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits  = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const all     = lower + upper + digits + symbols;
    let pw = lower[Math.floor(Math.random() * lower.length)]
           + upper[Math.floor(Math.random() * upper.length)]
           + digits[Math.floor(Math.random() * digits.length)]
           + symbols[Math.floor(Math.random() * symbols.length)];
    for (let i = 4; i < 12; i++) pw += all[Math.floor(Math.random() * all.length)];
    setSuggestedPassword(pw.split("").sort(() => Math.random() - 0.5).join(""));
  };

  const copyAndUsePassword = async () => {
    if (!suggestedPassword) return;
    setPassword(suggestedPassword);
    try {
      await navigator.clipboard.writeText(suggestedPassword);
      toast.success("Password copied to clipboard and filled in!");
    } catch {
      toast.success("Password filled in!");
    }
  };

  const handleRiskCheck = async () => {
    if (zipCode.length !== 5) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("zips_with_risks")
        .select("risk_rating, high_risks")
        .eq("zipcode", parseInt(zipCode))
        .maybeSingle();
      if (error) {
        toast.error("Unable to find risk data for this ZIP code");
        setRiskData(null);
      } else if (data) {
        setRiskData(data);
      } else {
        toast.error("No risk data found for this ZIP code");
        setRiskData(null);
      }
    } catch {
      toast.error("An error occurred while fetching risk data");
      setRiskData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef0f3] py-6 px-3">
      <div className="mx-auto w-full max-w-[420px] bg-white rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(20,30,50,0.18)]">

        {/* ── HERO ── */}
        <div
          className="px-[22px] pt-7 pb-[22px]"
          style={{ background: "linear-gradient(180deg, hsl(215 99% 46%), #1a78ee)" }}
        >
          <div className="flex items-center justify-between mb-[18px]">
            <div>
              <div className="text-white font-extrabold text-lg tracking-tight">NestProtect</div>
              <div className="text-white text-[11px] opacity-85 font-normal">Blue Sky Disaster Relief</div>
            </div>
          </div>

          <div className="relative rounded-[14px] overflow-hidden mb-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <img
              src="/images/Leos_House_After_Tornado_2019-10_600x250.jpg"
              alt="Home damaged by tornado, Dallas 2019"
              className="w-full block object-cover"
              style={{ aspectRatio: "12/5" }}
            />
            <div
              className="absolute inset-0 flex items-end p-3.5"
              style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)" }}
            >
              <div>
                <p
                  className="text-white text-[11px] font-semibold leading-[1.35] m-0"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
                >
                  Leo's house after the 2019 Dallas tornado
                </p>
                <span className="text-white text-[10px] opacity-90 block mt-0.5">
                  NestProtect exists so your family is ready.
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-[26px] font-extrabold leading-[1.2] m-0 mb-2.5 tracking-tight text-white">
            No one thinks the storm{" "}
            <em
              className="not-italic"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #b8eee8 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              will hit them.
            </em>
          </h1>
          <p className="text-sm leading-relaxed m-0 text-white opacity-95">
            NestProtect is the disaster preparedness app that meets you{" "}
            <strong>before, during, and after</strong> severe weather — with a plan built around your ZIP code.
          </p>
        </div>

        {/* ── BODY ── */}
        <div className="px-4 py-[18px] flex flex-col gap-4">

          {/* Risk card — "What's my risk?" is the single special-gradient CTA on this page */}
          <div className="card-floating p-5">
            <h2 className="text-title font-bold text-[17px] text-center m-0 mb-2">What's your risk?</h2>
            <p className="text-sm text-center text-muted-foreground mb-3.5 leading-snug">
              FEMA tracks risks by ZIP code. Enter yours to see what you're up against.
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="ZIP code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                maxLength={5}
                pattern="[0-9]{5}"
                className="flex-1"
              />
              <Button
                onClick={handleRiskCheck}
                disabled={loading || zipCode.length !== 5}
                className="bg-gradient-special text-white"
              >
                What's my risk?
              </Button>
            </div>
            {riskData && (
              <div className="mt-4 space-y-1">
                <div className="text-sm">
                  <span className="text-muted-foreground">Risk Rating: </span>
                  <span className="text-primary font-semibold">{riskData.risk_rating || "Not available"}</span>
                </div>
                {riskData.high_risks && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">High Risks: </span>
                    <span className="text-primary font-semibold">{riskData.high_risks}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trust pills */}
          <div className="grid grid-cols-2 gap-2">
            {TRUST_PILLS.map(({ value, label }) => (
              <div key={value} className="card-floating p-3 text-center">
                <div className="text-primary font-extrabold text-base">{value}</div>
                <div className="text-muted-foreground text-[11px] leading-snug mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Data sources */}
          <div className="card-floating p-5">
            <h3 className="text-title font-bold text-[15px] m-0 mb-2">Trusted data, personalized for you</h3>
            <p className="text-sm text-muted-foreground leading-snug m-0 mb-3">
              NestProtect turns the firehose of public emergency information into{" "}
              <strong>one personalized, interactive plan</strong> for your home.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DATA_SOURCES.map((src) => (
                <span key={src} className="bg-muted border border-border text-primary text-[11px] px-2.5 py-1 rounded-full">
                  {src}
                </span>
              ))}
            </div>
          </div>

          {/* Auth card */}
          <div className="card-floating p-5">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-3 mt-0">
                <form onSubmit={handleSignIn} className="space-y-3">
                  <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <Button type="submit" className="w-full bg-gradient-primary text-white" disabled={loading}>
                    {loading ? "Signing in…" : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-3 mt-0">
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <p className="text-xs text-muted-foreground mt-1">Your email is used for account security, not marketing.</p>
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="New password (12+ characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={12}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      <button type="button" onClick={generatePassword} className="text-primary underline hover:no-underline">
                        Suggest a password.
                      </button>
                    </p>
                    {suggestedPassword && (
                      <div className="mt-2 p-2 bg-muted rounded border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Suggested password:</p>
                        <div className="flex items-center gap-2">
                          <code
                            className="text-sm font-mono bg-white px-2 py-1 rounded border flex-1 cursor-pointer hover:bg-muted"
                            onClick={copyAndUsePassword}
                          >
                            {suggestedPassword}
                          </code>
                          <Button type="button" variant="outline" size="sm" onClick={copyAndUsePassword} className="text-xs h-auto px-2 py-1">
                            Use this
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <Input
                      type="text"
                      placeholder="ZIP code (optional)"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      maxLength={5}
                      pattern="[0-9]{5}"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Used for weather alerts and local resource search.</p>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-primary text-white" disabled={loading}>
                    {loading ? "Creating account…" : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-border" />
              <span className="px-3 text-sm text-muted-foreground">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <Button onClick={handleGoogleSignIn} disabled={loading} variant="outline" className="w-full mb-3">
              <svg className="w-4 h-4 mr-2 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <button
              onClick={onGuestAccess}
              className="w-full text-sm text-muted-foreground hover:text-foreground underline hover:no-underline block text-center"
            >
              Continue without an account
            </button>

            <div className="text-center mt-4">
              <ContactForm>
                <button className="text-sm text-muted-foreground hover:text-foreground underline hover:no-underline">
                  Having trouble?
                </button>
              </ContactForm>
            </div>
          </div>

          {/* About link */}
          <Button
            onClick={() => navigate("/about")}
            className="w-full bg-gradient-primary text-white"
          >
            View Details and Screenshots
          </Button>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            By using NestProtect, you agree to our{" "}
            <a href="/terms">terms of service</a> and <a href="/privacy">privacy policy</a>.
          </p>
          <p className="text-center text-xs text-muted-foreground">© 2025 www.blueskynow.org</p>
          <p className="text-center text-xs text-muted-foreground opacity-75">
            NestProtect is a trademark of Blue Sky Disaster Relief.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
