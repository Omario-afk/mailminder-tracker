
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { MailOpen, Send, Network, Building, User } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    organizations: 0,
    sentMails: 0,
    receivedMails: 0,
    networks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Count organizations the user is part of
        const { count: orgCount, error: orgError } = await supabase
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (orgError) throw orgError;
        
        // Count sent mails by the user
        const { count: sentCount, error: sentError } = await supabase
          .from('mail_entries')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', user.id);
          
        if (sentError) throw sentError;
        
        // Count received mails (simplification - mails in orgs user belongs to)
        const { count: receivedCount, error: receivedError } = await supabase
          .from('mail_entries')
          .select('*', { count: 'exact', head: true })
          .neq('sender_id', user.id)
          .in('org_id', 
            supabase.from('organization_members')
              .select('org_id')
              .eq('user_id', user.id)
          );
          
        if (receivedError) throw receivedError;
        
        // Count network connections
        const { count: networkCount, error: networkError } = await supabase
          .from('network_connections')
          .select('*', { count: 'exact', head: true })
          .or(`org_id_1.in.(${
            supabase.from('organization_members')
              .select('org_id')
              .eq('user_id', user.id)
              .query()}),org_id_2.in.(${
              supabase.from('organization_members')
                .select('org_id')
                .eq('user_id', user.id)
                .query()
            })`);
          
        if (networkError) throw networkError;
        
        setStats({
          organizations: orgCount || 0,
          sentMails: sentCount || 0,
          receivedMails: receivedCount || 0,
          networks: networkCount || 0
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const statCards = [
    {
      title: t('dashboard.organizations', 'Organizations'),
      value: stats.organizations,
      description: t('dashboard.organizationsDesc', 'Organizations you belong to'),
      icon: <Building className="h-6 w-6 text-blue-600" />,
      action: () => navigate("/organizations"),
      actionText: t('dashboard.viewOrganizations', 'View Organizations')
    },
    {
      title: t('dashboard.sentMail', 'Sent Mail'),
      value: stats.sentMails,
      description: t('dashboard.sentMailDesc', 'Documents you have sent'),
      icon: <Send className="h-6 w-6 text-green-600" />,
      action: () => navigate("/mail"),
      actionText: t('dashboard.viewMail', 'View Mail')
    },
    {
      title: t('dashboard.receivedMail', 'Received Mail'),
      value: stats.receivedMails,
      description: t('dashboard.receivedMailDesc', 'Documents addressed to you'),
      icon: <MailOpen className="h-6 w-6 text-amber-600" />,
      action: () => navigate("/mail"),
      actionText: t('dashboard.viewMail', 'View Mail')
    },
    {
      title: t('dashboard.networks', 'Networks'),
      value: stats.networks,
      description: t('dashboard.networksDesc', 'Connected organization networks'),
      icon: <Network className="h-6 w-6 text-purple-600" />,
      action: () => navigate("/network"),
      actionText: t('dashboard.viewNetworks', 'View Networks')
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('dashboard.welcome', 'Welcome')}, {user?.firstName || user?.email}</h1>
        <p className="text-muted-foreground">{t('dashboard.overviewDesc', 'Here\'s an overview of your mail tracking activities')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {loading ? 
                  <div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin"></div> : 
                  card.value}
              </div>
              <CardDescription>{card.description}</CardDescription>
              <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={card.action}
              >
                {card.actionText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.quickActions', 'Quick Actions')}</CardTitle>
          <CardDescription>{t('dashboard.quickActionsDesc', 'Common tasks you might want to perform')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button onClick={() => navigate("/mail/send")}>
            <Send className="mr-2 h-4 w-4" />
            {t('dashboard.sendMail', 'Send New Mail')}
          </Button>
          <Button variant="outline" onClick={() => navigate("/organizations/new")}>
            <Building className="mr-2 h-4 w-4" />
            {t('dashboard.createOrg', 'Create Organization')}
          </Button>
          <Button variant="outline" onClick={() => navigate("/templates/new")}>
            <User className="mr-2 h-4 w-4" />
            {t('dashboard.createTemplate', 'Create Template')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
