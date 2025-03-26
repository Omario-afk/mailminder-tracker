
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

interface TabSelectorProps {
  loginTab: React.ReactNode;
  signupTab: React.ReactNode;
}

const TabSelector = ({ loginTab, signupTab }: TabSelectorProps) => {
  const { t } = useTranslation();
  
  return (
    <Tabs defaultValue="login" className="w-full max-w-md mx-auto">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="login">{t('auth.signIn')}</TabsTrigger>
        <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
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
