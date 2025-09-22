import React, { useState, useEffect } from 'react';
import MobileNavigation from "@/components/MobileNavigation";
import { useUserLocation } from "@/hooks/useUserLocation";
import { 
  CheckSquare, 
  Cloud, 
  Flame, 
  Car, 
  AlertTriangle, 
  Thermometer, 
  Droplets, 
  Wind,
  RefreshCw,
  Clock,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import WeatherMap from './WeatherMap';
import GovernmentAlerts from './GovernmentAlerts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import nestorDuring from '@/assets/nestprotect-during.png';

interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    description: string;
    icon: string;
  };
  alerts: Array<{
    senderName: string;
    event: string;
    start: number;
    end: number;
    description: string;
    tags: string[];
  }>;
  forecast48h: Array<{
    time: number;
    temp: number;
    condition: string;
    description: string;
    icon: string;
    precipitationChance: number;
  }>;
  timestamp: number;
}

interface FireData {
  fires: Array<{
    lat: number;
    lon: number;
    confidence: number;
    date: string;
    time: string;
    brightness: number;
    frp: number;
  }>;
  alertLevel: 'none' | 'low' | 'medium' | 'high';
  totalFires: number;
  highConfidenceFires: number;
  timestamp: number;
}

const WeatherPage = () => {
  const { zipCode, loading: locationLoading } = useUserLocation();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [fireData, setFireData] = useState<FireData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);

  const canRefresh = () => {
    if (!lastRefresh) return true;
    const fifteenMinutes = 15 * 60 * 1000;
    return Date.now() - lastRefresh > fifteenMinutes;
  };

  const fetchWeatherData = async () => {
    if (!zipCode) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase.functions.invoke('get-weather-data', {
        body: { zipCode }
      });

      if (supabaseError) throw supabaseError;
      if (data.error) throw new Error(data.error);

      setWeatherData(data);
      setLastRefresh(Date.now());
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Failed to fetch weather data');
      toast.error('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFireData = async () => {
    if (!zipCode) return;
    
    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('get-fire-data', {
        body: { zipCode }
      });

      if (supabaseError) throw supabaseError;
      if (data.error) throw new Error(data.error);

      setFireData(data);
    } catch (err) {
      console.error('Fire data fetch error:', err);
      setError('Failed to fetch fire data');
      toast.error('Failed to fetch fire data');
    }
  };

  const handleRefresh = async () => {
    if (!canRefresh()) {
      toast.error('Please wait 15 minutes between refreshes');
      return;
    }
    
    await Promise.all([fetchWeatherData(), fetchFireData()]);
  };

  useEffect(() => {
    if (zipCode) {
      fetchWeatherData();
      fetchFireData();
    }
  }, [zipCode]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      hour: 'numeric',
      hour12: true
    });
  };

  const getAlertBadgeVariant = (alertLevel: string) => {
    switch (alertLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (locationLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading your location...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      {/* Location Header */}
      <div className="bg-background">
        <div className="flex items-center justify-between p-4 pt-8">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{zipCode}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="w-full h-px bg-border"></div>
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <img 
              src={nestorDuring}
              alt="NestProtect during natural disaster - Emergency preparedness guide"
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-primary">Stay aware, act fast.</h1>
            <p className="text-muted-foreground">
              Worried about a disaster? Better safe than sorry. Time to enact your emergency plan. When in doubt, call 911 to share your status and receive instructions.
            </p>
          </div>
        </div>

        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Plan Button */}
        <Card className="shadow-soft border-primary/20">
          <CardContent className="p-4">
            <Button 
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              <CheckSquare className="mr-2" size={20} />
              Emergency Action Plan
            </Button>
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
            {loading && !weatherData ? (
              <div className="text-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading weather data...</p>
              </div>
            ) : weatherData ? (
              <>
                {/* Current Weather Overview */}
                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold">{weatherData.current.temp}°F</h3>
                      <p className="text-muted-foreground capitalize">{weatherData.current.description}</p>
                      <p className="text-sm text-muted-foreground">Feels like {weatherData.current.feelsLike}°F</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <Droplets size={16} className="mx-auto mb-1 text-primary" />
                        <p className="font-medium">{weatherData.current.humidity}%</p>
                        <p className="text-xs text-muted-foreground">Humidity</p>
                      </div>
                      <div className="text-center">
                        <Wind size={16} className="mx-auto mb-1 text-accent" />
                        <p className="font-medium">{weatherData.current.windSpeed} mph</p>
                        <p className="text-xs text-muted-foreground">Wind</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Government Alerts */}
                <GovernmentAlerts alerts={weatherData.alerts} />

                {/* Weather Outlook */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <h4 className="font-semibold mb-2 text-sm">Weather Outlook</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {weatherData.forecast48h.slice(0, 12).map((hour, index) => (
                      <div key={index} className="flex items-center justify-between text-sm py-1 border-b border-border/30 last:border-0">
                        <span className="font-medium">{formatTime(hour.time)}</span>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{hour.description}</span>
                          <span className="font-medium">{hour.temp}°F</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Weather data unavailable. Please try refreshing.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fire Section */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-title">
              <Flame size={20} />
              Wildfire Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading && !fireData ? (
              <div className="text-center py-2">
                <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Loading...</p>
              </div>
            ) : fireData ? (
              <>
                {fireData.totalFires > 0 ? (
                  <div className="border border-amber-500/20 rounded-lg p-3 bg-amber-50/50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-amber-800 text-sm">Active Fire Activity</h4>
                      <Badge 
                        variant={getAlertBadgeVariant(fireData.alertLevel)}
                        className="border-amber-500 text-amber-700 text-xs"
                      >
                        {fireData.alertLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-amber-700">
                      {fireData.totalFires} active fire{fireData.totalFires !== 1 ? 's' : ''} detected within 10 miles.
                      {fireData.highConfidenceFires > 0 && (
                        <span className="ml-1">
                          ({fireData.highConfidenceFires} high confidence)
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground">No active wildfire threats within 10 miles</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Fire data unavailable. Please try refreshing.</p>
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
            <div className="h-64 rounded-lg overflow-hidden">
              <WeatherMap 
                location={zipCode || ''}
                mapType="traffic"
                className="w-full h-full"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Real-time traffic data for evacuation route planning
            </p>
          </CardContent>
        </Card>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default WeatherPage;