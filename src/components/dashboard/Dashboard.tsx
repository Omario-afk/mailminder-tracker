import React from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Mail, Users, FileText, Network } from 'lucide-react';

const Dashboard = () => {
  const { templates, mailItems, members, connections } = useOrganization();
  const { t } = useTranslation();

  // Calculate statistics
  const stats = [
    {
      title: t('dashboard.totalMailItems'),
      value: mailItems.length,
      icon: Mail,
      description: t('dashboard.totalMailItemsDesc'),
    },
    {
      title: t('dashboard.totalTemplates'),
      value: templates.length,
      icon: FileText,
      description: t('dashboard.totalTemplatesDesc'),
    },
    {
      title: t('dashboard.totalMembers'),
      value: members.length,
      icon: Users,
      description: t('dashboard.totalMembersDesc'),
    },
    {
      title: t('dashboard.totalConnections'),
      value: connections.length,
      icon: Network,
      description: t('dashboard.totalConnectionsDesc'),
    },
  ];

  // Prepare data for the chart (mail items by template)
  const chartData = templates.map(template => ({
    name: template.name,
    count: mailItems.filter(item => item.templateId === template.id).length,
  }));

  // Get recent mail items
  const recentMailItems = [...mailItems]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.description')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.mailItemsByTemplate')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMailItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {templates.find((t) => t.id === item.templateId)?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.properties.length} {t('dashboard.properties')}
                </div>
              </div>
            ))}
            {recentMailItems.length === 0 && (
              <p className="text-center text-muted-foreground">
                {t('dashboard.noRecentActivity')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 