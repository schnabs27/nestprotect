import { useState } from "react";
import { FileText, ExternalLink, CheckCircle2, Circle, FolderPlus, Upload, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DocumentsPage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());

  const documentCategories = [
    {
      title: "Property Documents",
      docs: [
        { id: "house-title", name: "House Title/Deed", required: true },
        { id: "mortgage", name: "Mortgage Documents", required: true },
        { id: "property-tax", name: "Property Tax Records", required: false },
        { id: "home-inventory", name: "Home Inventory List", required: true }
      ]
    },
    {
      title: "Insurance Policies",
      docs: [
        { id: "homeowners-insurance", name: "Homeowner's Insurance", required: true },
        { id: "auto-insurance", name: "Auto Insurance", required: true },
        { id: "life-insurance", name: "Life Insurance", required: false },
        { id: "health-insurance", name: "Health Insurance", required: true }
      ]
    },
    {
      title: "Personal Identification",
      docs: [
        { id: "passports", name: "Passports", required: true },
        { id: "drivers-license", name: "Driver's Licenses", required: true },
        { id: "social-security", name: "Social Security Cards", required: true },
        { id: "birth-certificates", name: "Birth Certificates", required: true }
      ]
    },
    {
      title: "Financial Records",
      docs: [
        { id: "bank-statements", name: "Bank Account Information", required: true },
        { id: "investment-records", name: "Investment Records", required: false },
        { id: "tax-returns", name: "Tax Returns (3 years)", required: true },
        { id: "credit-cards", name: "Credit Card Information", required: false }
      ]
    },
    {
      title: "Medical & Emergency",
      docs: [
        { id: "medical-records", name: "Medical Records", required: true },
        { id: "prescriptions", name: "Prescription Information", required: true },
        { id: "emergency-contacts", name: "Emergency Contact List", required: true },
        { id: "medical-insurance", name: "Medical Insurance Cards", required: true }
      ]
    }
  ];

  const toggleCheck = (docId: string) => {
    const newChecked = new Set(checkedDocs);
    if (newChecked.has(docId)) {
      newChecked.delete(docId);
    } else {
      newChecked.add(docId);
    }
    setCheckedDocs(newChecked);
  };

  const totalDocs = documentCategories.reduce((sum, cat) => sum + cat.docs.length, 0);
  const checkedCount = checkedDocs.size;
  const completionRate = Math.round((checkedCount / totalDocs) * 100);

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 pt-12">
        <h1 className="text-2xl font-bold mb-2">Important Documents</h1>
        <p className="text-primary-foreground/90 text-sm">
          Secure your essential documents in Google Drive
        </p>
      </div>

      <div className="p-4">
        {/* Google Drive Connection */}
        {!isConnected ? (
          <Alert className="mb-6 border-yellow/30 bg-yellow/10">
            <Shield className="h-4 w-4 text-yellow" />
            <AlertDescription className="text-yellow-foreground">
              Connect to Google Drive to securely store and organize your important documents.
              <Button 
                className="mt-3 w-full bg-gradient-primary"
                onClick={() => setIsConnected(true)}
              >
                <ExternalLink size={16} className="mr-2" />
                Connect Google Drive
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Card className="mb-6 shadow-soft border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Google Drive Connected</h3>
                  <p className="text-sm text-muted-foreground">Documents will be stored securely</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <FolderPlus size={16} className="mr-2" />
                  Create Folder
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <ExternalLink size={16} className="mr-2" />
                  Open Drive
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Overview */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-title">Document Checklist Progress</h3>
              <span className="text-2xl font-bold text-primary">{completionRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {checkedCount} of {totalDocs} documents organized
            </p>
          </CardContent>
        </Card>

        {/* Document Categories */}
        <div className="space-y-6">
          {documentCategories.map((category) => (
            <Card key={category.title} className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-title">{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.docs.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-smooth"
                  >
                    <button
                      onClick={() => toggleCheck(doc.id)}
                      className="flex-shrink-0"
                    >
                      {checkedDocs.has(doc.id) ? (
                        <CheckCircle2 size={20} className="text-primary" />
                      ) : (
                        <Circle size={20} className="text-muted-foreground" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${checkedDocs.has(doc.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {doc.name}
                        </h4>
                        {doc.required && (
                          <span className="text-xs bg-coral text-coral-foreground px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {isConnected && (
                      <Button variant="ghost" size="sm">
                        <Upload size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips Section */}
        <Card className="mt-6 shadow-soft">
          <CardHeader>
            <CardTitle className="text-title">Document Security Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <FileText size={16} className="mt-0.5 text-primary flex-shrink-0" />
              <p>Scan documents at 300 DPI or higher for clear, readable copies</p>
            </div>
            <div className="flex items-start gap-2">
              <FileText size={16} className="mt-0.5 text-primary flex-shrink-0" />
              <p>Use descriptive filenames like "2024_HomeInsurance_Policy.pdf"</p>
            </div>
            <div className="flex items-start gap-2">
              <FileText size={16} className="mt-0.5 text-primary flex-shrink-0" />
              <p>Keep originals in a waterproof, fireproof safe</p>
            </div>
            <div className="flex items-start gap-2">
              <FileText size={16} className="mt-0.5 text-primary flex-shrink-0" />
              <p>Update documents annually or when major life events occur</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentsPage;