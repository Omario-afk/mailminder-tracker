
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

interface TabSelectorProps {
  loginTab: React.ReactNode;
  signupTab: React.ReactNode;
}

const TabSelector = ({ loginTab, signupTab }: TabSelectorProps) => {
  // Use try-catch to handle potential i18n initialization issues
  let translationHook;
  try {
    translationHook = useTranslation();
  } catch (error) {
    console.error("Translation hook error in TabSelector:", error);
    // Provide fallback text
    return (
      <Tabs defaultValue="login" className="w-full max-w-md mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          {loginTab}
        </TabsContent>
        <TabsContent value="signup">
          {signupTab}
        </TabsContent>
      </Tabs>
    );
  }
  
  const { t } = translationHook;
  
  return (
    <Tabs defaultValue="login" className="w-full max-w-md mx-auto">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="login">{t('auth.signIn', 'Sign In')}</TabsTrigger>
        <TabsTrigger value="signup">{t('auth.signUp', 'Sign Up')}</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        {loginTab}
      </TabsContent>
      <TabsContent value="signup">
        {signupTab}
      </TabsContent>
    </Tabs>
  );
};

export default TabSelector;
