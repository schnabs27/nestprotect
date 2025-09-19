import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search by ZIP Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter ZIP code (e.g., 12345)"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="flex-1"
                maxLength={10}
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-foreground">
                  {results}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
};

export default PerplexitySearchPage;