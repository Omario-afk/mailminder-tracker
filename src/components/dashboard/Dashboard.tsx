
import React from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, FileText, Mail, Users } from 'lucide-react';

const Dashboard = () => {
  const { currentOrganization, templates, mailItems, members, loading } = useOrganization();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    { title: 'Templates', value: templates?.length || 0, icon: <FileText className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Mail Items', value: mailItems?.length || 0, icon: <Mail className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Team Members', value: members?.length || 0, icon: <Users className="h-5 w-5 text-muted-foreground" /> },
    { title: 'Activity', value: '24h', icon: <Activity className="h-5 w-5 text-muted-foreground" /> }
  ];

  return (
    <div className="container px-4 py-6 mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">
        {currentOrganization ? `${currentOrganization.name} Dashboard` : 'Dashboard'}
      </h1>
      <p className="text-muted-foreground mt-2">
        Welcome to your Mail Tracker dashboard.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your mail tracking activity from the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                  <p className="ml-4 text-muted-foreground">Activity data will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Detailed performance analytics for your mail items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Analytics will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>
                  Generated reports and summaries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Reports will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
