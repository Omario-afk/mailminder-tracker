
import React, { useState, useEffect } from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Mail, Search, Filter, Send, Download } from 'lucide-react';

const MailTracking = () => {
  const { templates, createMailItem, mailItems, currentOrganization } = useOrganization();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('sent');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [mailProperties, setMailProperties] = useState<Record<string, string>>({});
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTemplate, setFilterTemplate] = useState('all');

  const handleSendMail = async () => {
    try {
      if (!selectedTemplate) {
        toast.error('Please select a template');
        return;
      }
      
      if (!recipientName || !recipientAddress) {
        toast.error('Please provide recipient information');
        return;
      }
      
      // Add recipient info to properties
      const properties = {
        ...mailProperties,
        recipientName,
        recipientAddress,
        status: 'sent',
      };
      
      await createMailItem(selectedTemplate, properties);
      toast.success('Mail item created successfully');
      
      // Reset form
      setSelectedTemplate('');
      setMailProperties({});
      setRecipientName('');
      setRecipientAddress('');
    } catch (error) {
      toast.error('Failed to create mail item');
      console.error(error);
    }
  };

  const handleReceiveMail = async () => {
    try {
      if (!selectedTemplate) {
        toast.error('Please select a template');
        return;
      }
      
      // Add recipient info to properties
      const properties = {
        ...mailProperties,
        status: 'received',
        recipientName: user?.email || '',
      };
      
      await createMailItem(selectedTemplate, properties);
      toast.success('Received mail item recorded successfully');
      
      // Reset form
      setSelectedTemplate('');
      setMailProperties({});
      setRecipientName('');
      setRecipientAddress('');
    } catch (error) {
      toast.error('Failed to record received mail');
      console.error(error);
    }
  };

  const handlePropertyChange = (propertyName: string, value: string) => {
    setMailProperties(prev => ({
      ...prev,
      [propertyName]: value
    }));
  };

  const filteredMailItems = mailItems
    .filter(item => {
      // Apply search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        item.properties?.subject?.toLowerCase().includes(searchLower) ||
        item.properties?.recipientName?.toLowerCase().includes(searchLower) ||
        item.properties?.recipientAddress?.toLowerCase().includes(searchLower) ||
        false;
      
      // Apply template filter
      const matchesTemplate = filterTemplate === 'all' || item.templateId === filterTemplate;
      
      // Apply tab filter (sent/received)
      const matchesTab = activeTab === 'all' || 
                         (activeTab === 'sent' && item.properties?.status === 'sent') ||
                         (activeTab === 'received' && item.properties?.status === 'received');
      
      return matchesSearch && matchesTemplate && matchesTab;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('mail.title')}</h1>
      
      <Tabs defaultValue="sent" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sent">
            <Send className="mr-2 h-4 w-4" />
            Sent Mail
          </TabsTrigger>
          <TabsTrigger value="received">
            <Download className="mr-2 h-4 w-4" />
            Received Mail
          </TabsTrigger>
          <TabsTrigger value="all">All Mail</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sent" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Send New Mail</CardTitle>
              <CardDescription>Track a new outgoing mail item</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input 
                    id="recipientName" 
                    value={recipientName} 
                    onChange={e => setRecipientName(e.target.value)} 
                    placeholder="Enter recipient name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="recipientAddress">Recipient Address</Label>
                  <Input 
                    id="recipientAddress" 
                    value={recipientAddress} 
                    onChange={e => setRecipientAddress(e.target.value)} 
                    placeholder="Enter recipient address"
                  />
                </div>
                
                <div>
                  <Label>Mail Type</Label>
                  <RadioGroup defaultValue="regular">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regular" id="regular" />
                      <Label htmlFor="regular">Regular Mail</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="certified" id="certified" />
                      <Label htmlFor="certified">Certified Mail</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express">Express Mail</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    value={mailProperties.subject || ''} 
                    onChange={e => handlePropertyChange('subject', e.target.value)} 
                    placeholder="Enter mail subject"
                  />
                </div>
                
                <Button className="w-full" onClick={handleSendMail}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Mail
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="received" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Record Received Mail</CardTitle>
              <CardDescription>Track a new incoming mail item</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input 
                    id="senderName" 
                    value={recipientName} 
                    onChange={e => setRecipientName(e.target.value)} 
                    placeholder="Enter sender name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="senderAddress">Sender Address</Label>
                  <Input 
                    id="senderAddress" 
                    value={recipientAddress} 
                    onChange={e => setRecipientAddress(e.target.value)} 
                    placeholder="Enter sender address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    value={mailProperties.subject || ''} 
                    onChange={e => handlePropertyChange('subject', e.target.value)} 
                    placeholder="Enter mail subject"
                  />
                </div>
                
                <Button className="w-full" onClick={handleReceiveMail}>
                  <Download className="mr-2 h-4 w-4" />
                  Record Received Mail
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="pt-4">
          {/* All mail content will be shown in the listing below */}
        </TabsContent>
      </Tabs>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('mail.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="w-full md:w-64">
          <Select value={filterTemplate} onValueChange={setFilterTemplate}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t('mail.filterByTemplate')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('mail.allTemplates')}</SelectItem>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Mail Items</CardTitle>
          <CardDescription>
            {activeTab === 'sent' ? 'All sent mail' : activeTab === 'received' ? 'All received mail' : 'All mail items'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMailItems.length > 0 ? (
            <div className="space-y-4">
              {filteredMailItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <div className="rounded-full p-2 bg-primary/10 mr-4">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.properties?.subject || 'Untitled'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.properties?.status === 'sent' ? 
                          `To: ${item.properties?.recipientName || 'Unknown'}` : 
                          `From: ${item.properties?.recipientName || 'Unknown'}`
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Template: {templates.find(t => t.id === item.templateId)?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary inline-block mt-1">
                      {item.properties?.status || 'Unknown'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('mail.noItems')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MailTracking;
