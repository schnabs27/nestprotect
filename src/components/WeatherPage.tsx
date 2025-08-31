import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">During Emergency</h1>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <p className="text-primary-foreground/90">Real-time conditions for {zipCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastRefresh && (
              <div className="flex items-center gap-1 text-sm text-primary-foreground/80">
                <Clock className="h-4 w-4" />
                <span>{Math.round((Date.now() - lastRefresh) / 60000)}m ago</span>
              </div>
            )}
            <Button 
              onClick={handleRefresh} 
              disabled={loading || !canRefresh()}
              variant="outline"
              size="sm"
              className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
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
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-1">
                    <AlertTriangle size={16} className="text-coral" />
                    Government Alerts
                  </h4>
                  {weatherData.alerts.length > 0 ? (
                    weatherData.alerts.map((alert, index) => (
                      <div key={index} className="border border-coral/20 rounded-lg p-3 bg-coral/5 mb-2">
                        <div className="flex items-start justify-between mb-1">
                          <h5 className="font-medium text-coral text-sm">{alert.event}</h5>
                          <Badge variant="destructive" className="text-xs bg-coral">
                            ALERT
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{alert.description}</p>
                        <p className="text-xs text-muted-foreground">
                          From: {alert.senderName} | Expires: {new Date(alert.end * 1000).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">No active weather alerts for your area.</p>
                    </div>
                  )}
                </div>

                {/* 48-Hour Outlook */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <h4 className="font-semibold mb-2 text-sm">48-Hour Severe Weather Outlook</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {weatherData.forecast48h.slice(0, 12).map((hour, index) => (
                      <div key={index} className="flex items-center justify-between text-sm py-1 border-b border-border/30 last:border-0">
                        <span className="font-medium">{formatTime(hour.time)}</span>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{hour.description}</span>
                          <span className="font-medium">{hour.temp}°F</span>
                          {hour.precipitationChance > 0 && (
                            <span className="text-blue-600 text-xs">{hour.precipitationChance}%</span>
                          )}
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-title">
              <Flame size={20} />
              Wildfire Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !fireData ? (
              <div className="text-center py-4">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading fire data...</p>
              </div>
            ) : fireData ? (
              <>
                {fireData.totalFires > 0 ? (
                  <div className="border border-amber-500/20 rounded-lg p-4 bg-amber-50/50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-amber-800">Active Fire Activity</h4>
                      <Badge 
                        variant={getAlertBadgeVariant(fireData.alertLevel)}
                        className="border-amber-500 text-amber-700"
                      >
                        {fireData.alertLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-amber-700 mb-2">
                      {fireData.totalFires} active fire{fireData.totalFires !== 1 ? 's' : ''} detected within 10 miles.
                      {fireData.highConfidenceFires > 0 && (
                        <span className="ml-1">
                          ({fireData.highConfidenceFires} high confidence)
                        </span>
                      )}
                    </p>
                    <div className="max-h-24 overflow-y-auto bg-amber-50/30 rounded p-2">
                      {fireData.fires.slice(0, 3).map((fire, index) => (
                        <div key={index} className="text-xs text-amber-800 border-b border-amber-200/50 pb-1 mb-1 last:border-0 last:mb-0">
                          Lat: {fire.lat.toFixed(4)}, Lon: {fire.lon.toFixed(4)} | 
                          Confidence: {fire.confidence}% | 
                          {fire.date} {fire.time}
                        </div>
                      ))}
                      {fireData.fires.length > 3 && (
                        <p className="text-xs text-amber-700">
                          ...and {fireData.fires.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No active wildfire threats within 10 miles of your area</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-muted/30 rounded-lg p-4">
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
    </div>
  );
};

export default WeatherPage;