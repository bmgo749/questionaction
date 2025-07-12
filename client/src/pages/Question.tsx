import { HelpCircle, Mail, Phone, MapPin, Clock, Shield, FileText, Users, Brain } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useIQStatus } from '@/hooks/useIQStatus';
import { SecureLink } from '@/components/SecureRouter';

export default function Question() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: iqStatus } = useIQStatus();

  const faqItems = [
    {
      question: "How do I create an article?",
      answer: "Click on 'Creativity Creation' in the header or navigation menu to start creating your article. Fill in the title, select a category, add content, and publish."
    },
    {
      question: "How does the honour system work?",
      answer: "You earn 0.1 honour points for each article you create. You also get additional honour based on likes: 1 honour for 100+ likes, 5 honour for 1000+ likes, and 10+ honour for 10,000+ likes."
    },
    {
      question: "Can I edit my profile?",
      answer: "Yes! Go to your profile page by clicking on your profile picture in the header. You can update your name, description, alias, and profile picture."
    },
    {
      question: "How do I search for articles?",
      answer: "Use the search bar on the home page to find articles by title, content, or category. You can also browse by category or check trending topics."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use industry-standard security measures to protect your data. All communications are encrypted and we never share your personal information."
    }
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      content: "support@queit.com",
      description: "Get help within 24 hours"
    },
    {
      icon: Clock,
      title: "Support Hours",
      content: "24/7 Available",
      description: "We're here when you need us"
    },
    {
      icon: MapPin,
      title: "Location",
      content: "Global Platform",
      description: "Serving users worldwide"
    }
  ];

  const resources = [
    {
      icon: FileText,
      title: "Terms of Service",
      description: "Read our terms and conditions",
      link: "#"
    },
    {
      icon: Shield,
      title: "Privacy Policy",
      description: "Learn how we protect your data",
      link: "#"
    },
    {
      icon: Users,
      title: "Community Guidelines",
      description: "Guidelines for a positive community",
      link: "#"
    },
    {
      icon: HelpCircle,
      title: "Help Center",
      description: "Find answers to common questions",
      link: "#"
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Hi {user?.firstName || 'Newcomer'}!
                </h1>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  Welcome to Queit, here you can ask and make an action for answer these question! 
                  Now you can search any article do you want or review and comment it!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* IQ Test Section - Only show if test hasn't been taken */}
        {iqStatus && !iqStatus.iqTestTaken && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Take Your Intelligence Quotient Test
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Get a personalized score displayed with your profile and comments
                      </p>
                    </div>
                  </div>
                  <SecureLink href="/iq-test">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Brain className="h-4 w-4 mr-2" />
                      Start Test
                    </Button>
                  </SecureLink>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {item.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {item.answer}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                    <info.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {info.title}
                    </h3>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {info.content}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {info.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Resources Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resources & Legal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {resources.map((resource, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <resource.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {resource.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {resource.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Need More Help?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Can't find what you're looking for? Get in touch with our support team
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Browse Help Center
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}