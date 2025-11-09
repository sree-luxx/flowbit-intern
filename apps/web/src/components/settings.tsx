'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Settings() {
  const [settings, setSettings] = useState({
    companyName: 'Buchhaltung',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Europe/Berlin',
    language: 'English',
    notifications: true,
    emailNotifications: true,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage your application preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <Input
              value={settings.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date Format</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={settings.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
            >
              <option value="Europe/Berlin">Europe/Berlin (GMT+1)</option>
              <option value="UTC">UTC (GMT+0)</option>
              <option value="America/New_York">America/New_York (GMT-5)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
            >
              <option value="English">English</option>
              <option value="German">German</option>
              <option value="French">French</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Enable Notifications</label>
              <p className="text-sm text-muted-foreground">Receive in-app notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleChange('notifications', e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Email Notifications</label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              className="w-4 h-4"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
}

