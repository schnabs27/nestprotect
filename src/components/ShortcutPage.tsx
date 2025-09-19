import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import MobileNavigation from "@/components/MobileNavigation";
import nestorImage from "@/assets/nestor-smartphone.png";

const ShortcutPage = () => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const browserInstructions = [
    {
      id: "safari",
      title: "Safari (iPhone)",
      steps: [
        "Tap the Share button (□↗) at the bottom of Safari",
        "Scroll down and tap \"Add to Home Screen\"",
        "Customize the name if desired, then tap \"Add\""
      ]
    },
    {
      id: "chrome",
      title: "Chrome",
      steps: [
        "Tap the three dots menu (⋮) in the top-right corner",
        "Select \"Add to Home screen\" or \"Install app\"",
        "Confirm by tapping \"Add\" or \"Install\""
      ]
    },
    {
      id: "edge",
      title: "Microsoft Edge",
      steps: [
        "Tap the three dots menu (⋯) at the bottom of your screen",
        "Select \"Add to phone\" or \"Add to Home screen\" (you might need to scroll to find it)",
        "Tap \"Add\" to confirm"
      ]
    },
    {
      id: "desktop",
      title: "Desktop Browsers",
      steps: [
        "Check the address bar for an install icon (usually a + or download symbol)",
        "Or look in the browser menu for \"Install,\" \"Add to desktop,\" or \"Create shortcut\""
      ]
    },
    {
      id: "other",
      title: "Other Browsers",
      steps: [
        "Look for the menu button (usually three dots or lines)",
        "Find options like \"Add to Home screen,\" \"Add shortcut,\" or \"Install\"",
        "Follow the prompts to add"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Bird Image */}
        <div className="text-center">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <img 
              src={nestorImage}
              alt="Nestor with smartphone"
              className="w-32 h-32 object-contain"
            />
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-title">Ready to add NestProtect to your home?</h1>
          
          {/* Intro Content */}
          <div className="space-y-4 text-foreground">
            <p>It's easy to add the NestProtect app to your phone's home screen.</p>
            <p>NestProtect is a web app that uses your phone's web browser. Just follow the instructions to add the NestProtect homepage as a shortcut on your phone.</p>
            <p>Start by selecting your web browser for instructions.</p>
          </div>
        </div>

        {/* Browser Instructions */}
        <div className="space-y-4">
          {browserInstructions.map((browser) => (
            <Card key={browser.id} className="shadow-soft">
              <Collapsible 
                open={openSections[browser.id]} 
                onOpenChange={() => toggleSection(browser.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-title">{browser.title}</CardTitle>
                      <ChevronDown 
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          openSections[browser.id] ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <ol className="space-y-2 text-foreground">
                      {browser.steps.map((step, index) => (
                        <li key={index} className="flex">
                          <span className="mr-3 font-medium text-primary">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Footer Text */}
        <div className="text-center text-foreground">
          <p>Can't find the option? Try bookmarking the page first, then look for options to add bookmarks to your home screen or desktop.</p>
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default ShortcutPage;