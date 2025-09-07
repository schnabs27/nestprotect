import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import MobileNavigation from "@/components/MobileNavigation";

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
  "My family members know how to find each other even when internet and phone service is unavailable.",
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
      // Store the score in localStorage
      const score = newAnswers.filter(answer => answer).length;
      localStorage.setItem('selfAssessmentScore', score.toString());
    }
  };

  const [activeTab] = useState("before");

  const scoreTrue = assessment.answers.filter(answer => answer).length;
  const isAllTrue = scoreTrue === statements.length;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 pt-12">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Button>
        </div>
        <h1 className="text-2xl font-bold mb-2">Disaster Prep Self-Assessment</h1>
        <p className="text-primary-foreground/90 text-sm">
          Check your emergency preparedness with Nestor
        </p>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Chat Container */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Initial Introduction Message */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img 
                src="/lovable-uploads/5ecbaeee-0fb6-4b04-a635-a4092e7ac93d.png" 
                alt="Nestor" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-primary">Nestor</span>
              <div className="bg-white border-4 border-[#66dcb5] rounded-2xl rounded-tl-md px-4 py-3 max-w-xs">
                <p className="text-sm text-foreground">
                  Let's see how ready you are for a disaster coming your way. <strong>Are these statements true for you?</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Chat History - Previous Questions and Answers */}
          {assessment.answers.map((answer, index) => (
            <div key={index} className="space-y-3">
              {/* Nestor's Question */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src="/lovable-uploads/5ecbaeee-0fb6-4b04-a635-a4092e7ac93d.png" 
                    alt="Nestor" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-primary">Nestor</span>
                   <div className="bg-white border-4 border-[#66dcb5] rounded-2xl rounded-tl-md px-4 py-3 max-w-md">
                    <p className="text-sm text-foreground">
                      {statements[index]}
                    </p>
                  </div>
                </div>
              </div>

              {/* User's Answer */}
              <div className="flex items-start gap-3 justify-end">
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-sm font-medium text-muted-foreground">You</span>
                   <div className={`rounded-2xl rounded-tr-md px-4 py-3 max-w-xs ${
                     answer 
                       ? 'bg-green-500 text-white' 
                       : 'bg-destructive text-destructive-foreground'
                   }`}>
                    <p className="text-sm font-medium">
                      {answer ? 'True' : 'False'}
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {answer ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <XCircle size={16} className="text-red-600" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Current Question (if not complete) */}
          {!assessment.isComplete && (
            <div className="space-y-3">
              {/* Nestor's Current Question */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src="/lovable-uploads/5ecbaeee-0fb6-4b04-a635-a4092e7ac93d.png" 
                    alt="Nestor" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-primary">Nestor</span>
                   <div className="bg-white border-4 border-[#66dcb5] rounded-2xl rounded-tl-md px-4 py-3 max-w-md">
                    <p className="text-sm text-foreground mb-3">
                      {statements[assessment.currentStep]}
                    </p>
                    
                    {/* True/False Response Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAnswer(true)}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle size={14} className="mr-1" />
                        True
                      </Button>
                      <Button
                        onClick={() => handleAnswer(false)}
                        size="sm"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        <XCircle size={14} className="mr-1" />
                        False
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {assessment.isComplete && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img 
                  src="/lovable-uploads/5ecbaeee-0fb6-4b04-a635-a4092e7ac93d.png" 
                  alt="Nestor" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-primary">Nestor</span>
                <div className="bg-white border-4 border-[#66dcb5] rounded-2xl rounded-tl-md px-4 py-3 max-w-md">
                  <p className="text-sm text-foreground mb-2">
                    You marked {scoreTrue} of {statements.length} as true.
                  </p>
                  <p className="text-sm font-medium text-primary mb-3">
                    {isAllTrue ? "Great job - basics are done!" : "Almost there - keep prepping!"}
                  </p>
                  <Button 
                    onClick={() => navigate("/")} 
                    size="sm"
                    className="w-full"
                  >
                    Go to Emergency Preparedness
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation activeTab={activeTab} />
      </div>
    </div>
  );
};

export default SelfAssessmentPage;