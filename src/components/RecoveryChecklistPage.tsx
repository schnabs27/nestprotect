import { useState, useEffect } from "react";
import { CheckCircle2, Circle, AlertTriangle, Flame, Waves } from "lucide-react";
import nestorPreparedness from '@/assets/nestor-preparedness.png';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MobileNavigation from "@/components/MobileNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

const RecoveryChecklistPage = () => {
  const { user } = useAuth();
  const [activeHazard, setActiveHazard] = useState("all");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load user progress from database or localStorage
  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('user_preparedness_progress')
            .select('task_id, completed')
            .eq('user_id', user.id)
            .eq('completed', true);

          if (error) throw error;

          const completedTasks = new Set(data?.map(item => item.task_id) || []);
          setCheckedItems(completedTasks);
        } catch (error) {
          console.error('Error loading progress:', error);
          toast.error('Failed to load your progress');
          const saved = localStorage.getItem('prepCheckedItems');
          setCheckedItems(saved ? new Set(JSON.parse(saved)) : new Set());
        } finally {
          setLoading(false);
        }
      } else {
        const saved = localStorage.getItem('prepCheckedItems');
        setCheckedItems(saved ? new Set(JSON.parse(saved)) : new Set());
      }
    };

    loadProgress();
  }, [user]);

  const hazards = [
    { id: "all", label: "All Types", icon: AlertTriangle, color: "text-primary" },
    { id: "wildfire", label: "Wildfire", icon: Flame, color: "text-coral" },
    { id: "flood", label: "Flood", icon: Waves, color: "text-blue-600" },
    { id: "storm", label: "Storm", icon: AlertTriangle, color: "text-accent" }
  ];

  const checklists = {
    all: {
      after: [
        { id: "all-after-1", title: "Return home only when officials say it's safe", notes: "Wait for all-clear from authorities", links: [] },
        { id: "all-after-1b", title: "Board up new openings to your home caused by the disaster", notes: "Easy access may tempt looters", links: [] },
        { id: "all-after-2", title: "Wear protective gear when cleaning debris", notes: "boots, gloves, masks", links: [] },
        { id: "all-after-3", title: "Document damage before cleanup or repairs", notes: "Take photos/videos for insurance", links: [] },
        { id: "all-after-4", title: "Contact insurance promptly; apply for FEMA assistance if eligible", notes: "Start recovery process quickly", links: ["fema.gov/assistance"] },
        { id: "all-after-5", title: "Watch for hazards", notes: "power lines, gas leaks, unstable structures", links: [] },
        { id: "all-after-6", title: "Use generators outdoors only, at least 20 feet from homes", notes: "Prevent carbon monoxide poisoning", links: [] },
        { id: "all-after-7", title: "Check on vulnerable neighbors", notes: "Community support during recovery", links: [] },
        { id: "all-after-8", title: "Discard spoiled or contaminated food/water", notes: "Prevent foodborne illness", links: [] },
        { id: "all-after-9", title: "Apply fencing and \"Do Not Enter\" signage", notes: "Discourage visitors who may hurt themselves or further damage your property", links: [] },
        { id: "all-after-10", title: "Be confident, ask questions", notes: "Strangers may show up and insist you use their services - but they are not in charge. Remember you have the right to make researched, thoughtful decisions for your best interest.", links: [] }
      ]
    },
    wildfire: {
      after: [
        { id: "wildfire-after-1", title: "Be alert for smoldering hot spots and weakened structures", notes: "Fire can reignite or structures can collapse", links: [] },
        { id: "wildfire-after-2", title: "Check attic, roof, and yard for embers", notes: "Look for remaining fire hazards", links: [] },
        { id: "wildfire-after-3", title: "Wear N95 masks to avoid breathing ash", notes: "Protect respiratory health", links: [] },
        { id: "wildfire-after-4", title: "File insurance claim promptly", notes: "Document all fire damage", links: [] }
      ]
    },
    flood: {
      after: [
        { id: "flood-after-1", title: "Avoid standing water", notes: "contamination/electricity risk", links: [] },
        { id: "flood-after-2", title: "Check buildings for structural damage before entering", notes: "Ensure safety before re-entry", links: [] },
        { id: "flood-after-3", title: "Discard any food, water, or medicine touched by floodwater", notes: "Prevent contamination illness", links: [] },
        { id: "flood-after-4", title: "Dry home quickly to prevent mold", notes: "Use fans, dehumidifiers, open windows", links: [] }
      ]
    },
    storm: {
      after: [
        { id: "storm-after-1", title: "Avoid downed power lines and flooded areas", notes: "Stay safe during initial assessment", links: [] },
        { id: "storm-after-2", title: "Protect yourself from hazards", notes: "Shattered glass, broken wood, exposed nails, insulation, and large debris are frequent after strong winds", links: [] },
        { id: "storm-after-3", title: "Cover belongings to minimize further damage", notes: "Post-storm secondary rain is common", links: [] },
        { id: "storm-after-4", title: "If you smell gas, leave immediately", notes: "Contact the police or utilities company about a possible gas line rupture", links: [] }
      ]
    }
  };

  const toggleCheck = async (itemId: string) => {
    const newChecked = new Set(checkedItems);
    const isCompleted = !checkedItems.has(itemId);
    
    if (isCompleted) {
      newChecked.add(itemId);
    } else {
      newChecked.delete(itemId);
    }
    
    setCheckedItems(newChecked);

    if (user) {
      try {
        if (isCompleted) {
          const { error } = await supabase
            .from('user_preparedness_progress')
            .upsert({
              user_id: user.id,
              task_id: itemId,
              completed: true
            }, {
              onConflict: 'user_id,task_id'
            });

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('user_preparedness_progress')
            .delete()
            .eq('user_id', user.id)
            .eq('task_id', itemId);

          if (error) throw error;
        }
      } catch (error) {
        console.error('Error saving progress:', error);
        toast.error('Failed to save progress');
        setCheckedItems(checkedItems);
      }
    } else {
      localStorage.setItem('prepCheckedItems', JSON.stringify(Array.from(newChecked)));
    }
  };

  const currentChecklist = checklists[activeHazard as keyof typeof checklists];

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <img 
              src={nestorPreparedness}
              alt="Nestor with checklist - Your recovery guide"
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-title">Recover from a disaster.</h1>
            <p className="text-muted-foreground">
              Hit by a severe weather event? I hope these basic steps help you bounce back faster.
            </p>
          </div>
        </div>

        {/* Hazard Selection */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {hazards.map((hazard) => {
            const Icon = hazard.icon;
            return (
              <Button
                key={hazard.id}
                variant={activeHazard === hazard.id ? "default" : "outline"}
                className={`h-16 flex flex-col gap-1 ${
                  activeHazard === hazard.id 
                    ? "bg-gradient-primary border-0 text-primary-foreground" 
                    : ""
                }`}
                onClick={() => setActiveHazard(hazard.id)}
              >
                <Icon size={20} className={activeHazard === hazard.id ? "" : hazard.color} />
                <span className="text-xs">{hazard.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Recovery Checklist */}
        <Card className="shadow-soft">
          <CardContent className="space-y-4 pt-6">
            {currentChecklist.after?.map((item: any) => (
              <div 
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-smooth"
              >
                <button
                  onClick={() => toggleCheck(item.id)}
                  className="mt-1"
                >
                  {checkedItems.has(item.id) ? (
                    <CheckCircle2 size={20} className="text-primary" />
                  ) : (
                    <Circle size={20} className="text-muted-foreground" />
                  )}
                </button>
                
                <div className="flex-1">
                  <h4 className={`font-medium ${checkedItems.has(item.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.notes}
                  </p>
                  {item.links && item.links.length > 0 && (
                    <div className="mt-2">
                      {item.links.map((link: string, index: number) => (
                        <a
                          key={index}
                          href={`https://${link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mr-3"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
      <MobileNavigation />
    </div>
  );
};

export default RecoveryChecklistPage;