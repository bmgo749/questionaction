import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/data/translations';

const languageFlags = {
  en: '🇺🇸',
  id: '🇮🇩',
  my: '🇲🇾',
};

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <span>{language.toUpperCase()}</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
          <span className="mr-2">{languageFlags.en}</span>
          {t('languages.en')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('id')}>
          <span className="mr-2">{languageFlags.id}</span>
          {t('languages.id')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('my')}>
          <span className="mr-2">{languageFlags.my}</span>
          {t('languages.my')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
