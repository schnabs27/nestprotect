import { useState } from "react";
import { Camera, Plus, Search, Bot, ExternalLink, Package, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const InventoryPage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const mockInventory = [
    {
      id: "1",
      name: "Samsung 65\" Smart TV",
      brand: "Samsung",
      yearBought: "2022",
      condition: "excellent",
      quantity: 1,
      unitPrice: 1200,
      totalPrice: 1200,
      description: "4K UHD Smart TV with HDR",
      location: "Living room",
      room: "Living Room",
      photoLinks: ["photo1.jpg"],
      receiptLinks: ["receipt1.pdf"]
    },
    {
      id: "2", 
      name: "MacBook Pro 16\"",
      brand: "Apple",
      yearBought: "2023",
      condition: "excellent",
      quantity: 1,
      unitPrice: 2499,
      totalPrice: 2499,
      description: "M2 Pro chip, 512GB SSD",
      location: "Home office",
      room: "Office",
      photoLinks: ["photo2.jpg"],
      receiptLinks: []
    }
  ];

  const totalValue = mockInventory.reduce((sum, item) => sum + item.totalPrice, 0);
  const itemCount = mockInventory.reduce((sum, item) => sum + item.quantity, 0);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent": return "bg-primary text-primary-foreground";
      case "good": return "bg-yellow text-yellow-foreground";
      case "damaged": return "bg-coral text-coral-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 pt-12">
        <h1 className="text-2xl font-bold mb-2">Home Inventory</h1>
        <p className="text-primary-foreground/90 text-sm">
          Track your belongings with AI assistance
        </p>
      </div>

      <div className="p-4">
        {/* Google Drive Connection */}
        {!isConnected ? (
          <Alert className="mb-6 border-yellow/30 bg-yellow/10">
            <Package className="h-4 w-4 text-yellow" />
            <AlertDescription className="text-yellow-foreground">
              Connect to Google Drive to store your inventory data securely in your own Google Sheets.
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
          <Alert className="mb-6 border-primary/30 bg-primary/10">
            <Package className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              ✅ Connected to Google Drive - Your inventory is stored in "NestProtect Inventory" spreadsheet
              <Button variant="outline" size="sm" className="mt-2 w-full">
                <ExternalLink size={16} className="mr-2" />
                Open Spreadsheet
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="shadow-soft">
            <CardContent className="p-4 text-center">
              <Package className="mx-auto mb-2 text-primary" size={24} />
              <p className="text-2xl font-bold text-primary">{itemCount}</p>
              <p className="text-sm text-muted-foreground">Items Tracked</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardContent className="p-4 text-center">
              <DollarSign className="mx-auto mb-2 text-primary" size={24} />
              <p className="text-2xl font-bold text-primary">${totalValue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant */}
        <Card className="mb-6 shadow-soft border-accent/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <Bot size={16} className="text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-accent">AI Inventory Assistant</h3>
                <p className="text-sm text-muted-foreground">Take photos and I'll help catalog your items</p>
              </div>
            </div>
            
            <Button className="w-full bg-accent hover:bg-accent/90">
              <Camera size={16} className="mr-2" />
              Add Item with AI
            </Button>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button variant="outline" className="h-12">
            <Plus size={16} className="mr-2" />
            Add Manually
          </Button>
          <Button variant="outline" className="h-12">
            <Camera size={16} className="mr-2" />
            Quick Photo
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Inventory List */}
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid">
            <div className="grid grid-cols-1 gap-4">
              {mockInventory.map((item) => (
                <Card key={item.id} className="shadow-soft hover:shadow-medium transition-smooth">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-title mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{item.brand} • {item.yearBought}</p>
                        <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${item.totalPrice.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getConditionColor(item.condition)}>
                        {item.condition}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.room}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Camera size={14} className="mr-1" />
                        Photos ({item.photoLinks.length})
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        📄 Receipts ({item.receiptLinks.length})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            <div className="space-y-2">
              {mockInventory.map((item) => (
                <Card key={item.id} className="shadow-soft">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-title">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.brand} • {item.room}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">${item.totalPrice.toLocaleString()}</p>
                        <Badge className={getConditionColor(item.condition)}>
                          {item.condition}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card className="mt-6 shadow-soft">
          <CardHeader>
            <CardTitle className="text-title">Inventory Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>📱 Take photos from multiple angles for better documentation</p>
            <p>🧾 Keep digital copies of receipts and warranties</p>
            <p>🔄 Update your inventory annually for insurance purposes</p>
            <p>🏠 Organize by room to make finding items easier</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryPage;