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
import { Loader2 } from 'lucide-react';
import { Partner } from '@/types';
import ImageUploadField from '@/components/common/ImageUploadField';
import { toast } from 'sonner';

interface PartnerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => void;
  partner?: Partner;
  isLoading: boolean;
}

export default function PartnerFormDialog({
  open,
  onOpenChange,
  onSubmit,
  partner,
  isLoading
}: PartnerFormDialogProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<Omit<Partner, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: partner
      ? { name: partner.name, website: partner.website, logo_url: partner.logo_url }
      : { name: '', website: '', logo_url: '' }
  });

  // Reset form when partner prop changes or dialog opens
  useEffect(() => {
    if (open) {
      reset(partner 
        ? { name: partner.name, website: partner.website, logo_url: partner.logo_url }
        : { name: '', website: '', logo_url: '' }
      );
    }
  }, [open, partner, reset]);

  const handleFormSubmit = (data: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => {
    onSubmit(data);
  };

  const logoUrl = watch('logo_url');

  const handleLogoChange = (url: string) => {
    setValue('logo_url', url, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{partner ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Partner Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Partner name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                {...register('website', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL starting with http:// or https://'
                  }
                })}
              />
              {errors.website && (
                <p className="text-sm text-red-500">{errors.website.message}</p>
              )}
            </div>
            <ImageUploadField
              id="partner-logo"
              label="Partner Logo"
              value={logoUrl}
              onChange={handleLogoChange}
              folderPath="partners"
              bucketName="partner_logos"
              accept="image/png,image/jpeg,image/webp"
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
                'Save Partner'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
