import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import nestorPreparedness from '@/assets/nestor-preparedness.png';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MobileNavigation from '@/components/MobileNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

interface MainTask {
  id: string;
  main_task: string;
  learn_more_url: string | null;
  sort_order: number;
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

interface SubTask {
  id: string;
  section_id: string;
  task_description: string;
  is_critical: boolean;
  sort_order: number;
}

export default function PreparePage() {
  const { user } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['basic']));
  const [completedSubtasks, setCompletedSubtasks] = useState<Set<string>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'basic', label: 'Basic', color: 'bg-primary' },
    { id: 'avalanche', label: 'Avalanche', color: 'bg-blue-300' },
    { id: 'cold', label: 'Cold', color: 'bg-blue-500' },
    { id: 'earthquake', label: 'Earthquake', color: 'bg-orange-600' },
    { id: 'flood', label: 'Flood', color: 'bg-blue-600' },
    { id: 'hail', label: 'Hail', color: 'bg-gray-400' },
    { id: 'heat', label: 'Heat', color: 'bg-coral' },
    { id: 'hurricane', label: 'Hurricane', color: 'bg-raspberry' },
    { id: 'ice', label: 'Ice', color: 'bg-cyan-300' },
    { id: 'landslide', label: 'Landslide', color: 'bg-orange-500' },
    { id: 'lightning', label: 'Lightning', color: 'bg-yellow' },
    { id: 'tornado', label: 'Tornado', color: 'bg-accent' },
    { id: 'tsunami', label: 'Tsunami', color: 'bg-blue-700' },
    { id: 'volcanic', label: 'Volcanic', color: 'bg-red-600' },
    { id: 'wildfire', label: 'Wildfire', color: 'bg-orange-700' },
    { id: 'wind', label: 'Wind', color: 'bg-gray-500' },
    { id: 'winter', label: 'Winter', color: 'bg-blue-400' }
  ];

  // Load tasks from Supabase
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        
        // Load main tasks
        const { data: mainData, error: mainError } = await supabase
          .from('prep_maintasks')
          .select('*')
          .order('sort_order', { ascending: true });

        if (mainError) throw mainError;

        // Load subtasks
        const { data: subData, error: subError } = await supabase
          .from('prep_subtasks')
          .select('*')
          .order('sort_order', { ascending: true });

        if (subError) throw subError;

        setMainTasks(mainData || []);
        setSubTasks(subData || []);
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Load user progress
  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('prep_subtask_user_state')
            .select('subtask_id, is_checked')
            .eq('user_id', user.id)
            .eq('is_checked', true);

          if (error) throw error;

          const completed = new Set(data?.map(item => item.subtask_id) || []);
          setCompletedSubtasks(completed);
        } catch (error) {
          console.error('Error loading progress:', error);
          const saved = localStorage.getItem('prepSubtaskCheckedItems');
          setCompletedSubtasks(saved ? new Set(JSON.parse(saved)) : new Set());
        }
      } else {
        const saved = localStorage.getItem('prepSubtaskCheckedItems');
        setCompletedSubtasks(saved ? new Set(JSON.parse(saved)) : new Set());
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

  const toggleSubtask = async (subtaskId: string) => {
    const previousCompleted = new Set(completedSubtasks);
    const newCompleted = new Set(completedSubtasks);
    const isCompleted = !completedSubtasks.has(subtaskId);
    
    if (isCompleted) {
      newCompleted.add(subtaskId);
    } else {
      newCompleted.delete(subtaskId);
    }
    
    setCompletedSubtasks(newCompleted);

    if (user) {
      try {
        if (isCompleted) {
          const { error } = await supabase
            .from('prep_subtask_user_state')
            .upsert({
              user_id: user.id,
              subtask_id: subtaskId,
              is_checked: true
            }, {
              onConflict: 'user_id,subtask_id'
            });

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('prep_subtask_user_state')
            .delete()
            .eq('user_id', user.id)
            .eq('subtask_id', subtaskId);

          if (error) throw error;
        }
      } catch (error) {
        console.error('Error saving progress:', error);
        toast.error('Failed to save progress');
        setCompletedSubtasks(previousCompleted);
      }
    } else {
      localStorage.setItem('prepSubtaskCheckedItems', JSON.stringify(Array.from(newCompleted)));
    }
  };

  const toggleMainTask = (mainTaskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(mainTaskId)) {
      newExpanded.delete(mainTaskId);
    } else {
      newExpanded.add(mainTaskId);
    }
    setExpandedTasks(newExpanded);
  };

  const filteredMainTasks = mainTasks.filter(task => {
    if (selectedCategories.size === 0) return false;
    return Array.from(selectedCategories).some(category => 
      task[category as keyof MainTask] === true
    );
  });

  const getSubtasksForMainTask = (mainTaskId: string) => {
    return subTasks.filter(subtask => subtask.section_id === mainTaskId);
  };

  const getCompletionStats = (mainTaskId: string) => {
    const subtasks = getSubtasksForMainTask(mainTaskId);
    const completed = subtasks.filter(st => completedSubtasks.has(st.id)).length;
    return { completed, total: subtasks.length };
  };

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <img 
              src={nestorPreparedness}
              alt="Nestor with checklist - Your preparation guide"
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-title">Prepare for disasters.</h1>
            <p className="text-muted-foreground">
              Select disaster categories below to see preparation tasks to complete weeks or months ahead.
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

        {/* Main Tasks List */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-title">
              Preparation Tasks
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
                  Please select a disaster category to view preparation tasks
                </p>
              </div>
            ) : filteredMainTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No tasks found for the selected categories
                </p>
              </div>
            ) : (
              filteredMainTasks.map(mainTask => {
                const subtasks = getSubtasksForMainTask(mainTask.id);
                const isExpanded = expandedTasks.has(mainTask.id);

                return (
                  <div key={mainTask.id}>
                    {/* Main Task Header */}
                    <button
                      onClick={() => toggleMainTask(mainTask.id)}
                      className="w-full p-3 flex items-start justify-between rounded-lg border border-border hover:bg-muted/30 transition-smooth"
                    >
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-foreground">
                          {mainTask.main_task}
                        </h3>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Subtasks */}
                    {isExpanded && subtasks.length > 0 && (
                      <div className="mt-2 ml-4 space-y-2">
                        {subtasks.map(subtask => (
                          <div
                            key={subtask.id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-smooth"
                          >
                            <button
                              onClick={() => toggleSubtask(subtask.id)}
                              className="mt-1"
                            >
                              {completedSubtasks.has(subtask.id) ? (
                                <CheckCircle2 size={20} className="text-primary" />
                              ) : (
                                <Circle size={20} className="text-muted-foreground" />
                              )}
                            </button>
                            <div className="flex-1">
                              <p className={`text-sm ${
                                completedSubtasks.has(subtask.id)
                                  ? 'text-muted-foreground line-through'
                                  : 'text-foreground'
                              }`}>
                                {subtask.task_description}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {mainTask.learn_more_url && (
                          <div className="mt-2 ml-8">
                            <p className="text-xs text-muted-foreground">
                              Learn More: <a 
                                href={mainTask.learn_more_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-primary hover:underline"
                              >
                                {mainTask.learn_more_url}
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
      
      <MobileNavigation />
    </div>
  );
}