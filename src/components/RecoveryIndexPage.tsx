import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MobileNavigation from "@/components/MobileNavigation";
import ZipCodeHeader from "@/components/ZipCodeHeader";
import { ExternalLink, Heart, Users } from "lucide-react";
import nestorRecovery from "@/assets/nestor-recovery.png";

const RecoveryIndexPage = () => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <ZipCodeHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <img 
              src={nestorRecovery}
              alt="Nestor with binoculars - Your disaster recovery guide"
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-title">Disaster Recovery Resources</h1>
            <p className="text-muted-foreground">
              Recovery after a natural disaster can be challenging. These resources can help you navigate the recovery process and find the support you need.
            </p>
          </div>
        </div>

        {/* Recovery Actions Grid */}
        <div className="grid gap-4">
          {/* Recovery Action Plan */}
          <Card className="shadow-soft bg-purple-600 border-purple-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white text-center">Recovery Action Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-purple-100 leading-none mb-4">
                  You prepared this list, now you can follow it to guide your recovery process.
                </p>
                <Button 
                  onClick={() => navigate("/preparedness")} 
                  className="w-full bg-white hover:bg-gray-100 text-black"
                >
                  View Your Action Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Resources */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-title text-center">Emergency Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground leading-none mb-4">
                  Quick search for businesses to help with safety, health, and other emergencies.
                </p>
                <Button 
                  onClick={() => navigate("/googlesearch")} 
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  Quick Search: Emergency Resources
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* More Emergency Resources */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-title text-center">More Emergency Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground leading-none mb-4">
                  ChatGPT will quick search disaster resources that may not appear in standard directories.
                </p>
                <Button 
                  onClick={() => navigate("/aisearch")} 
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  AI Quick Search: Emergency Resources
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recovery Resources */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-title text-center">Recovery Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground leading-none mb-4">
                  Quick search for businesses to help clean, fix, move, and store your nest.
                </p>
                <Button 
                  onClick={() => navigate("/googlerecovery")} 
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  Quick Search: Recovery Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* External Resources */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-title text-center">Government & Nonprofit Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {/* FEMA Resources */}
              <Card className="shadow-soft">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <h4 className="font-medium text-title">FEMA Resources</h4>
                    <p className="text-sm text-muted-foreground">Check if you're eligible for government disaster support</p>
                    <Button
                      variant="outline-success"
                      onClick={() => window.open("https://www.fema.gov/disaster/recover", "_blank")}
                      className="w-full"
                    >
                      Visit FEMA
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Red Cross */}
              <Card className="shadow-soft">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <h4 className="font-medium text-title">Red Cross</h4>
                    <p className="text-sm text-muted-foreground">Search Red Cross disaster relief resources and assistance</p>
                    <Button
                      variant="outline-success"
                      onClick={() => window.open("https://www.redcross.org/get-help/disaster-relief-and-recovery-services", "_blank")}
                      className="w-full"
                    >
                      Visit Red Cross
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* United Way */}
              <Card className="shadow-soft">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <h4 className="font-medium text-title">United Way (211)</h4>
                    <p className="text-sm text-muted-foreground">Search United Way relief resources and community support</p>
                    <Button
                      variant="outline-success"
                      onClick={() => window.open("https://www.211.org", "_blank")}
                      className="w-full"
                    >
                      Visit 211.org
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNavigation activeTab="after" onTabChange={(tab) => navigate(`/${tab}`)} />
    </div>
  );
};

export default RecoveryIndexPage;