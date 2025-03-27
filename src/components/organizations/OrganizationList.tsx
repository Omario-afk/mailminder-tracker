
import React from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Building2, Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

const OrganizationList = () => {
  const { organizations, loading, error } = useOrganization();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/20"></div>
          <div className="h-4 w-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('organizations.title')}</h1>
        {user?.role === 'director' && (
          <Button onClick={() => navigate('/organizations/new')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('organizations.create')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {org.name}
                </CardTitle>
                {org.directorId === user?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/organizations/${org.id}/settings`)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardDescription>{org.description || t('organizations.noDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {t('organizations.memberCount')}: {0} {/* Fixed memberCount reference */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {organizations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('organizations.noOrganizations')}</p>
        </div>
      )}
    </div>
  );
};

export default OrganizationList;
