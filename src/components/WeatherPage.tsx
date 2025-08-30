import { useState } from "react";
import { MapPin, AlertTriangle, Thermometer, Droplets, Wind, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WeatherMap from "@/components/WeatherMap";

const WeatherPage = () => {
  const [location, setLocation] = useState("Springfield, IL");
  const [locationInput, setLocationInput] = useState("");

  const mockCurrentWeather = {
    temperature: 72,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 8,
    windDirection: "SW"
  };

  const mockHourlyForecast = [
    { time: "2 PM", temp: 74, condition: "sunny", precipitation: 0 },
    { time: "3 PM", temp: 76, condition: "partly-cloudy", precipitation: 0 },
    { time: "4 PM", temp: 75, condition: "cloudy", precipitation: 10 },
    { time: "5 PM", temp: 73, condition: "rain", precipitation: 60 },
  ];

  const mockAlerts = [
    {
      id: "1",
      title: "Severe Thunderstorm Warning",
      description: "Damaging winds up to 70 mph and large hail possible",
      severity: "high",
      expiresAt: "6:00 PM today"
    }
  ];

  const handleLocationChange = () => {
    if (locationInput.trim()) {
      setLocation(locationInput.trim());
      setLocationInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLocationChange();
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 pt-12">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={20} />
          <span className="text-lg font-medium">{location}</span>
        </div>
        <h1 className="text-3xl font-bold">{mockCurrentWeather.temperature}°F</h1>
        <p className="text-primary-foreground/90">{mockCurrentWeather.condition}</p>
      </div>

      <div className="p-4">
        {/* Location Change */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle className="text-title">Change Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter city or ZIP code"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleLocationChange} size="icon">
                <Search size={16} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Current location: {location}
            </p>
          </CardContent>
        </Card>

        {/* Weather Alerts */}
        {mockAlerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-title mb-3 flex items-center gap-2">
              <AlertTriangle size={20} className="text-coral" />
              Weather Alerts
            </h2>
            {mockAlerts.map((alert) => (
              <Card key={alert.id} className="border-coral shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-coral">{alert.title}</h3>
                    <Badge variant="destructive" className="bg-coral">
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {alert.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {alert.expiresAt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Weather Map temporarily removed for debugging */}
        {/* <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle className="text-title">Weather Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <WeatherMap location={location} className="h-80" />
          </CardContent>
        </Card> */}

        {/* Current Stats */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle className="text-title">Current Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Thermometer className="mx-auto mb-2 text-coral" size={24} />
                <p className="text-2xl font-bold">{mockCurrentWeather.temperature}°</p>
                <p className="text-xs text-muted-foreground">Temperature</p>
              </div>
              <div className="text-center">
                <Droplets className="mx-auto mb-2 text-primary" size={24} />
                <p className="text-2xl font-bold">{mockCurrentWeather.humidity}%</p>
                <p className="text-xs text-muted-foreground">Humidity</p>
              </div>
              <div className="text-center">
                <Wind className="mx-auto mb-2 text-accent" size={24} />
                <p className="text-2xl font-bold">{mockCurrentWeather.windSpeed}</p>
                <p className="text-xs text-muted-foreground">mph {mockCurrentWeather.windDirection}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forecast Tabs */}
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="daily">7-Day</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hourly" className="mt-4">
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {mockHourlyForecast.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="font-medium">{hour.time}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {hour.precipitation}% rain
                        </span>
                        <span className="font-semibold">{hour.temp}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="daily" className="mt-4">
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-center py-8">
                  7-day forecast will be displayed here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WeatherPage;