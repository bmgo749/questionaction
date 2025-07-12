import { SecureLink } from '@/components/SecureRouter';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-50 dark:bg-black border-t border-black dark:border-gray-800 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <SecureLink href="/">
              <div className="flex items-center mb-4 cursor-pointer">
                <div className="w-6 h-6 mr-2 rounded-full bg-white dark:bg-transparent p-1 dark:p-0 border border-black dark:border-none">
                  <img 
                    src="/attached_assets/Tak berjudul383_20250704194138_1751629685716.png" 
                    alt="Queit logo" 
                    className="w-full h-full object-contain filter invert dark:invert-0"
                  />
                </div>
                <span className="text-lg font-bold">Queit</span>
              </div>
            </SecureLink>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('footer.description')}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <SecureLink href="/help-center">
                  <span className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                    {t('footer.help')}
                  </span>
                </SecureLink>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  {t('footer.contribute')}
                </a>
              </li>
              <li>
                <a href="/api/docs" target="_blank" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  {t('footer.api')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <SecureLink href="/privacy-policy">
                  <span className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                    {t('footer.privacy')}
                  </span>
                </SecureLink>
              </li>
              <li>
                <SecureLink href="/terms-of-service">
                  <span className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                    {t('footer.terms')}
                  </span>
                </SecureLink>
              </li>
              <li>
                <SecureLink href="/cookie-policy">
                  <span className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                    {t('footer.cookies')}
                  </span>
                </SecureLink>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-black dark:border-gray-600 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                📘
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span className="sr-only">GitHub</span>
                🐙
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
