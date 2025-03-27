
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Mail, Users, Network, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const mockData = [
  { name: 'Jan', received: 4, sent: 2 },
  { name: 'Feb', received: 3, sent: 1 },
  { name: 'Mar', received: 5, sent: 4 },
  { name: 'Apr', received: 2, sent: 3 },
  { name: 'May', received: 6, sent: 2 },
  { name: 'Jun', received: 8, sent: 5 },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { organizations, templates, mailItems, connections } = useOrganization();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard.welcome', { name: user?.email?.split('@')[0] || '' })}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full p-3 bg-primary/10 mb-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{mailItems.length}</h3>
            <p className="text-muted-foreground">Mail Items</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full p-3 bg-primary/10 mb-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{templates.length}</h3>
            <p className="text-muted-foreground">Templates</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full p-3 bg-primary/10 mb-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{organizations.length}</h3>
            <p className="text-muted-foreground">Organizations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="rounded-full p-3 bg-primary/10 mb-3">
              <Network className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{connections.length}</h3>
            <p className="text-muted-foreground">Connections</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mail Activity</CardTitle>
            <CardDescription>Mail sent and received over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="received" name="Received" fill="#3b82f6" />
                  <Bar dataKey="sent" name="Sent" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Commonly used tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/mail')}
            >
              <Mail className="mr-2 h-4 w-4" />
              Track New Mail
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/templates/new')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Create Template
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/organizations/new')}
            >
              <Users className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/network')}
            >
              <Network className="mr-2 h-4 w-4" />
              Manage Network
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Mail Items</CardTitle>
              <CardDescription>Latest mail items tracked in the system</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/mail')}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </CardHeader>
          <CardContent>
            {mailItems.length > 0 ? (
              <div className="space-y-4">
                {mailItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h4 className="font-medium">{item.properties?.subject || 'Untitled'}</h4>
                      <p className="text-sm text-muted-foreground">
                        Template: {templates.find(t => t.id === item.templateId)?.name || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No mail items yet. Create your first one!</p>
                <Button className="mt-4" onClick={() => navigate('/mail')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Mail Item
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
