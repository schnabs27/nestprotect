import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Alert {
  senderName: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

interface GovernmentAlertsProps {
  alerts: Alert[];
}

const GovernmentAlerts: React.FC<GovernmentAlertsProps> = ({ alerts }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-4">
      <h4 className="font-semibold mb-2 flex items-center gap-1">
        <AlertTriangle size={16} className="text-coral" />
        Government Alerts
      </h4>
      {alerts.length > 0 ? (
        <div className="space-y-2">
          <div className={`${expanded ? 'max-h-96 overflow-y-auto' : 'max-h-32 overflow-hidden'} transition-all duration-300`}>
            {alerts.map((alert, index) => (
              <div key={index} className="border border-coral/20 rounded-lg p-3 bg-coral/5 mb-2">
                <div className="flex items-start justify-between mb-1">
                  <h5 className="font-medium text-coral text-sm">{alert.event}</h5>
                  <Badge variant="destructive" className="text-xs bg-coral">
                    ALERT
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {alert.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  From: {alert.senderName} | Expires: {new Date(alert.end * 1000).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          {alerts.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full text-xs text-muted-foreground h-6"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  View all {alerts.length} alerts
                </>
              )}
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-muted/30 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">No active weather alerts for your area.</p>
        </div>
      )}
    </div>
  );
};

export default GovernmentAlerts;