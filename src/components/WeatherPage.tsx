import { useUserLocation } from "@/hooks/useUserLocation";
import { CheckSquare, Cloud, Flame, Car, AlertTriangle, Thermometer, Droplets, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const WeatherPage = () => {
  const { zipCode } = useUserLocation();

  // Mock data - will be replaced with real API calls
  const mockWeatherData = {
    temperature: 72,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 8,
    windDirection: "SW"
  };

  const mockAlerts = [
    {
      id: "1",
      title: "Severe Thunderstorm Warning",
      description: "Damaging winds up to 70 mph and large hail possible until 6:00 PM",
      severity: "high"
    }
  ];

  const mockWildfire = {
    hasActive: true,
    distance: "12 miles NE",
    threatLevel: "moderate"
  };

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 pt-12">
        <h1 className="text-2xl font-bold mb-2">During Emergency</h1>
        <p className="text-primary-foreground/90">Real-time conditions for {zipCode}</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Action Plan Button */}
        <Card className="shadow-soft border-primary/20">
          <CardContent className="p-4">
            <Button 
              className="w-full h-16 text-lg font-semibold"
              size="lg"
            >
              <CheckSquare className="mr-3" size={24} />
              Emergency Action Plan
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Interactive checklist for emergency response
            </p>
          </CardContent>
        </Card>

        {/* Weather Section */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-title">
              <Cloud size={20} />
              Weather Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Current Weather Overview */}
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-2xl font-bold">{mockWeatherData.temperature}°F</h3>
                  <p className="text-muted-foreground">{mockWeatherData.condition}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <Droplets size={16} className="mx-auto mb-1 text-primary" />
                    <p className="font-medium">{mockWeatherData.humidity}%</p>
                  </div>
                  <div className="text-center">
                    <Wind size={16} className="mx-auto mb-1 text-accent" />
                    <p className="font-medium">{mockWeatherData.windSpeed} mph</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Government Alerts */}
            {mockAlerts.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 flex items-center gap-1">
                  <AlertTriangle size={16} className="text-coral" />
                  Government Alerts
                </h4>
                {mockAlerts.map((alert) => (
                  <div key={alert.id} className="border border-coral/20 rounded-lg p-3 bg-coral/5">
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="font-medium text-coral text-sm">{alert.title}</h5>
                      <Badge variant="destructive" className="text-xs bg-coral">
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 48-Hour Outlook */}
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-semibold mb-2 text-sm">48-Hour Severe Weather Outlook</h4>
              <p className="text-sm text-muted-foreground">
                [Placeholder] Moderate risk of severe thunderstorms developing this afternoon. 
                High winds and hail possible through tomorrow evening.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fire Section */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-title">
              <Flame size={20} />
              Wildfire Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mockWildfire.hasActive ? (
              <div className="border border-amber-500/20 rounded-lg p-4 bg-amber-50/50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-amber-800">Active Fire Detected</h4>
                  <Badge variant="outline" className="border-amber-500 text-amber-700">
                    {mockWildfire.threatLevel.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-amber-700 mb-2">
                  Wildfire activity detected {mockWildfire.distance} from your location
                </p>
                <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">[Fire Map/Alert Placeholder]</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No active wildfire threats in your area</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Traffic Section */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-title">
              <Car size={20} />
              Traffic Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">[Google Maps with Traffic Overlay Placeholder]</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Real-time traffic data for evacuation route planning
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeatherPage;