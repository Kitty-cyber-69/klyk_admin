import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash, Loader2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { TeamMember } from '@/types';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '@/services/supabaseService';
import { toast } from 'sonner';
import TeamFormDialog from '@/components/team/TeamFormDialog';
import DeleteConfirmDialog from '@/components/partners/DeleteConfirmDialog';

export default function TeamPage() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  
  // Fetch team members from Supabase
  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team'],
    queryFn: getTeamMembers
  });

  // Create team member mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => createTeamMember(data),
    onSuccess: () => {
      toast.success('Team member added successfully');
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (error) => {
      toast.error(`Error adding team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update team member mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<TeamMember> }) => updateTeamMember(id, data),
    onSuccess: () => {
      toast.success('Team member updated successfully');
      setSelectedMember(null);
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (error) => {
      toast.error(`Error updating team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  // Delete team member mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTeamMember(id),
    onSuccess: () => {
      toast.success('Team member deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (error) => {
      toast.error(`Error deleting team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleAddMember = (data: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
    createMutation.mutate(data);
  };

  const handleUpdateMember = (data: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedMember) {
      updateMutation.mutate({ id: selectedMember.id, data });
    }
  };

  const handleDeleteMember = () => {
    if (selectedMember) {
      deleteMutation.mutate(selectedMember.id);
    }
  };

  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member);
  };

  const openDeleteDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Error loading team data</h3>
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Our Team" 
        description="Manage team member profiles displayed on your website."
        actions={
          <Button 
            className="bg-admin-primary hover:bg-blue-600"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-admin-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {team && team.length > 0 ? (
            team.map((member) => (
              <Card key={member.id} className="overflow-hidden">
                <div className="relative">
                  <div className="flex justify-end space-x-2 p-2 absolute top-0 right-0 z-10">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="bg-white/80 hover:bg-white"
                      onClick={() => openEditDialog(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="bg-white/80 hover:bg-white text-red-500 hover:text-red-700"
                      onClick={() => openDeleteDialog(member)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending && selectedMember?.id === member.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="aspect-square overflow-hidden bg-slate-50">
                    {member.image_url ? (
                      <img 
                        src={member.image_url} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                        No Image
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-medium text-lg">{member.name}</h3>
                  <p className="text-sm text-slate-500">{member.designation}</p>
                  {member.bio && (
                    <p className="mt-2 text-sm line-clamp-2">{member.bio}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-8 text-center border rounded-md bg-slate-50">
              <p className="text-slate-500">No team members found. Add your first team member to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Member Dialog */}
      <TeamFormDialog 
        open={isAddDialogOpen || !!selectedMember}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setSelectedMember(null);
          }
        }}
        onSubmit={selectedMember ? handleUpdateMember : handleAddMember}
        member={selectedMember || undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteMember}
        isLoading={deleteMutation.isPending}
        title="Delete Team Member"
        description={`Are you sure you want to delete ${selectedMember?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
