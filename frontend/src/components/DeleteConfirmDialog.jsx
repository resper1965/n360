/**
 * Delete Confirmation Dialog
 * Modal reutilizável para confirmação de delete
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { AlertTriangle } from 'lucide-react';

export function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title = "Confirmar Exclusão",
  description = "Esta ação não pode ser desfeita. Tem certeza que deseja continuar?",
  itemName = "este item"
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" strokeWidth={1.5} />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {description}
            {itemName && (
              <div className="mt-2 p-2 rounded bg-muted text-foreground font-medium text-sm">
                {itemName}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


