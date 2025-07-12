import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageCircle, Mail, Book, Settings, Users, Shield, Database, Zap } from 'lucide-react';

export default function HelpCenter() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <HelpCircle className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Find answers to common questions and learn how to make the most of Queit
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Get instant help from our support team
                </p>
                <Button className="w-full mt-4" variant="outline">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Send us a detailed message
                </p>
                <Button className="w-full mt-4" variant="outline">
                  Send Email
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Book className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Browse our comprehensive guides
                </p>
                <Button className="w-full mt-4" variant="outline">
                  View Docs
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="account">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      How do I create an account?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      You can create an account by clicking the "Login" button in the top right corner and selecting "Sign Up". 
                      We support multiple authentication methods:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Email and password registration</li>
                      <li>Google OAuth integration</li>
                      <li>Discord OAuth integration</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="intelligence">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      What is the Intelligence Quotient Test?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      Our Intelligence Quotient Test is a comprehensive assessment that evaluates your cognitive abilities across multiple domains:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm mb-4">
                      <li><strong>Numerical Reasoning:</strong> Mathematical problem-solving and logical thinking</li>
                      <li><strong>Literacy:</strong> Language comprehension and verbal reasoning</li>
                      <li><strong>Science & Logic:</strong> Scientific knowledge and logical deduction</li>
                    </ul>
                    <p className="text-sm">
                      The test consists of 10 randomly selected questions from a pool of 40, with a 20-minute time limit. 
                      Your IQ score is calculated based on correct answers, completion time, and bonus factors.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="guilds">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      How do guilds work?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      Guilds are community spaces where users can collaborate, share content, and build relationships:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm mb-4">
                      <li><strong>Create or Join:</strong> Start your own guild or join existing ones</li>
                      <li><strong>Post Content:</strong> Share articles, discussions, and media within guild spaces</li>
                      <li><strong>Honor System:</strong> Earn honor points through guild participation and contributions</li>
                      <li><strong>Role Management:</strong> Guilds have owners, admins, and members with different permissions</li>
                    </ul>
                    <p className="text-sm">
                      Guild owners can manage settings, invite members, and moderate content. 
                      Members can leave guilds at any time by providing password verification.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="honor">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Badge className="h-5 w-5 text-purple-600" />
                      What is the Honor system?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      The Honor system rewards users for meaningful contributions to the Queit community:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm mb-4">
                      <li><strong>Article Creation:</strong> +0.1 honor per published article</li>
                      <li><strong>Page Post Likes:</strong> +0.2 honor per like received on your posts</li>
                      <li><strong>Comments:</strong> +0.1 honor per comment received on your content</li>
                      <li><strong>Engagement Milestones:</strong> Bonus honor for reaching like milestones</li>
                    </ul>
                    <p className="text-sm">
                      Users with 500+ honor receive blue verification checkmarks. 
                      Honor is permanent and reflects your overall contribution to the community.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="database">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-cyan-600" />
                      What is QueitDB?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      QueitDB is our free database service offering MongoDB-compatible storage for developers:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm mb-4">
                      <li><strong>Free Tier:</strong> 1GB storage with 512MB RAM</li>
                      <li><strong>Database Management:</strong> Web-based administration panel</li>
                      <li><strong>Real-time Monitoring:</strong> Live server metrics and logging</li>
                      <li><strong>API Integration:</strong> RESTful endpoints for external applications</li>
                    </ul>
                    <p className="text-sm">
                      Access QueitDB through the /database route after logging in. 
                      Includes connection tutorials for Node.js, Python, and platform integration.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="themes">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-orange-600" />
                      How do premium themes work?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      Premium themes provide enhanced visual experiences with membership tiers:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm mb-4">
                      <li><strong>Free Themes:</strong> Dark, Light, and Auto modes available to all users</li>
                      <li><strong>Topaz Theme:</strong> Golden gradient with animated stars (Topaz membership)</li>
                      <li><strong>Agate Theme:</strong> Silver gradient with diamond crystals (Agate membership)</li>
                      <li><strong>Aqua Theme:</strong> Ocean gradient with flowing effects (Aqua membership)</li>
                    </ul>
                    <p className="text-sm">
                      Premium themes include animated backgrounds, custom star patterns, and exclusive visual effects. 
                      Themes are tied to membership levels and can be changed in the header settings.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-2xl">Need More Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Contact Support</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Our support team is available 24/7 to help with any issues or questions.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> support@queit.com</p>
                    <p><strong>Response Time:</strong> Usually within 24 hours</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Technical Support</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    For technical issues, API questions, or database support.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> tech@queit.com</p>
                    <p><strong>Documentation:</strong> <a href="/api/docs" className="text-blue-600 hover:text-blue-800">API Documentation</a></p>
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