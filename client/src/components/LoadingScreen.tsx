import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const { t } = useLanguage();
  const [currentQuote, setCurrentQuote] = useState('');
  const [progress, setProgress] = useState(0);

  const quotes = [
    t('loading.quote1'),
    t('loading.quote2'),
    t('loading.quote3'),
    t('loading.quote4'),
    t('loading.quote5'),
  ];

  useEffect(() => {
    // Set initial quote
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Progress animation (4 seconds total)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2.5; // 40 intervals * 2.5 = 100% in 4 seconds
      });
    }, 100);

    // Change quote every 3 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(quoteInterval);
    };
  }, [onComplete, quotes]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        {/* Bouncing Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto animate-bounce">
            <span className="text-2xl font-bold text-black">Q</span>
          </div>
        </div>

        {/* Loading Quote */}
        <div className="mb-8 px-8">
          <p className="text-white text-lg max-w-md mx-auto">
            {currentQuote}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white text-sm">{progress}%</p>
        </div>
      </div>
    </div>
  );
}