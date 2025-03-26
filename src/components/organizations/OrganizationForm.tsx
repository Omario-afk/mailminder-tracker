import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrganization } from '@/context/OrganizationContext';
import { Button } from '@/components/ui/button';
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
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const organizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

interface OrganizationFormProps {
  organizationId?: string;
  initialData?: OrganizationFormValues;
}

const OrganizationForm = ({ organizationId, initialData }: OrganizationFormProps) => {
  const { createOrganization, updateOrganization, loading } = useOrganization();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: OrganizationFormValues) => {
    try {
      if (organizationId) {
        await updateOrganization(organizationId, data);
        toast.success(t('organizations.updateSuccess'));
      } else {
        await createOrganization(data.name, data.description);
        toast.success(t('organizations.createSuccess'));
      }
      navigate('/organizations');
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Organization form error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
        {organizationId ? t('organizations.edit') : t('organizations.create')}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('organizations.name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('organizations.namePlaceholder')} {...field} />
                </FormControl>
                <FormDescription>{t('organizations.nameDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('organizations.description')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('organizations.descriptionPlaceholder')}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t('organizations.descriptionDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/organizations')}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.saving') : (organizationId ? t('common.save') : t('common.create'))}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OrganizationForm; 