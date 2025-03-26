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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Network, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const connectionSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
});

type ConnectionFormValues = z.infer<typeof connectionSchema>;

const NetworkConnections = () => {
  const { connections, createConnection, deleteConnection, loading } = useOrganization();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { t } = useTranslation();

  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      organizationId: '',
    },
  });

  const onSubmit = async (data: ConnectionFormValues) => {
    try {
      await createConnection(data.organizationId);
      toast.success(t('network.connectionCreateSuccess'));
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Create connection error:', error);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    try {
      await deleteConnection(connectionId);
      toast.success(t('network.connectionDeleteSuccess'));
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Delete connection error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('network.title')}</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('network.addConnection')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('network.addConnection')}</DialogTitle>
              <DialogDescription>
                {t('network.addConnectionDescription')}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('network.organizationId')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('network.organizationIdPlaceholder')} {...field} />
                      </FormControl>
                      <FormDescription>{t('network.organizationIdDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((connection) => (
          <Card key={connection.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  {connection.organizationName}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {connection.status === 'active' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteConnection(connection.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {connection.description || t('network.noDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('network.status')}</span>
                  <span className={connection.status === 'active' ? 'text-green-500' : 'text-red-500'}>
                    {t(`network.status.${connection.status}`)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('network.connectedAt')}</span>
                  <span>{new Date(connection.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {connections.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('network.noConnections')}</p>
        </div>
      )}
    </div>
  );
};

export default NetworkConnections; 