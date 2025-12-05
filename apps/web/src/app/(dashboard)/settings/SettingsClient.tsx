'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Switch,
  Label,
  useToast,
} from '@coupon-management/ui';
import { motion } from 'framer-motion';

interface ReminderPreferences {
  remind_7_days: boolean;
  remind_3_days: boolean;
  remind_1_day: boolean;
}

export default function SettingsClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<ReminderPreferences>({
    remind_7_days: true,
    remind_3_days: true,
    remind_1_day: true,
  });
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >('default');

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
    checkNotificationPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('unsupported');
    }
  };

  const loadPreferences = async () => {
    try {
      const { fetchWithRetry, isOnline } = await import('@/lib/api-client');
      
      // Check if user is online
      if (!isOnline()) {
        throw new Error('You are offline. Please check your internet connection.');
      }

      const result = await fetchWithRetry('/api/reminders');
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load preferences');
      }
      
      const data = result.data || result;
      setPreferences({
        remind_7_days: data.remind_7_days ?? true,
        remind_3_days: data.remind_3_days ?? true,
        remind_1_day: data.remind_1_day ?? true,
      });
    } catch (error) {
      console.error('Error loading preferences:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load reminder preferences';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Your browser does not support notifications',
        variant: 'destructive',
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        toast({
          title: 'Success',
          description: 'Notification permissions granted',
        });
      } else if (permission === 'denied') {
        toast({
          title: 'Permission Denied',
          description:
            'You have denied notification permissions. Reminders cannot be sent. Please enable notifications in your browser settings.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to request notification permissions',
        variant: 'destructive',
      });
    }
  };

  const handleToggle = async (field: keyof ReminderPreferences) => {
    const newValue = !preferences[field];
    const anyEnabled =
      (field === 'remind_7_days' ? newValue : preferences.remind_7_days) ||
      (field === 'remind_3_days' ? newValue : preferences.remind_3_days) ||
      (field === 'remind_1_day' ? newValue : preferences.remind_1_day);

    // If enabling any reminder for the first time and permission not granted
    if (
      anyEnabled &&
      notificationPermission !== 'granted' &&
      notificationPermission !== 'unsupported'
    ) {
      await requestNotificationPermission();
    }

    // Update local state immediately for better UX
    setPreferences((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { fetchWithRetry, isOnline } = await import('@/lib/api-client');
      
      // Check if user is online
      if (!isOnline()) {
        throw new Error('You are offline. Please check your internet connection.');
      }

      const result = await fetchWithRetry('/api/reminders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save preferences');
      }

      toast({
        title: 'Success',
        description: 'Reminder preferences saved successfully',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save reminder preferences';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your reminder preferences and notifications
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reminder Preferences</CardTitle>
            <CardDescription>
              Choose when you want to be notified before your coupons expire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {notificationPermission === 'denied' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
              >
                <p className="text-sm text-destructive">
                  <strong>Notifications Blocked:</strong> You have denied
                  notification permissions. Reminders cannot be sent. Please
                  enable notifications in your browser settings to receive
                  expiration alerts.
                </p>
              </motion.div>
            )}

            {notificationPermission === 'unsupported' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-muted border rounded-lg p-4"
              >
                <p className="text-sm text-muted-foreground">
                  <strong>Notifications Not Supported:</strong> Your browser
                  does not support web push notifications. Reminders will not
                  be sent.
                </p>
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
                <div className="flex-1">
                  <Label htmlFor="remind-7-days" className="text-base">
                    7 days before expiration
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get notified one week before your coupons expire
                  </p>
                </div>
                <Switch
                  id="remind-7-days"
                  checked={preferences.remind_7_days}
                  onCheckedChange={() => handleToggle('remind_7_days')}
                />
              </div>

              <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
                <div className="flex-1">
                  <Label htmlFor="remind-3-days" className="text-base">
                    3 days before expiration
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get notified three days before your coupons expire
                  </p>
                </div>
                <Switch
                  id="remind-3-days"
                  checked={preferences.remind_3_days}
                  onCheckedChange={() => handleToggle('remind_3_days')}
                />
              </div>

              <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
                <div className="flex-1">
                  <Label htmlFor="remind-1-day" className="text-base">
                    1 day before expiration
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get notified one day before your coupons expire
                  </p>
                </div>
                <Switch
                  id="remind-1-day"
                  checked={preferences.remind_1_day}
                  onCheckedChange={() => handleToggle('remind_1_day')}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
