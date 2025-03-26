
import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import TabSelector from "@/components/auth/TabSelector";
import { useTranslation } from "react-i18next";

const AuthPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('auth.welcomeToMailMinder')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.accessYourAccount')}
          </CardDescription>
        </CardHeader>
        <TabSelector
          loginTab={<LoginForm />}
          signupTab={<SignupForm />}
        />
      </Card>
    </div>
  );
};

export default AuthPage;
