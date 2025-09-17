import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MobileNavigation from "@/components/MobileNavigation";
import ZipCodeHeader from "@/components/ZipCodeHeader";
import { ExternalLink, Search, Bot, FileText, Home, Heart, Users } from "lucide-react";

const RecoveryIndexPage = () => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <ZipCodeHeader />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">
              Disaster Recovery Resources
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Recovery after a natural disaster can be challenging. These resources can help you navigate the recovery process and find the support you need.
            </p>
          </div>

          {/* Recovery Actions Grid */}
          <div className="grid gap-4">
            {/* Recovery Action Plan */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">Recovery Action Plan</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You prepared this list, now you can follow it to guide your recovery process.
                    </p>
                    <Button 
                      onClick={() => navigate("/preparedness")} 
                      className="w-full"
                    >
                      View Your Action Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Resource Listings */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">Google Resource Listings</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      View Google's comprehensive directory of local disaster resources and services.
                    </p>
                    <Button 
                      onClick={() => navigate("/googlesearch")} 
                      className="w-full"
                    >
                      Search Google Resources
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI-Driven Resource Search */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">AI-Driven Resource Search</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      ChatGPT will search for additional local resources that may not appear in standard directories.
                    </p>
                    <Button 
                      onClick={() => navigate("/aisearch")} 
                      className="w-full"
                    >
                      Search with AI
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Long-Term Resources */}
            <Card className="hover:shadow-md transition-shadow opacity-75">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <Home className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-muted-foreground mb-2">Long-Term Resources</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Resources for home cleanup, contractors, temporary housing, storage, and moving rentals.
                    </p>
                    <Button 
                      disabled
                      variant="secondary"
                      className="w-full"
                    >
                      Coming Soon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* External Resources */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Government & Nonprofit Resources</h2>
            
            <div className="grid gap-3">
              {/* FEMA Resources */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <ExternalLink className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">FEMA Resources</h4>
                      <p className="text-sm text-muted-foreground">Check if you're eligible for government disaster support</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open("https://www.fema.gov/disaster/recover", "_blank")}
                    >
                      Visit FEMA
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Red Cross */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">Red Cross</h4>
                      <p className="text-sm text-muted-foreground">Search Red Cross disaster relief resources and assistance</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open("https://www.redcross.org/get-help/disaster-relief-and-recovery-services", "_blank")}
                    >
                      Visit Red Cross
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* United Way */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">United Way (211)</h4>
                      <p className="text-sm text-muted-foreground">Search United Way relief resources and community support</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open("https://www.211.org", "_blank")}
                    >
                      Visit 211.org
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <MobileNavigation activeTab="after" onTabChange={(tab) => navigate(`/${tab}`)} />
    </div>
  );
};

export default RecoveryIndexPage;