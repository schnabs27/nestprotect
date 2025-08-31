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

interface AlertCardProps {
  alert: Alert;
  index: number;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, index }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const maxLength = 150;
  const isLongDescription = alert.description.length > maxLength;
  const displayDescription = showFullDescription 
    ? alert.description 
    : alert.description.slice(0, maxLength) + (isLongDescription ? '...' : '');

  return (
    <div className="border border-coral/20 rounded-lg p-3 bg-coral/5 mb-2 min-h-[100px]">
      <div className="flex items-start justify-between mb-2">
        <h5 className="font-medium text-coral text-sm">{alert.event}</h5>
        <Badge variant="destructive" className="text-xs bg-coral">
          ALERT
        </Badge>
      </div>
      <div className="text-sm text-muted-foreground mb-2 leading-relaxed">
        {displayDescription}
        {isLongDescription && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="ml-1 text-coral hover:underline text-xs font-medium"
          >
            {showFullDescription ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        From: {alert.senderName} | Expires: {new Date(alert.end * 1000).toLocaleString()}
      </p>
    </div>
  );
};

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
        <div className={`${expanded ? 'max-h-96 overflow-y-auto' : 'max-h-44 overflow-hidden'} transition-all duration-300`}>
          {alerts.map((alert, index) => (
            <AlertCard key={index} alert={alert} index={index} />
          ))}
        </div>
        {alerts.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full text-xs text-muted-foreground h-6 mt-2"
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