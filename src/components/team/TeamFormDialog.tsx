import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { TeamMember } from '@/types';
import ImageUploadField from '@/components/common/ImageUploadField';

interface TeamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => void;
  member?: TeamMember;
  isLoading: boolean;
}

export default function TeamFormDialog({
  open,
  onOpenChange,
  onSubmit,
  member,
  isLoading
}: TeamFormDialogProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: member
      ? { name: member.name, designation: member.designation, bio: member.bio, image_url: member.image_url }
      : { name: '', designation: '', bio: '', image_url: '' }
  });

  // Reset form when member prop changes or dialog opens
  useEffect(() => {
    if (open) {
      reset(member 
        ? { name: member.name, designation: member.designation, bio: member.bio, image_url: member.image_url }
        : { name: '', designation: '', bio: '', image_url: '' }
      );
    }
  }, [open, member, reset]);

  const handleFormSubmit = (data: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
    onSubmit(data);
  };

  const imageUrl = watch('image_url');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{member ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                {...register('designation', { required: 'Designation is required' })}
              />
              {errors.designation && (
                <p className="text-sm text-red-500">{errors.designation.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={3}
                {...register('bio')}
              />
            </div>
            
            <ImageUploadField
              id="team-image"
              label="Profile Image"
              value={imageUrl}
              onChange={(url) => setValue('image_url', url)}
              folderPath="team"
              bucketName="team_images"
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Member'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
