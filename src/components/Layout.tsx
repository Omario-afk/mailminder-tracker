
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";

const Layout = () => {
  const { loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/20"></div>
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="text-sm text-muted-foreground mt-2">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-4 pb-8">
        <Outlet />
      </main>
      <Toaster />
      <Sonner />
    </div>
  );
};

export default Layout;
