import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Shield, Users, Database, Zap, AlertTriangle } from 'lucide-react';

export default function TermsOfService() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <FileText className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Last updated: July 12, 2025
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By accessing and using Queit, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
                If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-600" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Queit is a comprehensive intelligence assessment platform with advanced social networking capabilities. Our services include:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Intelligence Assessment</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Comprehensive IQ testing with multi-domain cognitive evaluation including numerical reasoning, literacy, and scientific logic.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">Social Networking</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Guild-based communities, content sharing, and collaborative spaces for knowledge exchange.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-400 mb-2">Content Management</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Article creation, multimedia sharing, and categorized knowledge bases across multiple disciplines.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                    <h4 className="font-semibold text-cyan-800 dark:text-cyan-400 mb-2">QueitDB Service</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Free MongoDB-compatible database hosting with 1GB storage and comprehensive management tools.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  As a user of Queit, you agree to:
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">1</Badge>
                    <div>
                      <h4 className="font-semibold mb-1">Account Security</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Maintain the confidentiality of your account credentials and notify us immediately of any unauthorized access.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">2</Badge>
                    <div>
                      <h4 className="font-semibold mb-1">Content Standards</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Post only appropriate, legal content that respects intellectual property rights and community guidelines.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">3</Badge>
                    <div>
                      <h4 className="font-semibold mb-1">Honor System Integrity</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Earn honor points through legitimate contributions and engagement, without attempting to manipulate the system.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">4</Badge>
                    <div>
                      <h4 className="font-semibold mb-1">Guild Participation</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Participate respectfully in guild communities and follow role-based permissions and guidelines.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">5</Badge>
                    <div>
                      <h4 className="font-semibold mb-1">Database Usage</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Use QueitDB services responsibly within allocated resources and for legitimate purposes only.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  The following activities are strictly prohibited:
                </p>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>Attempting to breach security measures or access unauthorized areas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>Uploading malicious code, viruses, or harmful content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>Harassing, threatening, or impersonating other users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>Posting spam, illegal content, or copyrighted material without permission</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>Manipulating the honor system or attempting to create fake accounts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>Using automated tools to scrape content or overload our servers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>Sharing database credentials or misusing QueitDB services</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-purple-600" />
                Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  All content on Queit, including but not limited to text, graphics, logos, images, and software, is the property of Queit or its licensors and is protected by copyright and other intellectual property laws.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">User-Generated Content</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    By posting content on Queit, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with our services. You retain ownership of your content but are responsible for ensuring you have the right to post it.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                Privacy and Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Your privacy is important to us. Our data collection and use practices are detailed in our Privacy Policy. Key points include:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Data Collection</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We collect information necessary to provide our services, including account data, usage analytics, and user preferences.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Data Security</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We implement industry-standard security measures to protect your data, including encryption and secure authentication.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Service Availability and Modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We strive to maintain high service availability but cannot guarantee uninterrupted access. We reserve the right to:
                </p>
                
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Modify, suspend, or discontinue services with reasonable notice</li>
                  <li>• Perform maintenance and updates that may temporarily affect availability</li>
                  <li>• Update these Terms of Service as needed, with notification to users</li>
                  <li>• Terminate accounts that violate these terms</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  To the fullest extent permitted by law, Queit shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses resulting from your use of our services.
                </p>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    <strong>Disclaimer:</strong> Our services are provided "as is" without any warranties, express or implied. We do not warrant that our services will be error-free, secure, or continuously available.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> legal@queit.com</p>
                    <p><strong>Support:</strong> support@queit.com</p>
                    <p><strong>Website:</strong> https://queit-two.vercel.app</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These terms are governed by applicable law and any disputes will be resolved in accordance with our dispute resolution procedures.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}