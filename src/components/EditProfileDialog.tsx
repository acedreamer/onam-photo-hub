import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { showSuccess, showError } from '@/utils/toast';
import type { Profile } from '@/stores/galleryStore';
import { useState } from 'react';

const profileSchema = z.object({
  full_name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50, { message: 'Name cannot exceed 50 characters.' }),
  bio: z.string().max(160, { message: 'Bio cannot exceed 160 characters.' }).optional(),
});

interface EditProfileDialogProps {
  profile: Profile;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

const EditProfileDialog = ({ profile, isOpen, onOpenChange, onProfileUpdate }: EditProfileDialogProps) => {
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      bio: profile.bio || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          bio: values.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(data);
      showSuccess('Profile updated successfully!');
      onOpenChange(false);
    } catch (error: any) {
      showError(error.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;