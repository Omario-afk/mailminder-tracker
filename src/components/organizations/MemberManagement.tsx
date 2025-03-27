
import React, { useState } from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, UserPlus, Trash2, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member']),
});

type InviteMemberValues = z.infer<typeof inviteMemberSchema>;

const MemberManagement = () => {
  const { members, inviteMember, updateMemberRole, removeMember, loading } = useOrganization();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { t } = useTranslation();

  const form = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const onSubmit = async (data: InviteMemberValues) => {
    try {
      await inviteMember(data.email, data.role);
      toast.success(t('organizations.memberInvited'));
      setIsInviteDialogOpen(false);
      form.reset();
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Invite member error:', error);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      await updateMemberRole(memberId, newRole);
      toast.success(t('organizations.roleUpdated'));
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Update role error:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(memberId);
      toast.success(t('organizations.memberRemoved'));
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Remove member error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('organizations.members')}</h2>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              {t('organizations.inviteMember')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('organizations.inviteMember')}</DialogTitle>
              <DialogDescription>
                {t('organizations.inviteMemberDescription')}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.email')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('organizations.role')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('organizations.selectRole')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">{t('organizations.roleAdmin')}</SelectItem>
                          <SelectItem value="member">{t('organizations.roleMember')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {t('common.invite')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('organizations.memberName')}</TableHead>
              <TableHead>{t('organizations.role')}</TableHead>
              <TableHead>{t('organizations.joinedAt')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {member.userId} {/* Using userId instead of userName which doesn't exist */}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(member.id, value as 'admin' | 'member')}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t('organizations.roleAdmin')}</SelectItem>
                      <SelectItem value="member">{t('organizations.roleMember')}</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {member.joinedAt.toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MemberManagement;
