import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Diamond, Droplets, Gift, ArrowLeft } from "lucide-react";
import { SecureLink } from "@/components/SecureRouter";
import { Layout } from "@/components/Layout";
import PaymentModal from "@/components/PaymentModal";
import { useAuth } from "@/hooks/useAuth";
import aquaLogo from '@/assets/aqua-logo.jpg';
import agateLogo from '@/assets/agate-logo.jpg';
import topazLogo from '@/assets/topaz-logo.jpg';
import basicDbLogo from '@/assets/basic-db-logo.jpg';
import interDbLogo from '@/assets/inter-db-logo.png';
import proDbLogo from '@/assets/pro-db-logo.png';

const Market = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
    currency: string;
    symbol: string;
  } | null>(null);

  // Currency and pricing based on language
  const getPricing = () => {
    switch (language) {
      case 'en':
        return {
          currency: 'USD',
          symbol: '$',
          topaz: 0.99,
          agate: 1.99,
          aqua: 4.99
        };
      case 'my':
        return {
          currency: 'MYR',
          symbol: 'RM',
          topaz: 3.99,
          agate: 8.99,
          aqua: 20.99
        };
      case 'id':
        return {
          currency: 'IDR',
          symbol: 'Rp',
          topaz: 16000,
          agate: 33000,
          aqua: 79000
        };
      default:
        return {
          currency: 'USD',
          symbol: '$',
          topaz: 0.99,
          agate: 1.99,
          aqua: 4.99
        };
    }
  };

  const pricing = getPricing();

  const formatPrice = (price: number) => {
    if (language === 'id') {
      return `${pricing.symbol}${price.toLocaleString('id-ID')}`;
    } else if (language === 'my') {
      return `${pricing.symbol}${price}`;
    }
    return `${pricing.symbol}${price}`;
  };

  const handleUpgrade = (plan: any) => {
    if (!plan.current) {
      setSelectedPlan({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: pricing.currency,
        symbol: pricing.symbol
      });
      setIsPaymentModalOpen(true);
    }
  };

  // Determine current user plan
  const getCurrentPlan = () => {
    if (user?.isAqua) return 'aqua';
    if (user?.isAgate) return 'agate';
    if (user?.isTopaz) return 'topaz';
    return 'free';
  };

  const currentUserPlan = getCurrentPlan();

  const plans = [
    {
      id: 'free',
      name: t('market.freePlan'),
      price: 0,
      icon: Gift,
      description: t('market.freeDescription'),
      features: [
        'Basic article creation',
        'Standard posting limits', 
        'Basic community access',
        'Limited storage'
      ],
      current: currentUserPlan === 'free',
      hoverClass: 'hover:scale-110 transition-all duration-300 ease-in-out'
    },
    {
      id: 'topaz',
      name: t('market.topazPlan'),
      price: pricing.topaz,
      icon: null,
      customIcon: topazLogo,
      description: t('market.topazDescription'),
      features: [
        'Unlimited article creation',
        'Priority content visibility',
        'Advanced analytics',
        'Enhanced storage'
      ],
      current: currentUserPlan === 'topaz',
      hoverClass: 'hover:scale-110 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/50 hover:bg-gradient-to-br hover:from-orange-400 hover:to-yellow-400 hover:text-white transition-all duration-300 ease-in-out'
    },
    {
      id: 'agate',
      name: t('market.agatePlan'),
      price: pricing.agate,
      icon: null,
      customIcon: agateLogo,
      description: t('market.agateDescription'),
      features: [
        'Premium content tools',
        'Advanced customization',
        'Priority support',
        'Verified creator badge'
      ],
      current: currentUserPlan === 'agate',
      hoverClass: 'hover:scale-110 hover:border-gray-400 hover:shadow-lg hover:shadow-gray-400/50 hover:bg-gradient-to-br hover:from-gray-300 hover:to-gray-700 hover:text-white transition-all duration-300 ease-in-out'
    },
    {
      id: 'aqua',
      name: t('market.aquaPlan'),
      price: pricing.aqua,
      icon: null,
      customIcon: aquaLogo,
      description: t('market.aquaDescription'),
      features: [
        'All premium features',
        'Exclusive content access',
        'White-label options',
        'Dedicated account manager'
      ],
      current: currentUserPlan === 'aqua',
      hoverClass: 'hover:scale-110 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/50 hover:bg-gradient-to-br hover:from-blue-300 hover:to-blue-600 hover:text-white transition-all duration-300 ease-in-out'
    }
  ];

  // State to track if an upgrade is in progress to prevent race conditions
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleDatabaseUpgrade = async (plan: string, price: number) => {
    if (isUpgrading) {
      return; // Prevent multiple concurrent requests
    }

    setIsUpgrading(true);
    try {
      const response = await fetch('/api/user/database-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: plan }),
      });

      if (response.ok) {
        window.location.reload(); // Reload to show new badges
      } else {
        // Fallback to payment modal
        setSelectedPlan({
          id: `${plan}-db`,
          name: `${plan.charAt(0).toUpperCase() + plan.slice(1)}+ DB`,
          price: price,
          currency: pricing.currency,
          symbol: pricing.symbol
        });
        setIsPaymentModalOpen(true);
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setIsUpgrading(false); // Allow future upgrades
    }
  };

  return (
    <Layout>
      <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background - Always Black */}
      <div 
        className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${
          hoveredPlan ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background: '#000000'
        }}
      >

        {/* Animated Stars */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Larger glowing stars */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-purple-300 rounded-full opacity-60 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Topaz Hover Background - Orange to Gold Gradient */}
      <div 
        className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${
          hoveredPlan === 'topaz' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.20) 0%, rgba(255, 215, 0, 0.20) 50%, rgba(255, 193, 7, 0.20) 100%), #000000'
        }}
      >
        {/* Topaz Stars */}
        <div className="absolute inset-0">
          {[...Array(95)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-200 rounded-full opacity-80 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
          {[...Array(30)].map((_, i) => (
            <div
              key={`medium-${i}`}
              className="absolute w-2 h-2 bg-orange-200 rounded-full opacity-70 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
          {[...Array(17)].map((_, i) => (
            <div
              key={`large-${i}`}
              className="absolute w-3 h-3 bg-orange-200 rounded-full opacity-60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        {/* Topaz Crystals - Matching Layout Component */}
        <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 transform rotate-45 opacity-35 animate-pulse"></div>
        <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-orange-300 to-yellow-400 transform rotate-12 opacity-45 animate-pulse"></div>
        <div className="absolute top-20 left-20 w-10 h-10 bg-gradient-to-br from-yellow-200 to-orange-300 transform rotate-45 opacity-40 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-14 h-14 bg-gradient-to-br from-orange-400 to-yellow-300 transform -rotate-12 opacity-30 animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-300 transform -rotate-12 opacity-30 animate-pulse"></div>
        <div className="absolute bottom-4 right-4 w-13 h-13 bg-gradient-to-br from-orange-400 to-yellow-300 transform rotate-45 opacity-40 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-11 h-11 bg-gradient-to-br from-yellow-300 to-orange-200 transform rotate-12 opacity-35 animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-15 h-15 bg-gradient-to-br from-orange-300 to-yellow-400 transform rotate-45 opacity-45 animate-pulse"></div>
        <div className="absolute bottom-0 right-20 w-8 h-8 bg-gradient-to-br from-yellow-300 to-orange-400 transform rotate-45 opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-32 w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-300 transform rotate-12 opacity-35 animate-pulse"></div>
      </div>

      {/* Agate Hover Background - Gray to Silver White Gradient */}
      <div 
        className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${
          hoveredPlan === 'agate' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(128, 128, 128, 0.18) 0%, rgba(169, 169, 169, 0.18) 40%, rgba(192, 192, 192, 0.18) 70%, rgba(248, 248, 255, 0.18) 100%), #000000'
        }}
      >
        {/* Agate Stars */}
        <div className="absolute inset-0">
          {[...Array(95)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gray-200 rounded-full opacity-80 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
          {[...Array(30)].map((_, i) => (
            <div
              key={`medium-${i}`}
              className="absolute w-2 h-2 bg-gray-200 rounded-full opacity-70 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
          {[...Array(20)].map((_, i) => (
            <div
              key={`large-${i}`}
              className="absolute w-3 h-3 bg-gray-200 rounded-full opacity-60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        {/* Agate Crystals - Matching Layout Component */}
        <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-500 transform rotate-45 opacity-32 animate-pulse"></div>
        <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 transform rotate-12 opacity-42 animate-pulse"></div>
        <div className="absolute top-20 left-20 w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-400 transform rotate-45 opacity-37 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-300 transform -rotate-12 opacity-27 animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-300 transform -rotate-12 opacity-27 animate-pulse"></div>
        <div className="absolute bottom-4 right-4 w-13 h-13 bg-gradient-to-br from-gray-500 to-gray-200 transform rotate-45 opacity-37 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-11 h-11 bg-gradient-to-br from-gray-300 to-gray-500 transform rotate-12 opacity-32 animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-15 h-15 bg-gradient-to-br from-gray-200 to-gray-400 transform rotate-45 opacity-42 animate-pulse"></div>
        <div className="absolute bottom-0 right-20 w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-400 transform rotate-45 opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-32 w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-200 transform rotate-12 opacity-35 animate-pulse"></div>






      </div>

      {/* Aqua Hover Background - Ocean Blue Gradient */}
      <div 
        className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${
          hoveredPlan === 'aqua' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(25, 25, 112, 0.20) 0%, rgba(0, 100, 150, 0.20) 30%, rgba(70, 130, 180, 0.20) 60%, rgba(135, 206, 235, 0.20) 100%), #000000'
        }}
      >
        {/* Aqua Stars */}
        <div className="absolute inset-0">
          {[...Array(95)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-200 rounded-full opacity-80 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
          {[...Array(30)].map((_, i) => (
            <div
              key={`medium-${i}`}
              className="absolute w-2 h-2 bg-cyan-200 rounded-full opacity-70 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
          {[...Array(20)].map((_, i) => (
            <div
              key={`large-${i}`}
              className="absolute w-3 h-3 bg-cyan-200 rounded-full opacity-60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        {/* Aqua Crystals - Matching Layout Component */}
        <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-cyan-300 to-blue-500 rounded-full opacity-31 animate-pulse"></div>
        <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-full opacity-41 animate-pulse"></div>
        <div className="absolute top-20 left-20 w-10 h-10 bg-gradient-to-br from-cyan-200 to-blue-400 rounded-full opacity-36 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full opacity-26 animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-300 rounded-full opacity-26 animate-pulse"></div>
        <div className="absolute bottom-4 right-4 w-13 h-13 bg-gradient-to-br from-blue-500 to-cyan-300 rounded-full opacity-36 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-11 h-11 bg-gradient-to-br from-cyan-300 to-blue-200 rounded-full opacity-31 animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-15 h-15 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-full opacity-41 animate-pulse"></div>
        <div className="absolute bottom-0 right-20 w-8 h-8 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-32 w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full opacity-35 animate-pulse"></div>




      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen py-8 pb-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8 p-8">
            <h1 className="text-6xl font-bold mb-4 text-white">
              {t('market.title')}
            </h1>
            <p 
              className="text-2xl font-semibold transition-all duration-[3000ms] ease-in-out"
              style={{
                background: 'linear-gradient(-45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd, #98fb98, #f0e68c)',
                backgroundSize: '400% 400%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient 6s ease infinite'
              }}
            >
              Choose the perfect plan for your needs
            </p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.hoverClass} cursor-pointer border-2 backdrop-blur-md ${
                  plan.current 
                    ? 'border-green-400 bg-green-500/10' 
                    : 'border-white/20 bg-white/10'
                }`}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {plan.customIcon ? (
                      <img 
                        src={plan.customIcon} 
                        alt={plan.name} 
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <IconComponent className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold text-white">
                    {plan.name}
                  </CardTitle>
                  <div className="text-3xl font-bold text-white">
                    {plan.price === 0 ? (
                      <span className="text-green-400">
                        {t('market.free')}
                      </span>
                    ) : (
                      <span>
                        {formatPrice(plan.price)}
                        <span className="text-sm text-gray-300 ml-1">
                          {t('market.perMonth')}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-200 text-sm">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-200">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Button positioned below features list */}
                  <Button 
                    onClick={() => handleUpgrade(plan)}
                    className={`w-full font-bold text-sm py-3 transition-all duration-300 ${
                      plan.current 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={plan.current}
                  >
                    {plan.current ? t('market.currentPlan') : t('market.upgrade')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

          {/* Database Plans Section */}
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">Database Plans</h2>
              <p className="text-blue-200 text-lg">Choose your QueitDB hosting plan</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 scale-[0.85]">
              {/* Basic DB Plan */}
              <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-400/40 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-400/50">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <img 
                      src={basicDbLogo} 
                      alt="Basic DB" 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">Basic DB</CardTitle>
                  <div className="text-3xl font-bold text-blue-400 mt-2">Free</div>
                  <p className="text-blue-200 text-sm">Perfect for getting started</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-white text-sm">
                    <li>• 1GB Storage</li>
                    <li>• 512MB RAM</li>
                    <li>• 5 Databases</li>
                    <li>• Basic Support</li>
                    <li>• Basic DB Badge</li>
                  </ul>
                  <Button 
                    onClick={() => window.location.href = '/database'}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Start Free
                  </Button>
                </CardContent>
              </Card>

              {/* Inter+ DB Plan */}
              <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-400/40 backdrop-blur-md transition-all duration-300 hover:scale-105 db-inter-hover">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <img 
                      src={interDbLogo} 
                      alt="Inter+ DB" 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">Inter+ DB</CardTitle>
                  <div className="text-3xl font-bold text-purple-400 mt-2">{formatPrice(pricing.agate)}</div>
                  <p className="text-purple-200 text-sm">For growing applications</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-white text-sm">
                    <li>• 10GB Storage</li>
                    <li>• 2GB RAM</li>
                    <li>• 25 Databases</li>
                    <li>• Priority Support</li>
                    <li>• Inter+ DB Badge</li>
                    <li>• Advanced Analytics</li>
                  </ul>
                  <Button
                    onClick={() => handleDatabaseUpgrade('inter', pricing.agate)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? "Upgrading..." : "Upgrade to Inter+"}
                  </Button>
                </CardContent>
              </Card>

              {/* Pro++ DB Plan */}
              <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-400/40 backdrop-blur-md transition-all duration-300 hover:scale-105 db-pro-hover">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <img 
                      src={proDbLogo} 
                      alt="Pro++ DB" 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">Pro++ DB</CardTitle>
                  <div className="text-3xl font-bold text-cyan-400 mt-2">{formatPrice(pricing.aqua)}</div>
                  <p className="text-cyan-200 text-sm">Enterprise level performance</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-white text-sm">
                    <li>• 100GB Storage</li>
                    <li>• 8GB RAM</li>
                    <li>• Unlimited Databases</li>
                    <li>• 24/7 Premium Support</li>
                    <li>• Pro++ DB Badge</li>
                    <li>• Real-time Monitoring</li>
                    <li>• Auto Backups</li>
                  </ul>
                  ```text
                  <Button
                    onClick={() => handleDatabaseUpgrade('pro', pricing.aqua)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? "Upgrading..." : "Upgrade to Pro++"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-300 text-sm">
              {t('market.allPlansNote')}
            </p>
          </div>
        </div>
      </div>
    </div>

    <PaymentModal 
      isOpen={isPaymentModalOpen}
      onClose={() => setIsPaymentModalOpen(false)}
      selectedPlan={selectedPlan}
    />
    </Layout>
  );
};

export default Market;