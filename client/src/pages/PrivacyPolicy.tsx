import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Database, Users, Settings, Lock, AlertCircle, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Last updated: July 12, 2025
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-blue-600" />
                Our Commitment to Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                At Queit, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, store, and protect your data when you use our intelligence 
                assessment platform and social networking services.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-purple-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Registration Data</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Email address</li>
                        <li>• Username and display name</li>
                        <li>• Password (encrypted)</li>
                        <li>• Profile information</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">OAuth Data</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Google account information</li>
                        <li>• Discord account information</li>
                        <li>• Third-party profile data</li>
                        <li>• OAuth tokens (encrypted)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Usage and Activity Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Intelligence Assessment</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• IQ test responses and scores</li>
                        <li>• Test completion times</li>
                        <li>• Cognitive assessment results</li>
                        <li>• Performance analytics</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-400 mb-2">Social Activity</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Guild memberships and posts</li>
                        <li>• Articles and content creation</li>
                        <li>• Comments and interactions</li>
                        <li>• Honor points and achievements</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Technical Data</h3>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• IP addresses and location data</li>
                      <li>• Device information and browser type</li>
                      <li>• Session data and cookies</li>
                      <li>• Usage analytics and performance metrics</li>
                      <li>• API access logs and database queries</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-orange-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">1</Badge>
                    <div>
                      <h4 className="font-semibold mb-1">Service Provision</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        To provide and maintain our intelligence assessment platform, social networking features, and QueitDB services.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">2</Badge>
                    <div>
                      <h4 className="font-semibold mb-1">Personalization</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        To customize your experience, including theme preferences, language settings, and content recommendations.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">3</Badge>
                    <div>
                      <h4 className="font-semibold mb-1">Analytics and Improvement</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        To analyze usage patterns, improve our algorithms, and enhance the overall user experience.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">4</Badge>
                    <div>
                      <h4 className="font-semibold mb-1">Security and Safety</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        To protect against fraud, unauthorized access, and ensure platform security and integrity.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">5</Badge>
                    <div>
                      <h4 className="font-semibold mb-1">Communication</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        To send important updates, security notifications, and respond to your inquiries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Storage and Security */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-6 w-6 text-red-600" />
                Data Storage and Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">Security Measures</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• End-to-end encryption for sensitive data</li>
                    <li>• Secure authentication using scrypt-based password hashing</li>
                    <li>• Regular security audits and vulnerability assessments</li>
                    <li>• Secure database hosting with MongoDB Atlas</li>
                    <li>• SSL/TLS encryption for all data transmission</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Data Storage</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Primary database: MongoDB Atlas cloud infrastructure</li>
                    <li>• Geographic location: Global distribution with regional optimization</li>
                    <li>• Backup and recovery: Automated daily backups with 30-day retention</li>
                    <li>• QueitDB: Dedicated database service with user-controlled access</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing and Disclosure */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-cyan-600" />
                Data Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-400 mb-1">Service Providers</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      With trusted service providers who assist in operating our platform (e.g., cloud hosting, email services) under strict data protection agreements.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">Legal Requirements</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      When required by law, regulation, or legal process, or to protect our rights, property, or safety.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-1">Business Transfers</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      In the event of a merger, acquisition, or sale of assets, with prior notice to affected users.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights and Choices */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-600" />
                Your Rights and Choices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You have the following rights regarding your personal information:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-400 mb-2">Access and Portability</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Request access to your personal data</li>
                      <li>• Download your data in portable formats</li>
                      <li>• Review your activity and usage history</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">Control and Deletion</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Update or correct your information</li>
                      <li>• Delete your account and associated data</li>
                      <li>• Control privacy settings and preferences</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">How to Exercise Your Rights</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    To exercise these rights, contact us at privacy@queit.com or use the privacy controls in your account settings. 
                    We will respond to your request within 30 days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                Cookies and Tracking Technologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We use cookies and similar technologies to enhance your experience and analyze usage patterns. 
                  For detailed information about our cookie usage, please see our <a href="/cookie-policy" className="text-blue-600 hover:text-blue-800">Cookie Policy</a>.
                </p>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Cookie Categories</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• <strong>Essential:</strong> Required for basic site functionality</li>
                    <li>• <strong>Analytics:</strong> Help us understand how you use our services</li>
                    <li>• <strong>Preferences:</strong> Remember your settings and preferences</li>
                    <li>• <strong>Marketing:</strong> Used to deliver relevant content and advertisements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We retain your personal information only as long as necessary to provide our services and fulfill the purposes outlined in this policy:
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold mb-1">Account Data</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Retained for the duration of your account plus 30 days after deletion for backup purposes.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold mb-1">Analytics Data</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Aggregated and anonymized data may be retained for up to 2 years for research and improvement purposes.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold mb-1">Legal Obligations</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Some data may be retained longer if required by law or for legitimate business purposes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <p><strong>Privacy Officer:</strong> privacy@queit.com</p>
                    <p><strong>General Support:</strong> support@queit.com</p>
                    <p><strong>Data Protection:</strong> data@queit.com</p>
                    <p><strong>Website:</strong> https://queit-two.vercel.app</p>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-400">
                    <strong>Updates to This Policy:</strong> We may update this Privacy Policy from time to time. 
                    We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}