import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import nestorHelloCircle from "@/assets/nestor-hello-circle.png";
import MobileNavigation from "@/components/MobileNavigation";

const About = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const galleryImages = [
    { src: "/gallery/1_Home.png", alt: "Home Dashboard", title: "Home - Dashboard to keep track of progress" },
    { src: "/gallery/2_Assessment.png", alt: "Self-Assessment Quiz", title: "Quiz - How prepared are you? Take Nestor's test!" },
    { src: "/gallery/3_Before.png", alt: "Before Disaster Preparation", title: "Before - Tasks to prepare for many scenarios" },
    { src: "/gallery/4_During.png", alt: "During Disaster Monitoring", title: "During - Weather, wildfire, and traffic conditions" },
    { src: "/gallery/5_After.png", alt: "After Disaster Recovery", title: "After - Quick search of local and national help" }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Header with back button and Nestor */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        {/* Nestor Introduction */}
        <div className="text-center space-y-4 mb-8">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <img 
              src={nestorHelloCircle} 
              alt="Nestor - Your disaster preparedness guide"
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-title">NestProtect - Disaster Preparedness</h1>
            <p className="text-muted-foreground font-bold">
              Free disaster preparedness and recovery app by Blue Sky Disaster Relief, a 501(c)(3) non-profit helping people affected by natural disasters.
            </p>
            <p className="text-muted-foreground">
              Created by a high school student whose family survived a tornado, NestProtect's mascot Nestor guides you through steps to lower risk to your safety and property.
            </p>
          </div>
        </div>

        {/* Photo Gallery */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-title">App Screenshots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {galleryImages.map((image, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer group">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-40 object-cover rounded-lg border-2 border-border group-hover:border-primary transition-colors"
                      />
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        {image.title}
                      </p>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <div className="flex flex-col items-center">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg"
                      />
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        {image.title}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-title">Key Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-primary mb-2">Dashboard & Assessment</h3>
              <p className="text-muted-foreground">Track disaster preparedness progress and task completion.</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Nestor, NestProtect's Mascot</h3>
              <p className="text-muted-foreground">Assesses your disaster readiness with simple questions.</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Interactive Checklists</h3>
              <p className="text-muted-foreground">Stage-specific guidance for before, during, and after disasters (fire, flood, storm, general).</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Real-Time Alerts</h3>
              <p className="text-muted-foreground">Weather conditions, government disaster alerts, and traffic updates for your ZIP code.</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Recovery Resources</h3>
              <p className="text-muted-foreground">AI-enhanced 'quick search' for local help and services, plus national resources (FEMA, Red Cross, United Way 211).</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Google Integration</h3>
              <p className="text-muted-foreground">Works with Calendar, Drive, and Maps.</p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy First */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-title">Privacy-First</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-primary mb-2">What we collect:</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex">
                    <span className="text-primary mr-1">•</span>
                    <span className="flex-1">Email address - Login and security only</span>
                  </li>
                  <li className="flex">
                    <span className="text-primary mr-1">•</span>
                    <span className="flex-1">Your assessment score, checklist progress, and deadline - saved for your future reference</span>
                  </li>
                  <li className="flex">
                    <span className="text-primary mr-1">•</span>
                    <span className="flex-1">ZIP code - Local weather and alerts only</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-primary mb-2">What we don't do:</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex">
                    <span className="text-primary mr-1">•</span>
                    <span className="flex-1">No marketing data collection</span>
                  </li>
                  <li className="flex">
                    <span className="text-primary mr-1">•</span>
                    <span className="flex-1">No third-party data sharing</span>
                  </li>
                  <li className="flex">
                    <span className="text-primary mr-1">•</span>
                    <span className="flex-1">No cookies</span>
                  </li>
                  <li className="flex">
                    <span className="text-primary mr-1">•</span>
                    <span className="flex-1">No special permissions required</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-muted-foreground">
                Web app platform with a Postgres database provides only aggregate activity tracking (such as page visits). All personal data stays in your Google or related tools, under your control.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Always Free */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-title">Always Free</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              No premium features, completely free forever for all users and ages.
            </p>
            <p className="text-center text-muted-foreground mt-4">
              Developed by 501(c)(3) non-profit. All ages welcome.
            </p>
          </CardContent>
        </Card>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default About;