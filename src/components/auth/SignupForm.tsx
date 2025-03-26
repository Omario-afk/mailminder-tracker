
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signup(email, password, firstName, lastName);
      toast({
        title: t('auth.signupSuccess'),
        description: t('auth.welcomeToMailMinder'),
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: t('auth.signupFailed'),
        description: t('auth.signupErrorMessage'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-panel animate-scale-in">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('auth.firstName')}</Label>
              <Input
                id="firstName"
                placeholder={t('auth.firstNamePlaceholder')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="bg-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('auth.lastName')}</Label>
              <Input
                id="lastName"
                placeholder={t('auth.lastNamePlaceholder')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="bg-white/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/50"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('auth.signingUp') : t('auth.signUp')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignupForm;
