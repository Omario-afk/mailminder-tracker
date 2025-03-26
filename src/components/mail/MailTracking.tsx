import React, { useState } from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Mail, Trash2, Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const mailSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  properties: z.record(z.string()),
});

type MailFormValues = z.infer<typeof mailSchema>;

const MailTracking = () => {
  const { templates, mailItems, createMailItem, deleteMailItem, loading } = useOrganization();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const { t } = useTranslation();

  const form = useForm<MailFormValues>({
    resolver: zodResolver(mailSchema),
    defaultValues: {
      templateId: '',
      properties: {},
    },
  });

  const onSubmit = async (data: MailFormValues) => {
    try {
      await createMailItem(data.templateId, data.properties);
      toast.success(t('mail.createSuccess'));
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Create mail item error:', error);
    }
  };

  const handleDeleteMailItem = async (mailId: string) => {
    try {
      await deleteMailItem(mailId);
      toast.success(t('mail.deleteSuccess'));
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Delete mail item error:', error);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      const defaultProperties = template.properties.reduce((acc, prop) => {
        acc[prop.id] = '';
        return acc;
      }, {} as Record<string, string>);
      form.setValue('properties', defaultProperties);
    }
  };

  const filteredMailItems = mailItems.filter((item) => {
    const matchesSearch = item.properties.some((prop) =>
      prop.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesTemplate = !selectedTemplate || item.templateId === selectedTemplate;
    return matchesSearch && matchesTemplate;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('mail.title')}</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('mail.addItem')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('mail.addItem')}</DialogTitle>
              <DialogDescription>
                {t('mail.addItemDescription')}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('mail.template')}</FormLabel>
                      <Select onValueChange={handleTemplateChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('mail.templatePlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>{t('mail.templateDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedTemplate && (
                  <div className="space-y-4">
                    {templates
                      .find((t) => t.id === selectedTemplate)
                      ?.properties.map((property) => (
                        <FormField
                          key={property.id}
                          control={form.control}
                          name={`properties.${property.id}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{property.name}</FormLabel>
                              <FormControl>
                                {property.type === 'text' && (
                                  <Input {...field} />
                                )}
                                {property.type === 'textarea' && (
                                  <Textarea {...field} />
                                )}
                                {property.type === 'select' && (
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={t('mail.selectValue')} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {property.options?.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </FormControl>
                              <FormDescription>{property.description}</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {t('common.add')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('mail.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('mail.filterByTemplate')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('mail.allTemplates')}</SelectItem>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMailItems.map((item) => (
          <Card key={item.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  {templates.find((t) => t.id === item.templateId)?.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteMailItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {new Date(item.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {item.properties.map((prop) => {
                  const property = templates
                    .find((t) => t.id === item.templateId)
                    ?.properties.find((p) => p.id === prop.id);
                  return (
                    <div key={prop.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{property?.name}</span>
                      <span>{prop.value}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMailItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('mail.noItems')}</p>
        </div>
      )}
    </div>
  );
};

export default MailTracking; 