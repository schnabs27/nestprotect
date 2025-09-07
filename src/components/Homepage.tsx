import { useState } from "react";
import { CalendarIcon, Home, Calendar } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import MobileNavigation from "@/components/MobileNavigation";

const Homepage = () => {
  const [completionDate, setCompletionDate] = useState<Date>();
  const navigate = useNavigate();

  // Mock data - in a real app, this would come from state management or API
  const prepCompletedItems = 0; // This would track completed "All - Now" items
  const prepTotalItems = 10; // This would be the total "All - Now" items
  const assessmentTrueItems = 0; // This would track true statements from assessment
  const assessmentTotalItems = 15; // Total assessment statements

  const getDaysUntilDate = () => {
    if (!completionDate) return null;
    const days = differenceInDays(completionDate, new Date());
    return Math.max(0, days);
  };

  const daysRemaining = getDaysUntilDate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
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
          {/* Prep Scoreboard */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg text-title">Emergency Prep Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {prepCompletedItems}/{prepTotalItems}
                </div>
                <p className="text-sm text-muted-foreground">Essential items completed</p>
              </div>
              <Button 
                onClick={() => navigate("/preparedness")}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                Continue Emergency Prep
              </Button>
            </CardContent>
          </Card>

          {/* Self-Assessment Scoreboard */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg text-title">Self-Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">
                  {assessmentTrueItems}/{assessmentTotalItems}
                </div>
                <p className="text-sm text-muted-foreground">Statements marked true</p>
              </div>
              <Button 
                onClick={() => navigate("/self-assessment")}
                className="w-full bg-muted hover:bg-muted/80 text-foreground"
              >
                Take Self-Assessment
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Completion Date Goal */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-title">
              Emergency Prep Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <div className="text-2xl font-bold text-coral">
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
          <CardHeader>
            <CardTitle className="text-lg text-title">About NestProtect™</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
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
      </div>
      <MobileNavigation />
    </div>
  );
};

export default Homepage;