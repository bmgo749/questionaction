import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Cookie, Settings, Shield, BarChart3, Target, X } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    preferences: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = localStorage.getItem('cookie-consent');
    if (!hasConsent) {
      // Show banner after a brief delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPrefs = localStorage.getItem('cookie-preferences');
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    }
  }, []);

  useEffect(() => {
    // Listen for cookie settings event
    const handleShowSettings = () => {
      setShowSettings(true);
    };
    
    window.addEventListener('showCookieSettings', handleShowSettings);
    return () => window.removeEventListener('showCookieSettings', handleShowSettings);
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      preferences: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', 'all');
    localStorage.setItem('cookie-preferences', JSON.stringify(allAccepted));
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      preferences: false,
      marketing: false,
    };
    setPreferences(essentialOnly);
    localStorage.setItem('cookie-consent', 'essential');
    localStorage.setItem('cookie-preferences', JSON.stringify(essentialOnly));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', 'custom');
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: key === 'essential' ? true : value, // Essential cookies cannot be disabled
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Cookie className="h-8 w-8 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">We use cookies</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We use cookies to enhance your experience on Queit. Essential cookies are required for the website to function, 
                  while others help us analyze usage and provide personalized content. You can manage your preferences or learn more in our{' '}
                  <a href="/cookie-policy" className="text-blue-600 hover:text-blue-800 underline">
                    Cookie Policy
                  </a>.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Customize
              </Button>
              <Button
                variant="outline"
                onClick={handleRejectAll}
                className="text-gray-600 hover:text-gray-800"
              >
                Reject All
              </Button>
              <Button
                onClick={handleAcceptAll}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-600" />
              Cookie Preferences
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your cookie preferences below. Essential cookies cannot be disabled as they are necessary for the website to function.
            </p>
            
            {/* Essential Cookies */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-lg">Essential Cookies</span>
                  </div>
                  <Switch
                    checked={preferences.essential}
                    onCheckedChange={(checked) => handlePreferenceChange('essential', checked)}
                    disabled={true}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These cookies are necessary for the website to function and cannot be switched off. They enable core functionality 
                  such as user authentication, security features, and basic site operations.
                </p>
              </CardContent>
            </Card>

            {/* Analytics Cookies */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span className="text-lg">Analytics Cookies</span>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These cookies help us understand how visitors use our website by collecting anonymous information about 
                  page views, user behavior, and site performance.
                </p>
              </CardContent>
            </Card>

            {/* Preference Cookies */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <span className="text-lg">Preference Cookies</span>
                  </div>
                  <Switch
                    checked={preferences.preferences}
                    onCheckedChange={(checked) => handlePreferenceChange('preferences', checked)}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These cookies remember your preferences and settings such as theme selection, language preferences, 
                  and other customization options to provide a personalized experience.
                </p>
              </CardContent>
            </Card>

            {/* Marketing Cookies */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <span className="text-lg">Marketing Cookies</span>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These cookies are used to deliver relevant advertisements and track the effectiveness of our marketing campaigns. 
                  They may be set by us or by third-party advertising partners.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePreferences}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}