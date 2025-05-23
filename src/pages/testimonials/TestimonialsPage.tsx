
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Pencil, Trash, Loader2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Statistics, Testimonial } from '@/types';
import { 
  getTestimonials, 
  createTestimonial, 
  updateTestimonial, 
  deleteTestimonial,
  getStatistics,
  updateStatistics
} from '@/services/supabaseService';
import { toast } from 'sonner';
import TestimonialFormDialog from '@/components/testimonials/TestimonialFormDialog';
import DeleteConfirmDialog from '@/components/partners/DeleteConfirmDialog';
import StatisticsForm from '@/components/testimonials/StatisticsForm';

// Star rating component
interface StarProps {
  filled: boolean;
}

function Star({ filled }: StarProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill={filled ? "#FFD700" : "none"} 
      stroke={filled ? "#FFD700" : "#D1D5DB"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function TestimonialsPage() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

  // Fetch testimonials from Supabase
  const { 
    data: testimonials = [], 
    isLoading: isLoadingTestimonials
  } = useQuery({
    queryKey: ['testimonials'],
    queryFn: getTestimonials
  });

  // Fetch statistics from Supabase
  const { 
    data: stats, 
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ['statistics'],
    queryFn: getStatistics
  });

  // Create testimonial mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => createTestimonial(data),
    onSuccess: () => {
      toast.success('Testimonial added successfully');
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: (error) => {
      toast.error(`Error adding testimonial: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update testimonial mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Testimonial> }) => updateTestimonial(id, data),
    onSuccess: () => {
      toast.success('Testimonial updated successfully');
      setSelectedTestimonial(null);
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: (error) => {
      toast.error(`Error updating testimonial: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Delete testimonial mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTestimonial(id),
    onSuccess: () => {
      toast.success('Testimonial deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedTestimonial(null);
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: (error) => {
      toast.error(`Error deleting testimonial: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update statistics mutation
  const updateStatsMutation = useMutation({
    mutationFn: (data: Statistics) => updateStatistics(data),
    onSuccess: () => {
      toast.success('Statistics updated successfully');
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
    onError: (error) => {
      toast.error(`Error updating statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleAddTestimonial = (data: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => {
    createMutation.mutate(data);
  };

  const handleUpdateTestimonial = (data: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedTestimonial) {
      updateMutation.mutate({ id: selectedTestimonial.id, data });
    }
  };

  const handleDeleteTestimonial = () => {
    if (selectedTestimonial) {
      deleteMutation.mutate(selectedTestimonial.id);
    }
  };

  const handleUpdateStats = (data: Statistics) => {
    if (stats) {
      updateStatsMutation.mutate({ ...data, id: stats.id });
    }
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
  };

  const openDeleteDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      <PageHeader 
        title="Testimonials & Statistics" 
        description="Manage testimonials and key statistics displayed on your website."
      />

      <Tabs defaultValue="stats" className="mb-6">
        <TabsList>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="pt-4">
          {isLoadingStats ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-admin-primary animate-spin" />
            </div>
          ) : statsError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-lg font-medium text-red-800">Error loading statistics</h3>
              <p className="text-sm text-red-600">
                {statsError instanceof Error ? statsError.message : 'An unknown error occurred'}
              </p>
            </div>
          ) : stats ? (
            <StatisticsForm 
              statistics={stats}
              onSave={handleUpdateStats}
              isLoading={updateStatsMutation.isPending}
            />
          ) : null}
        </TabsContent>
        
        <TabsContent value="testimonials" className="pt-4">
          <div className="flex justify-end mb-4">
            <Button 
              className="bg-admin-primary hover:bg-blue-600"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Testimonial
            </Button>
          </div>
          
          {isLoadingTestimonials ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-admin-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {testimonials.length > 0 ? testimonials.map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {testimonial.image_url ? (
                        <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                          <img 
                            src={testimonial.image_url} 
                            alt={testimonial.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{testimonial.name}</h3>
                        {testimonial.company && (
                          <p className="text-sm text-slate-500">{testimonial.company}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            filled={i < (testimonial.rating || 0)}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-slate-600">"{testimonial.content}"</p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditDialog(testimonial)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => openDeleteDialog(testimonial)}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              )) : (
                <div className="col-span-full p-8 text-center border rounded-md bg-slate-50">
                  <p className="text-slate-500">No testimonials found. Add your first testimonial to get started.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Testimonial Dialog */}
      <TestimonialFormDialog 
        open={isAddDialogOpen || !!selectedTestimonial}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setSelectedTestimonial(null);
          }
        }}
        onSubmit={selectedTestimonial ? handleUpdateTestimonial : handleAddTestimonial}
        testimonial={selectedTestimonial || undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteTestimonial}
        isLoading={deleteMutation.isPending}
        title="Delete Testimonial"
        description={`Are you sure you want to delete ${selectedTestimonial?.name}'s testimonial? This action cannot be undone.`}
      />
    </div>
  );
}
