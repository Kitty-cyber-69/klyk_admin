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
import { BlogPost } from '@/types';
import ImageUploadField from '@/components/common/ImageUploadField';
import { supabase } from '@/integrations/supabase/client';

interface BlogFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => void;
  post?: BlogPost;
  isLoading: boolean;
}

export default function BlogFormDialog({
  open,
  onOpenChange,
  onSubmit,
  post,
  isLoading
}: BlogFormDialogProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: post
      ? { title: post.title, content: post.content, image_url: post.image_url }
      : { title: '', content: '', image_url: '' }
  });

  useEffect(() => {
    if (open) {
      reset(post 
        ? { title: post.title, content: post.content, image_url: post.image_url }
        : { title: '', content: '', image_url: '' }
      );
    } else {
      // Reset form when dialog closes
      reset({
        title: '',
        content: '',
        image_url: ''
      });
    }
  }, [open, post, reset]);

  const handleFormSubmit = async (data: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    // If there's a previous image and it's different from the new one, delete the old image
    if (post?.image_url && post.image_url !== data.image_url) {
      try {
        const imagePath = post.image_url.split('/').pop();
        if (imagePath) {
          const { error } = await supabase.storage
            .from('blog_images')
            .remove([`blog/${imagePath}`]);
          
          if (error) {
            console.error('Error deleting old image:', error);
          }
        }
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
    
    onSubmit(data);
  };

  const imageUrl = watch('image_url');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? 'Edit Blog Post' : 'Add Blog Post'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="col-span-4">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
            </div>
            <div className="col-span-4">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" {...register('content')} />
            </div>
            <div className="col-span-4">
              <Label htmlFor="image_url">Image URL</Label>
              <Input id="image_url" {...register('image_url')} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 