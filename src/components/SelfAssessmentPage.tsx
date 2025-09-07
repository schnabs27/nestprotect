import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";

interface AssessmentState {
  currentStep: number;
  answers: boolean[];
  isComplete: boolean;
}

const statements = [
  "I'm receiving emergency alerts about the disaster.",
  "I know my safest place to go right now.",
  "If my safe place is no longer safe, I have a plan B.",
  "I know who to contact if I'm hurt, lost, or trapped.",
  "My family members know what to do.",
  "I have 3 days of food, water, medication, and power.",
  "I can quickly access my insurance and property documents.",
  "I know ways to move or protect my property so it's less likely to be damaged."
];

const SelfAssessmentPage = () => {
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<AssessmentState>({
    currentStep: 0,
    answers: [],
    isComplete: false
  });

  const handleAnswer = (answer: boolean) => {
    const newAnswers = [...assessment.answers, answer];
    
    if (assessment.currentStep < statements.length - 1) {
      setAssessment({
        currentStep: assessment.currentStep + 1,
        answers: newAnswers,
        isComplete: false
      });
    } else {
      setAssessment({
        currentStep: assessment.currentStep,
        answers: newAnswers,
        isComplete: true
      });
    }
  };

  const scoreTrue = assessment.answers.filter(answer => answer).length;
  const isAllTrue = scoreTrue === 7;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Button>
        </div>

        <div className="space-y-6">
          {/* Nestor's Introduction */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/lovable-uploads/5ecbaeee-0fb6-4b04-a635-a4092e7ac93d.png" 
                    alt="Nestor" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primary mb-2">Nestor</h3>
                  <p className="text-muted-foreground">
                    Let's see how ready you are for a disaster coming your way.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Question or Completion */}
          {!assessment.isComplete ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    <img 
                      src="/lovable-uploads/5ecbaeee-0fb6-4b04-a635-a4092e7ac93d.png" 
                      alt="Nestor" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary mb-2">Nestor</h3>
                    <p className="text-foreground mb-4">
                      {statements[assessment.currentStep]}
                    </p>
                    
                    {/* True/False Chips */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAnswer(true)}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle size={16} />
                        True
                      </Button>
                      <Button
                        onClick={() => handleAnswer(false)}
                        variant="outline"
                        className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <XCircle size={16} />
                        False
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Completion Message */
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    <img 
                      src="/lovable-uploads/5ecbaeee-0fb6-4b04-a635-a4092e7ac93d.png" 
                      alt="Nestor" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary mb-2">Nestor</h3>
                    <div className="space-y-3">
                      <p className="text-foreground">
                        You marked {scoreTrue} of 7 as true.
                      </p>
                      <p className="text-lg font-medium text-primary">
                        {isAllTrue ? "Basics are done!" : "Almost there!"}
                      </p>
                      <Button 
                        onClick={() => navigate("/")} 
                        className="mt-4"
                      >
                        Go to Emergency Preparedness
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Indicator */}
          <div className="text-center text-sm text-muted-foreground">
            {assessment.isComplete 
              ? "Assessment Complete" 
              : `Question ${assessment.currentStep + 1} of ${statements.length}`
            }
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((assessment.currentStep + (assessment.isComplete ? 1 : 0)) / statements.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfAssessmentPage;