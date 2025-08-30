import { useState, useEffect } from "react";
import { MapPin, AlertTriangle, Thermometer, Droplets, Wind, Search, Navigation, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WeatherMap from "@/components/WeatherMap";

const WeatherPage = () => {
  const [location, setLocation] = useState("Springfield, IL");
  const [locationInput, setLocationInput] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [mapType, setMapType] = useState<'weather' | 'traffic'>('weather');

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

  const handleAutoLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Use reverse geocoding to get location name
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBZhmhQrVv5-ODgo8ptKu8Cj-g_i0Bj2aI`)
          .then(response => response.json())
          .then(data => {
            if (data.results && data.results[0]) {
              const addressComponents = data.results[0].address_components;
              const city = addressComponents.find((component: any) => 
                component.types.includes('locality'))?.long_name || '';
              const state = addressComponents.find((component: any) => 
                component.types.includes('administrative_area_level_1'))?.short_name || '';
              const newLocation = city && state ? `${city}, ${state}` : data.results[0].formatted_address;
              setLocation(newLocation);
            }
          })
          .catch(error => {
            console.error('Geocoding error:', error);
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          })
          .finally(() => {
            setIsLocating(false);
          });
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to retrieve your location. Please enter it manually.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
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
            <div className="flex gap-2 mb-3">
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
              <Button 
                onClick={handleAutoLocation} 
                size="icon" 
                variant="outline"
                disabled={isLocating}
              >
                {isLocating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : (
                  <Navigation size={16} />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
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

        {/* Interactive Maps */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-title">
                {mapType === 'weather' ? 'Weather Map' : 'Traffic Map'}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={mapType === 'weather' ? 'default' : 'outline'}
                  onClick={() => setMapType('weather')}
                  className="text-xs"
                >
                  Weather
                </Button>
                <Button
                  size="sm"
                  variant={mapType === 'traffic' ? 'default' : 'outline'}
                  onClick={() => setMapType('traffic')}
                  className="text-xs"
                >
                  <Car size={14} className="mr-1" />
                  Traffic
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <WeatherMap 
              location={location} 
              className="h-80" 
              mapType={mapType}
            />
          </CardContent>
        </Card>

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