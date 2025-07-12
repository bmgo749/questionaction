import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cookie, Settings, Shield, BarChart3, Target, AlertCircle, CheckCircle } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Cookie className="h-16 w-16 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Last updated: July 12, 2025
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-6 w-6 text-amber-600" />
                What Are Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
                They are widely used to make websites work more efficiently and to provide information to website owners.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                At Queit, we use cookies to enhance your experience, analyze usage patterns, and provide personalized content. 
                This policy explains what cookies we use and how you can manage them.
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-blue-600" />
                Types of Cookies We Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-800 dark:text-green-400">Essential Cookies</h3>
                    <Badge variant="outline" className="text-green-600 border-green-600">Required</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    These cookies are necessary for the website to function and cannot be switched off. They enable core functionality such as:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• User authentication and session management</li>
                    <li>• Security features and fraud prevention</li>
                    <li>• Shopping cart and checkout functionality</li>
                    <li>• Load balancing and performance optimization</li>
                    <li>• Language preferences and accessibility settings</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800 dark:text-blue-400">Analytics Cookies</h3>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">Optional</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    These cookies help us understand how visitors use our website by collecting anonymous information:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Page views and user navigation patterns</li>
                    <li>• Time spent on pages and bounce rates</li>
                    <li>• Feature usage and interaction tracking</li>
                    <li>• Error reporting and performance monitoring</li>
                    <li>• Popular content and search queries</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-800 dark:text-purple-400">Preference Cookies</h3>
                    <Badge variant="outline" className="text-purple-600 border-purple-600">Optional</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    These cookies remember your preferences and settings to provide a personalized experience:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Theme preferences (Dark, Light, Premium themes)</li>
                    <li>• Language and region settings</li>
                    <li>• Display preferences and layout choices</li>
                    <li>• Notification settings and preferences</li>
                    <li>• IQ test status and completion tracking</li>
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold text-orange-800 dark:text-orange-400">Marketing Cookies</h3>
                    <Badge variant="outline" className="text-orange-600 border-orange-600">Optional</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    These cookies are used to deliver relevant advertisements and track campaign effectiveness:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Targeted advertising based on interests</li>
                    <li>• Social media integration and sharing</li>
                    <li>• Conversion tracking and attribution</li>
                    <li>• A/B testing and optimization</li>
                    <li>• Retargeting and remarketing campaigns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specific Cookies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                Specific Cookies We Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Cookie Name</th>
                        <th className="text-left p-3 font-semibold">Purpose</th>
                        <th className="text-left p-3 font-semibold">Duration</th>
                        <th className="text-left p-3 font-semibold">Type</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-400">
                      <tr className="border-b">
                        <td className="p-3 font-mono">queit-session</td>
                        <td className="p-3">User authentication and session management</td>
                        <td className="p-3">24 hours</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-green-600">Essential</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-mono">theme-preference</td>
                        <td className="p-3">Remember selected theme (Dark/Light/Premium)</td>
                        <td className="p-3">1 year</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-purple-600">Preference</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-mono">language-pref</td>
                        <td className="p-3">Store language selection (EN/ID/MY)</td>
                        <td className="p-3">1 year</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-purple-600">Preference</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-mono">iq-test-status</td>
                        <td className="p-3">Track Intelligence Quotient Test completion</td>
                        <td className="p-3">Permanent</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-purple-600">Preference</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-mono">analytics-id</td>
                        <td className="p-3">Anonymous user tracking for analytics</td>
                        <td className="p-3">2 years</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-blue-600">Analytics</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-mono">cookie-consent</td>
                        <td className="p-3">Remember cookie consent preferences</td>
                        <td className="p-3">1 year</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-green-600">Essential</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-mono">performance-data</td>
                        <td className="p-3">Monitor website performance and errors</td>
                        <td className="p-3">30 days</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-blue-600">Analytics</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Cookies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                Third-Party Cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We also use cookies from trusted third-party services to enhance functionality:
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Google Services</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Used for OAuth authentication and analytics. Privacy Policy: 
                      <a href="https://policies.google.com/privacy" target="_blank" className="text-blue-600 hover:text-blue-800 ml-1">
                        Google Privacy Policy
                      </a>
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Google OAuth: Authentication cookies for Google login</li>
                      <li>• Google Analytics: Usage tracking and performance monitoring</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-400 mb-2">Discord Integration</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Used for Discord OAuth authentication. Privacy Policy: 
                      <a href="https://discord.com/privacy" target="_blank" className="text-purple-600 hover:text-purple-800 ml-1">
                        Discord Privacy Policy
                      </a>
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Discord OAuth: Authentication cookies for Discord login</li>
                      <li>• Discord API: User profile and connection data</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                    <h4 className="font-semibold text-cyan-800 dark:text-cyan-400 mb-2">Database Services</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      MongoDB Atlas for database hosting and management.
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Session management and user data storage</li>
                      <li>• Performance monitoring and optimization</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Managing Cookies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-orange-600" />
                Managing Your Cookie Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You have several options to manage cookies on our website:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">Cookie Settings</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Use our cookie preferences center to control non-essential cookies:
                    </p>
                    <Button className="w-full" onClick={() => {
                      // This would trigger the cookie consent modal
                      window.dispatchEvent(new CustomEvent('showCookieSettings'));
                    }}>
                      Manage Cookie Settings
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Browser Settings</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Configure cookie settings directly in your browser:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Chrome: Settings → Privacy → Cookies</li>
                      <li>• Firefox: Settings → Privacy → Cookies</li>
                      <li>• Safari: Preferences → Privacy → Cookies</li>
                      <li>• Edge: Settings → Privacy → Cookies</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-400">Important Note</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Disabling certain cookies may impact your experience on our website. Essential cookies cannot be disabled 
                    as they are necessary for the website to function properly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates and Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Updates and Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Policy Updates</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We may update this Cookie Policy from time to time. When we do, we will notify you by updating the 
                      "Last updated" date at the top of this page and, if the changes are significant, by displaying a 
                      notice on our website.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Contact Us</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      If you have questions about our use of cookies, please contact us:
                    </p>
                    <div className="space-y-1 text-sm">
                      <p><strong>Email:</strong> privacy@queit.com</p>
                      <p><strong>Support:</strong> support@queit.com</p>
                      <p><strong>Website:</strong> https://queit-two.vercel.app</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}