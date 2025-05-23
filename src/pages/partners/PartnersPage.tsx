import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Link, Pencil, Trash, Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Partner } from '@/types';
import { getPartners, createPartner, updatePartner, deletePartner } from '@/services/supabaseService';
import PartnerFormDialog from '@/components/partners/PartnerFormDialog';
import DeleteConfirmDialog from '@/components/partners/DeleteConfirmDialog';

export default function PartnersPage() {
  const queryClient = useQueryClient();
  
  // State for managing dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);
  
  // Fetch partners data from Supabase
  const { data: partners, isLoading, error } = useQuery({
    queryKey: ['partners'],
    queryFn: getPartners
  });
  
  // Create partner mutation
  const createMutation = useMutation({
    mutationFn: (partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => createPartner(partner),
    onSuccess: () => {
      toast.success('Partner added successfully');
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error adding partner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  // Update partner mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, partner }: { id: string; partner: Partial<Partner> }) => 
      updatePartner(id, partner),
    onSuccess: () => {
      toast.success('Partner updated successfully');
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setIsEditDialogOpen(false);
      setCurrentPartner(null);
    },
    onError: (error) => {
      toast.error(`Error updating partner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  // Delete partner mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePartner(id),
    onSuccess: () => {
      toast.success('Partner deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setIsDeleteDialogOpen(false);
      setCurrentPartner(null);
    },
    onError: (error) => {
      toast.error(`Error deleting partner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Handle dialog actions
  const handleOpenEditDialog = (partner: Partner) => {
    setCurrentPartner(partner);
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (partner: Partner) => {
    setCurrentPartner(partner);
    setIsDeleteDialogOpen(true);
  };

  const handleAddPartner = (data: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => {
    createMutation.mutate(data);
  };

  const handleUpdatePartner = (data: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => {
    if (!currentPartner) return;
    updateMutation.mutate({ id: currentPartner.id, partner: data });
  };

  const handleDeletePartner = () => {
    if (!currentPartner) return;
    deleteMutation.mutate(currentPartner.id);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Error loading partners data</h3>
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Industry Partners" 
        description="Manage corporate partnerships and industry affiliations."
        actions={
          <Button 
            className="bg-admin-primary hover:bg-blue-600"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Partner
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-admin-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners && partners.length > 0 ? (
            partners.map((partner) => (
              <Card key={partner.id}>
                <div className="relative">
                  <div className="flex justify-end space-x-2 p-2 absolute top-0 right-0 z-10">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="bg-white/80 hover:bg-white"
                      onClick={() => handleOpenEditDialog(partner)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="bg-white/80 hover:bg-white text-red-500 hover:text-red-700"
                      onClick={() => handleOpenDeleteDialog(partner)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending && currentPartner?.id === partner.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                <div className="h-32 flex items-center justify-center p-4 border-b">
                  {partner.logo_url ? (
                    <img 
                      src={partner.logo_url} 
                      alt={partner.name} 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      No Logo
                    </div>
                  )}
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-medium">{partner.name}</h3>
                  {partner.website && (
                    <div className="mt-1 flex items-center text-xs text-blue-500">
                      <Link className="h-3 w-3 mr-1" />
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="truncate"
                      >
                        {partner.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-8 text-center border rounded-md bg-slate-50">
              <p className="text-slate-500">No partners found. Add your first partner to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Partner Dialog */}
      <PartnerFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddPartner}
        isLoading={createMutation.isPending}
      />

      {/* Edit Partner Dialog */}
      <PartnerFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        partner={currentPartner || undefined}
        onSubmit={handleUpdatePartner}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeletePartner}
        isLoading={deleteMutation.isPending}
        title="Delete Partner"
        description={`Are you sure you want to delete ${currentPartner?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
