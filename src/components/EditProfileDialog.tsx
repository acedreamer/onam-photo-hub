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
import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Camera } from 'lucide-react';

const profileSchema = z.object({
  full_name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50, { message: 'Name cannot exceed 50 characters.' }),
  bio: z.string().max(160, { message: 'Bio cannot exceed 160 characters.' }).optional(),
});

interface EditProfileDialogProps {
  profile: Profile;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onProfileUpdate: () => void;
}

const EditProfileDialog = ({ profile, isOpen, onOpenChange, onProfileUpdate }: EditProfileDialogProps) => {
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      bio: profile.bio || '',
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    setIsSubmitting(true);

    let newAvatarUrl = profile.avatar_url;

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);

        const { data: uploadData, error: functionError } = await supabase.functions.invoke(
          'cloudinary-upload',
          { body: formData }
        );

        if (functionError) throw functionError;
        if (!uploadData.secure_url) {
          throw new Error("Cloudinary upload did not return a valid URL.");
        }
        newAvatarUrl = uploadData.secure_url;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          bio: values.bio,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate();
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
            <div className="flex justify-center pt-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-bright-gold">
                  <AvatarImage src={avatarPreview || undefined} alt={profile.full_name || ''} />
                  <AvatarFallback>{profile.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleAvatarChange}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload new profile picture"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>
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