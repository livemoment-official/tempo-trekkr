import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Settings, Trash2, Share2 } from 'lucide-react';
import { ShareModal } from '@/components/shared/ShareModal';
import { useToast } from '@/hooks/use-toast';
import { useGroups } from '@/hooks/useGroups';

interface GroupManagementModalProps {
  groupId: string;
  groupTitle: string;
  isHost: boolean;
  children?: React.ReactNode;
  groupCategory?: string;
}

export function GroupManagementModal({
  groupId,
  groupTitle,
  isHost,
  children,
  groupCategory,
}: GroupManagementModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { deleteGroup } = useGroups();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteGroup = async () => {
    setIsDeleting(true);
    
    try {
      const success = await deleteGroup(groupId);
      
      if (success) {
        toast({
          title: 'Gruppo eliminato',
          description: 'Il gruppo è stato eliminato con successo.',
        });
        setShowDeleteDialog(false);
        
        // FASE 1: Navigate to /gruppi after successful deletion
        setTimeout(() => {
          navigate('/gruppi');
        }, 500);
      } else {
        toast({
          title: 'Errore',
          description: 'Non è stato possibile eliminare il gruppo.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'eliminazione.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Gestisci
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gestisci Gruppo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium">{groupTitle}</h4>
              <p className="text-sm text-muted-foreground">
                {isHost ? 'Sei l\'amministratore' : 'Partecipante'}
              </p>
            </div>

            <div className="space-y-2">
              <ShareModal
                contentType="group"
                contentId={groupId}
                title={groupTitle}
              >
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Condividi gruppo
                </Button>
              </ShareModal>

              {isHost && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {groupCategory === 'moment_chat' ? 'Elimina momento' : 'Elimina gruppo'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {groupCategory === 'moment_chat' ? 'Eliminare il momento?' : 'Eliminare il gruppo?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. {groupCategory === 'moment_chat' ? 'Il momento' : 'Il gruppo'} "{groupTitle}" e tutti i suoi messaggi verranno eliminati permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminazione...' : 'Elimina'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}