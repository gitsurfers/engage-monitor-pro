
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import type { MonitorSettings } from '@/hooks/useMonitor';

interface EngagementSettingsProps {
  settings: MonitorSettings['autoEngagement'];
  onUpdateSettings: (settings: Partial<MonitorSettings['autoEngagement']>) => void;
}

export function EngagementSettings({ settings, onUpdateSettings }: EngagementSettingsProps) {
  return (
    <div className="space-y-6 animate-fade-in p-1">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="auto-engagement">Auto Engagement</Label>
          <p className="text-sm text-muted-foreground">
            Enable automatic engagement with monitored posts
          </p>
        </div>
        <Switch 
          id="auto-engagement" 
          checked={settings.enabled}
          onCheckedChange={(checked) => onUpdateSettings({ enabled: checked })}
        />
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-like">Auto Like</Label>
            <p className="text-sm text-muted-foreground">
              Automatically like posts from monitored accounts
            </p>
          </div>
          <Switch 
            id="auto-like" 
            checked={settings.autoLike}
            onCheckedChange={(checked) => onUpdateSettings({ autoLike: checked })}
            disabled={!settings.enabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-comment">Auto Comment</Label>
            <p className="text-sm text-muted-foreground">
              Automatically comment on posts from monitored accounts
            </p>
          </div>
          <Switch 
            id="auto-comment" 
            checked={settings.autoComment}
            onCheckedChange={(checked) => onUpdateSettings({ autoComment: checked })}
            disabled={!settings.enabled}
          />
        </div>
      </div>
      
      <div className="pt-2">
        <p className="text-sm text-muted-foreground mb-2">
          This is a demo version with limited functionality. 
          In a full version, you would be able to:
        </p>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Create custom auto-reply templates</li>
          <li>Set engagement frequency limits</li>
          <li>Configure priority accounts</li>
          <li>Schedule engagement time windows</li>
        </ul>
      </div>
    </div>
  );
}
