import { useState, useEffect } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import nestorDamagedNest from '/images/nestor-damaged-nest.png';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MobileNavigation from "@/components/MobileNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

interface Task {
  id: string;
  task: string;
  stage: string;
  basic: boolean;
  avalanche: boolean;
  cold: boolean;
  earthquake: boolean;
  flood: boolean;
  hail: boolean;
  heat: boolean;
  hurricane: boolean;
  ice: boolean;
  landslide: boolean;
  lightning: boolean;
  tornado: boolean;
  tsunami: boolean;
  volcanic: boolean;
  wildfire: boolean;
  wind: boolean;
  winter: boolean;
}

const RecoveryPage = () => {
  const { user } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(["basic"]));
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "basic", label: "Basic", color: "bg-primary" },
    { id: "avalanche", label: "Avalanche", color: "bg-blue-300" },
    { id: "cold", label: "Cold", color: "bg-blue-500" },
    { id: "earthquake", label: "Earthquake", color: "bg-orange-600" },
    { id: "flood", label: "Flood", color: "bg-blue-600" },
    { id: "hail", label: "Hail", color: "bg-gray-400" },
    { id: "heat", label: "Heat", color: "bg-coral" },
    { id: "hurricane", label: "Hurricane", color: "bg-raspberry" },
    { id: "ice", label: "Ice", color: "bg-cyan-300" },
    { id: "landslide", label: "Landslide", color: "bg-orange-500" },
    { id: "lightning", label: "Lightning", color: "bg-yellow" },
    { id: "tornado", label: "Tornado", color: "bg-accent" },
    { id: "tsunami", label: "Tsunami", color: "bg-blue-700" },
    { id: "volcanic", label: "Volcanic", color: "bg-red-600" },
    { id: "wildfire", label: "Wildfire", color: "bg-orange-700" },
    { id: "wind", label: "Wind", color: "bg-gray-500" },
    { id: "winter", label: "Winter", color: "bg-blue-400" }
  ];

  // Load tasks from Supabase
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('recovery_tasks')
          .select('*')
          .order('task', { ascending: true });

        if (error) throw error;

        setTasks(data || []);
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Load user progress from database or localStorage
  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('recovery_task_user_state')
            .select('task_id, is_checked')
            .eq('user_id', user.id)
            .eq('is_checked', true);

          if (error) throw error;

          const completedTasks = new Set(data?.map(item => item.task_id) || []);
          setCheckedItems(completedTasks);
        } catch (error) {
          console.error('Error loading progress:', error);
          toast.error('Failed to load your progress');
          const saved = localStorage.getItem('recoveryCheckedItems');
          setCheckedItems(saved ? new Set(JSON.parse(saved)) : new Set());
        }
      } else {
        const saved = localStorage.getItem('recoveryCheckedItems');
        setCheckedItems(saved ? new Set(JSON.parse(saved)) : new Set());
      }
    };

    loadProgress();
  }, [user]);

  const toggleCategory = (categoryId: string) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(categoryId)) {
      newCategories.delete(categoryId);
    } else {
      newCategories.add(categoryId);
    }
    setSelectedCategories(newCategories);
  };

  const toggleCheck = async (taskUuid: string) => {
    // Store the previous state for rollback
    const previousChecked = new Set(checkedItems);
    const newChecked = new Set(checkedItems);
    const isCompleted = !checkedItems.has(taskUuid);
    
    if (isCompleted) {
      newChecked.add(taskUuid);
    } else {
      newChecked.delete(taskUuid);
    }
    
    // Optimistically update UI
    setCheckedItems(newChecked);

    if (user) {
      try {
        if (isCompleted) {
          const { error } = await supabase
            .from('recovery_task_user_state')
            .upsert({
              user_id: user.id,
              task_id: taskUuid,
              is_checked: true
            }, {
              onConflict: 'user_id,task_id'
            });

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('recovery_task_user_state')
            .delete()
            .eq('user_id', user.id)
            .eq('task_id', taskUuid);

          if (error) throw error;
        }
      } catch (error) {
        console.error('Error saving progress:', error);
        toast.error('Failed to save progress');
        // Revert to previous state on error
        setCheckedItems(previousChecked);
      }
    } else {
      localStorage.setItem('recoveryCheckedItems', JSON.stringify(Array.from(newChecked)));
    }
  };

  // Filter tasks based on selected categories (all recovery tasks are stage "after")
  const filteredTasks = tasks.filter(task => {
    // If no categories selected, don't show any tasks
    if (selectedCategories.size === 0) return false;

    // Check if task matches any selected category
    return Array.from(selectedCategories).some(category => {
      return task[category as keyof Task] === true;
    });
  });

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <img 
              src={nestorDamagedNest}
              alt="Nestor with a damaged nest"
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-title">Recover from a disaster.</h1>
            <p className="text-muted-foreground">
              Select disaster categories below to see recommended recovery actions.
            </p>
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-foreground mb-2">Disaster Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategories.has(category.id);
              
              return (
                <Badge
  key={category.id}
  variant="secondary"
  className={`cursor-pointer hover:opacity-80 transition-smooth ${
    isSelected 
      ? 'text-white ring-2 ring-primary'
      : 'bg-background border border-input text-muted-foreground hover:bg-muted/50'
  }`}
  style={isSelected ? { backgroundColor: '#0162e8' } : undefined}
  onClick={() => toggleCategory(category.id)}
>
  {category.label}
</Badge>
              );
            })}
          </div>
        </div>

        {/* Recovery Tasks */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-title">
              Recovery Actions - After the disaster
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            ) : selectedCategories.size === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Please select a disaster category to view recommended recovery actions
                </p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No tasks found for the selected categories
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-smooth"
                >
                  <button
                    onClick={() => toggleCheck(task.id)}
                    className="mt-1"
                  >
                    {checkedItems.has(task.id) ? (
                      <CheckCircle2 size={20} className="text-primary" />
                    ) : (
                      <Circle size={20} className="text-muted-foreground" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium ${checkedItems.has(task.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.task}
                    </h4>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default RecoveryPage;