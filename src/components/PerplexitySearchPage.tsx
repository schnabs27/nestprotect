import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PerplexityResult {
  answer: string;
}

const PerplexitySearchPage = () => {
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!zipCode.trim()) {
      toast.error("Please enter a ZIP code");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('search-perplexity-simple', {
        body: { zip_code: zipCode.trim() }
      });

      if (error) {
        throw error;
      }

      setResults(data.answer);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-4 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1">AI Disaster Resource Search</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="max-w-4xl mx-auto">
        {/* Search Section */}
        <div className="bg-background shadow-soft p-4">
          <p className="text-muted-foreground mb-4">
            Use Perplexity's AI engine to search the news for local disaster relief resources.
          </p>
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter ZIP code (e.g., 12345)"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="h-12"
                maxLength={10}
              />
            </div>
            <Button 
              type="submit" 
              onClick={handleSearch}
              size="lg"
              className="bg-gradient-primary border-0 shadow-medium hover:shadow-strong transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search size={20} />
              )}
            </Button>
          </div>
        </div>

        {results && (
          <div className="mt-6">
            <h2 className="text-xl font-bold px-4 mb-4" style={{ color: '#0080e0' }}>Search Results</h2>
            <div className="space-y-4">
              {results.split(/(?=Category:)/).filter(record => record.trim()).map((record, index) => {
                const lines = record.trim().split('\n');
                const nameLineIndex = lines.findIndex(line => line.startsWith('Name:'));
                const categoryLineIndex = lines.findIndex(line => line.startsWith('Category:'));
                const descriptionLineIndex = lines.findIndex(line => line.startsWith('Description:'));
                
                const nameLine = nameLineIndex !== -1 ? lines[nameLineIndex] : '';
                const categoryLine = categoryLineIndex !== -1 ? lines[categoryLineIndex] : '';
                const descriptionLine = descriptionLineIndex !== -1 ? lines[descriptionLineIndex] : '';
                
                const nameValue = nameLine.replace('Name:', '').trim();
                const categoryValue = categoryLine.replace('Category:', '').trim();
                const descriptionValue = descriptionLine.replace('Description:', '').trim().replace(/\[\d+\]$/, '').trim();
                
                const otherLines = lines.filter((_, i) => i !== nameLineIndex && i !== categoryLineIndex && i !== descriptionLineIndex);
                
                return (
                  <Card key={index} className="shadow-soft">
                    <CardContent className="p-4">
                      {nameValue && (
                        <h3 className="font-bold mb-2" style={{ color: '#0080e0' }}>
                          {nameValue}
                        </h3>
                      )}
                      {categoryValue && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 mb-2">
                          {categoryValue}
                        </Badge>
                      )}
                      {descriptionValue && (
                        <p className="text-muted-foreground mb-2">
                          {descriptionValue}
                        </p>
                      )}
                      {otherLines.length > 0 && (
                        <div className="whitespace-pre-wrap text-foreground">
                          {otherLines.join('\n')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default PerplexitySearchPage;