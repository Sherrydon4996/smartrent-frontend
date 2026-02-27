import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tenant } from "./types";
import { icons } from "@/utils/utils";

interface TenantDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  onConfirm: () => Promise<void>;
}

export function TenantDeleteDialog({
  isOpen,
  onOpenChange,
  tenant,
  onConfirm,
}: TenantDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!tenant) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Tenant</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg">
            <p className="text-sm text-danger-foreground">
              <strong>Warning:</strong> This action cannot be undone. All data
              associated with this tenant will be permanently deleted.
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-semibold text-foreground">{tenant.name}</p>
            <p className="text-sm text-muted-foreground">
              {tenant.houseNumber} - {tenant.mobile}
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <icons.Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Tenant"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
