
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { availableLanguages, LanguageCode } from '@/i18n';
import { useAuth } from '@/context/AuthContext';

const LanguageSelector = () => {
  // Use try-catch to handle potential i18n initialization issues
  let translationHook;
  try {
    translationHook = useTranslation();
  } catch (error) {
    console.error("Translation hook error:", error);
    // Provide fallback translation function
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Globe className="h-4 w-4" />
        <span className="sr-only">Select language</span>
      </Button>
    );
  }
  
  const { t, i18n } = translationHook;
  const { user, updateUserLanguage } = useAuth();
  
  const changeLanguage = async (code: LanguageCode) => {
    try {
      await i18n.changeLanguage(code);
      
      // If user is logged in, update their language preference
      if (user) {
        updateUserLanguage(code);
      }
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };
  
  const currentLanguage = availableLanguages.find(
    lang => lang.code === i18n.language
  ) || availableLanguages[0];
  
  // Add RTL direction for Arabic
  React.useEffect(() => {
    if (!i18n.language) return;
    
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    
    // Add specific class for RTL styling if needed
    if (i18n.language === 'ar') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [i18n.language]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t('language.select', 'Select language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={i18n.language === language.code ? "bg-primary/10" : ""}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
