import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useOrganization } from '@/context/OrganizationContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Network,
  Mail,
  Settings,
  LogOut,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { signOut } = useAuth();
  const { t } = useTranslation();

  const navigation = [
    {
      name: t('navigation.dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: t('navigation.organizations'),
      href: '/organizations',
      icon: Building2,
    },
    {
      name: t('navigation.templates'),
      href: '/templates',
      icon: FileText,
    },
    {
      name: t('navigation.network'),
      href: '/network',
      icon: Network,
    },
    {
      name: t('navigation.mail'),
      href: '/mail',
      icon: Mail,
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success(t('auth.logoutSuccess'));
      navigate('/login');
    } catch (error) {
      toast.error(t('auth.logoutError'));
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-card border-r">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold">MailMinder</h1>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground group-hover:text-accent-foreground'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-border p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {currentOrganization?.name?.[0] || 'O'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-foreground">
                    {currentOrganization?.name || t('navigation.noOrganization')}
                  </p>
                  <Link
                    to="/settings"
                    className="text-xs font-medium text-muted-foreground hover:text-accent-foreground"
                  >
                    {t('navigation.settings')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top bar */}
          <div className="flex-shrink-0 flex h-16 bg-card border-b">
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex">
                <div className="flex-shrink-0 flex items-center">
                  <h2 className="text-lg font-semibold">
                    {navigation.find((item) =>
                      location.pathname.startsWith(item.href)
                    )?.name || t('navigation.dashboard')}
                  </h2>
                </div>
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                <LanguageSwitcher />
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-4"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout; 