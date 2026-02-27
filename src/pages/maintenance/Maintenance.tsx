import React, { useState } from "react";
import {
  Plus,
  Wrench,
  Clock,
  CheckCircle,
  Building2,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrentDate } from "@/components/CurrentDate";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ErrorState } from "@/errors/dataError";
import { getIconEmoji } from "../buildingPage/utils";
import { useToast } from "@/hooks/use-toast";

// React Query hooks
import { useBuildingsList } from "@/hooks/useBuildingAps";
import {
  useMaintenanceRequests,
  useCreateMaintenanceRequest,
  useUpdateMaintenanceStatus,
  useUpdateMaintenanceRequest,
  useDeleteMaintenanceRequest,
} from "@/hooks/useMaintenanceApi";

interface Unit {
  id: string;
  unit_number: string;
  tenant_name: string | null;
  tenant_id: string | null;
  is_occupied: boolean;
}

interface MaintenanceRequest {
  id: string;
  issue_title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assigned_to?: string;
  created_at: string;
  completed_at?: string;
  building_icon?: string;
  building_name: string;
  unit_number: string;
  tenant_name?: string;
}

export function Maintenance() {
  // ── Local State ──────────────────────────────────────────────────────────
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] =
    useState<MaintenanceRequest | null>(null);
  const [buildingFilter, setBuildingFilter] = useState<string>("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    buildingId: "",
    unitId: "",
    issueTitle: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    assignedTo: "",
  });

  // ── React Query ──────────────────────────────────────────────────────────
  const {
    data: buildings = [],
    isLoading: buildingsLoading,
    isError: buildingsError,
    error: buildingsErrorObj,
  } = useBuildingsList();

  const {
    data: maintenanceResponse,
    isLoading: maintenanceLoading,
    isError: maintenanceError,
    error: maintenanceErrorObj,
    refetch: refetchMaintenance,
  } = useMaintenanceRequests(
    buildingFilter !== "all" ? { buildingId: buildingFilter } : undefined,
  );

  const createRequestMutation = useCreateMaintenanceRequest();
  const updateStatusMutation = useUpdateMaintenanceStatus();
  const updateRequestMutation = useUpdateMaintenanceRequest();
  const deleteRequestMutation = useDeleteMaintenanceRequest();

  // ── Computed ─────────────────────────────────────────────────────────────
  const requests = maintenanceResponse?.data || [];
  const summary = maintenanceResponse?.summary || null;
  const isLoading = buildingsLoading || maintenanceLoading;

  const getUnitsForBuilding = (): Unit[] => {
    if (!formData.buildingId) return [];
    const selected = buildings.find((b) => b.id === formData.buildingId);
    return (selected?.units || []) as Unit[];
  };

  const unitsForSelected = getUnitsForBuilding();

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddRequest = async () => {
    if (!formData.buildingId || !formData.unitId || !formData.issueTitle)
      return;

    const selectedUnit = unitsForSelected.find((u) => u.id === formData.unitId);
    if (!selectedUnit) return;

    try {
      await createRequestMutation.mutateAsync({
        tenantId: selectedUnit.tenant_id || null,
        buildingId: formData.buildingId,
        unitId: formData.unitId,
        issueTitle: formData.issueTitle,
        description: formData.description || null,
        priority: formData.priority,
        assignedTo: formData.assignedTo || null,
      });

      setFormData({
        buildingId: "",
        unitId: "",
        issueTitle: "",
        description: "",
        priority: "medium",
        assignedTo: "",
      });
      setIsAddDialogOpen(false);
    } catch {}
  };

  const handleEditClick = (req: MaintenanceRequest) => {
    setEditingRequest(req);
    setFormData({
      buildingId: "", // not editable
      unitId: "", // not editable
      issueTitle: req.issue_title,
      description: req.description || "",
      priority: req.priority,
      assignedTo: req.assigned_to || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateRequest = async () => {
    if (!editingRequest) return;

    try {
      await updateRequestMutation.mutateAsync({
        id: editingRequest.id,
        issueTitle: formData.issueTitle,
        description: formData.description || undefined,
        priority: formData.priority,
        assignedTo: formData.assignedTo || undefined,
      });
      setIsEditDialogOpen(false);
      setEditingRequest(null);
    } catch {}
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: "pending" | "in_progress" | "completed" | "cancelled",
  ) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRequestMutation.mutateAsync(id);
    } catch {}
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "in_progress":
        return <Wrench className="w-4 h-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "low":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // ── Render ───────────────────────────────────────────────────────────────
  if (buildingsError || maintenanceError) {
    return (
      <ErrorState
        error={
          buildingsErrorObj?.message ||
          maintenanceErrorObj?.message ||
          "Failed to load data"
        }
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      <CurrentDate />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage maintenance requests
          </p>
        </div>

        <Button size="lg" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          New Request
        </Button>

        {/* Create Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Maintenance Request</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Building *</Label>
                <Select
                  value={formData.buildingId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, buildingId: value, unitId: "" })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {getIconEmoji(b.icon)} {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Unit *</Label>
                <Select
                  value={formData.unitId}
                  onValueChange={(v) => setFormData({ ...formData, unitId: v })}
                  disabled={!formData.buildingId || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitsForSelected.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.unit_number} —{" "}
                        {u.is_occupied && u.tenant_name
                          ? u.tenant_name
                          : "Vacant"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Issue Title *</Label>
                <Input
                  value={formData.issueTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, issueTitle: e.target.value })
                  }
                  placeholder="e.g., Leaking roof"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Details of the issue..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) =>
                    setFormData({ ...formData, priority: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High - Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assigned To (optional)</Label>
                <Input
                  value={formData.assignedTo}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTo: e.target.value })
                  }
                  placeholder="e.g., Electrician James"
                />
              </div>

              <Button
                onClick={handleAddRequest}
                className="w-full mt-2"
                disabled={createRequestMutation.isPending}
              >
                {createRequestMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Request"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Maintenance Request</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Building</Label>
                <Input value={editingRequest?.building_name || ""} disabled />
              </div>
              <div>
                <Label>Unit</Label>
                <Input value={editingRequest?.unit_number || ""} disabled />
              </div>
              <div>
                <Label>Issue Title *</Label>
                <Input
                  value={formData.issueTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, issueTitle: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label>Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) =>
                    setFormData({ ...formData, priority: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High - Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned To (optional)</Label>
                <Input
                  value={formData.assignedTo}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTo: e.target.value })
                  }
                  placeholder="e.g., Electrician James"
                />
              </div>
              <Button
                onClick={handleUpdateRequest}
                className="w-full mt-2"
                disabled={updateRequestMutation.isPending}
              >
                {updateRequestMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger className="w-full sm:w-64">
            <Building2 className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by Building" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">🏢 All Buildings</SelectItem>
            {buildings.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {getIconEmoji(b.icon)} {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.pending || 0}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {summary?.in_progress || 0}
                </p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.completed || 0}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              No maintenance requests found{" "}
              {buildingFilter !== "all" ? `for this building` : ""}.
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {getStatusIcon(req.status)}
                      <div>
                        <p className="font-medium">{req.issue_title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>{getIconEmoji(req.building_icon)}</span>
                          <span>{req.building_name}</span>
                          <span>•</span>
                          <span>Unit {req.unit_number}</span>
                          {req.tenant_name && (
                            <>
                              <span>•</span>
                              <span>{req.tenant_name}</span>
                            </>
                          )}
                        </div>

                        {req.description && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {req.description}
                          </p>
                        )}

                        {req.assigned_to && (
                          <p className="text-xs mt-1 text-muted-foreground">
                            Assigned to: {req.assigned_to}
                          </p>
                        )}

                        <p className="text-xs mt-2 text-muted-foreground">
                          Created: {formatDate(req.created_at)}
                          {req.completed_at && (
                            <> • Completed: {formatDate(req.completed_at)}</>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                          getPriorityColor(req.priority),
                        )}
                      >
                        {req.priority}
                      </span>

                      <Select
                        value={req.status}
                        onValueChange={(v) =>
                          handleUpdateStatus(
                            req.id,
                            v as
                              | "pending"
                              | "in_progress"
                              | "completed"
                              | "cancelled",
                          )
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(req)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Request?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the request and all
                              associated expenses.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(req.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
