import React from "react";
import { Button } from "@/components/ui/button";
import { Tenant } from "./types";
import { icons } from "@/utils/utils";

interface TenantRowActionsProps {
  tenant: Tenant;
  isPaid: boolean;
  onViewDetails: (tenant: Tenant) => void;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  onPrintReceipt: (tenant: Tenant) => void;
  onViewPayments: (tenant: Tenant) => void;
}

export function TenantRowActions({
  tenant,
  isPaid,
  onViewDetails,
  onEdit,
  onDelete,
  onPrintReceipt,
  onViewPayments,
}: TenantRowActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onViewDetails(tenant)}
        title="View Details"
      >
        <icons.eye className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onEdit(tenant)}
        title="Edit Tenant"
      >
        <icons.edit2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-danger"
        onClick={() => onDelete(tenant)}
        title="Delete Tenant"
      >
        <icons.trash2 className="w-4 h-4" />
      </Button>
      {isPaid && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-success"
          onClick={() => onPrintReceipt(tenant)}
          title="Print Receipt"
        >
          <icons.printer className="w-4 h-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-primary"
        onClick={() => onViewPayments(tenant)}
        title="View Payments"
      >
        <icons.creditcard className="w-4 h-4" />
      </Button>
    </div>
  );
}
