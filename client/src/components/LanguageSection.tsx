import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/data/translations';

export function LanguageSection() {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'id' as Language, name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'en' as Language, name: 'English (US)', flag: '🇺🇸' },
    { code: 'my' as Language, name: 'Bahasa Melayu', flag: '🇲🇾' },
  ];

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 mb-8 text-gray-900 dark:text-white border border-black dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6">{t('settings.language')}</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Choose your preferred language for the interface
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`p-4 rounded-lg border-2 transition-all ${
              language === lang.code
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-black dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{lang.flag}</span>
              <div className="text-left">
                <div className="font-medium">{lang.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {lang.code.toUpperCase()}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}