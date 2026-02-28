import React, { useState } from "react";
import { Shield, Percent, Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType, Penalty } from "./types";

import { Skeleton } from "@/components/ui/skeleton";
import { useSettingsApi } from "@/hooks/useSettingsApi";
import { useAuth } from "@/hooks/useAuthentication";

export function SettingsUsersPenalties() {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    buildings,
    penalties,
    penaltiesLoading,
    users,
    usersLoading,
    createPenalty,
    updatePenalty,
    deletePenalty,
    addUser,
    updateUser,
    deleteUser,
    suspendUser,
    unsuspendUser,
  } = useSettingsApi();

  // User Form States
  const [newUsername, setNewUsername] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editRole, setEditRole] = useState("user");

  // Penalty Form States
  const [newPenaltyBuildingId, setNewPenaltyBuildingId] = useState("");
  const [newPenaltyPercentage, setNewPenaltyPercentage] = useState("");

  const [editingPenaltyId, setEditingPenaltyId] = useState<string | null>(null);
  const [editPenaltyPercentage, setEditPenaltyPercentage] = useState("");

  // Get buildings that don't have penalties yet
  const availableBuildings = buildings.filter(
    (building) =>
      !penalties.some((penalty) => penalty.building_id === building.id),
  );

  // User Handlers
  const handleAddUser = async () => {
    if (!newUsername.trim() || !newMobile.trim() || !newPassword.trim()) {
      toast({
        title: "Missing fields",
        description: "Fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await addUser({
        username: newUsername.trim(),
        mobile: newMobile.trim(),
        password: newPassword.trim(),
        role: newRole,
      });
      toast({
        title: "User added",
        variant: "success",
        description: newUsername,
      });
      setNewUsername("");
      setNewMobile("");
      setNewPassword("");
      setNewRole("user");
    } catch (err) {
      console.error(err);
    } // Error handled in mutation
  };

  const startEditingUser = (u: UserType) => {
    setEditingUserId(u.id);
    setEditUsername(u.username);
    setEditMobile(u.mobile);
    setEditRole(u.role);
  };

  const handleUpdateUser = async () => {
    if (!editingUserId || !editUsername.trim() || !editMobile.trim()) return;

    try {
      await updateUser({
        id: editingUserId,
        username: editUsername.trim(),
        mobile: editMobile.trim(),
        role: editRole,
      });
      toast({
        title: "Updated",
        variant: "success",
        description: editUsername,
      });
      setEditingUserId(null);
    } catch (err) {
      console.error(err);
    } // Error handled in mutation
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (!window.confirm(`Delete ${username}?`)) return;

    try {
      await deleteUser(id);
      toast({ title: "Deleted", variant: "success", description: username });
    } catch (err) {
      console.error(err);
    } // Error handled in mutation
  };

  const handleSuspendUser = async (id: string, username: string) => {
    if (!window.confirm(`Suspend ${username}?`)) return;

    try {
      await suspendUser(id);
      toast({
        title: "User suspended",
        variant: "success",
        description: username,
      });
    } catch (err) {
      console.error(err);
    } // Error handled in mutation
  };

  const handleUnsuspendUser = async (id: string, username: string) => {
    if (!window.confirm(`Unsuspend ${username}?`)) return;

    try {
      await unsuspendUser(id);
      toast({
        title: "User unsuspended",
        variant: "success",
        description: username,
      });
    } catch (err) {
      console.error(err);
    } // Error handled in mutation
  };

  // Penalty Handlers

  const handleCreatePenalty = async () => {
    if (!newPenaltyBuildingId) {
      toast({
        title: "Missing building",
        description: "Select a building",
        variant: "destructive",
      });
      return;
    }

    const percentage = parseFloat(newPenaltyPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast({
        title: "Invalid percentage",
        description: "Enter a valid percentage between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPenalty({
        building_id: newPenaltyBuildingId,
        percentage,
      });
      toast({
        title: "Success",
        variant: "success",
        description: "Penalty created successfully",
      });
      setNewPenaltyBuildingId("");
      setNewPenaltyPercentage("");
    } catch (err) {
      console.error(err);
    } // Error handled in mutation
  };

  const startEditingPenalty = (p: Penalty) => {
    setEditingPenaltyId(p.id);
    setEditPenaltyPercentage(p.percentage.toString());
  };

  const handleUpdatePenalty = async () => {
    if (!editingPenaltyId) return;

    const percentage = parseFloat(editPenaltyPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast({
        title: "Invalid percentage",
        description: "Enter a valid percentage between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    try {
      await updatePenalty({
        id: editingPenaltyId,
        percentage,
      });
      toast({
        title: "Success",
        variant: "success",
        description: "Penalty updated successfully",
      });
      setEditingPenaltyId(null);
    } catch (err) {
      console.error(err);
    } // Error handled in mutation
  };

  const handleDeletePenalty = async (id: string, buildingName: string) => {
    if (!window.confirm(`Delete penalty for ${buildingName}?`)) return;

    try {
      await deletePenalty(id);
      toast({
        title: "Success",
        variant: "success",
        description: "Penalty deleted successfully",
      });
    } catch (err) {
      console.error(err);
    } // Error handled in mutation
  };

  return (
    <>
      {/* Penalties */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Penalty Configuration
          </CardTitle>
          <CardDescription>
            Set late payment penalty rates per building (percentage per day)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Alert */}
          {penalties.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No penalties configured yet. Add penalties to automatically
                calculate late fees for tenants.
              </AlertDescription>
            </Alert>
          )}

          {/* Create Penalty */}
          {availableBuildings.length > 0 ? (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h3 className="text-sm font-semibold mb-3">Add New Penalty</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Building *</Label>
                  <Select
                    value={newPenaltyBuildingId}
                    onValueChange={setNewPenaltyBuildingId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBuildings.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Percentage per day (%) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={newPenaltyPercentage}
                    onChange={(e) => setNewPenaltyPercentage(e.target.value)}
                    placeholder="e.g., 2.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Typically 2-5% per day
                  </p>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCreatePenalty} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Penalty
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            penalties.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  All buildings have penalties configured. Delete an existing
                  penalty to add a new one.
                </AlertDescription>
              </Alert>
            )
          )}

          {/* Existing Penalties */}
          {penaltiesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : penalties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Percent className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No penalties configured yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {penalties.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-muted/20 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  {editingPenaltyId === p.id ? (
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex-1">
                        <Label className="text-sm font-medium mb-1 block">
                          {p.building_name || `Building ID: ${p.building_id}`}
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={editPenaltyPercentage}
                            onChange={(e) =>
                              setEditPenaltyPercentage(e.target.value)
                            }
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdatePenalty}>
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPenaltyId(null);
                            setEditPenaltyPercentage("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <p className="font-medium text-base">
                            {p.building_name || `Building ID: ${p.building_id}`}
                          </p>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-primary">
                            {p.percentage}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            per day late payment fee
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditingPenalty(p)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() =>
                            handleDeletePenalty(
                              p.id,
                              p.building_name || "this building",
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Management (Admin only) */}
      {user.role === "admin" && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage system users and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Add New User */}
            <div className="p-5 bg-muted/50 rounded-lg border">
              <h3 className="font-medium text-lg mb-4">Add New User</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Username *</Label>
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label>Mobile *</Label>
                  <Input
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    placeholder="e.g., +254700000000"
                  />
                </div>
                <div>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex items-end">
                  <div className="w-full">
                    <Label>Role</Label>
                    <Select value={newRole} onValueChange={setNewRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={handleAddUser} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </div>

            {/* Existing Users */}
            <div>
              <h3 className="font-medium text-lg mb-4">
                Existing Users ({users.length})
              </h3>
              {usersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((u) => (
                    <div key={u.id} className="p-4 bg-muted rounded-lg">
                      {editingUserId === u.id ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Input
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            placeholder="Username"
                          />
                          <Input
                            value={editMobile}
                            onChange={(e) => setEditMobile(e.target.value)}
                            placeholder="Mobile"
                          />
                          <Select value={editRole} onValueChange={setEditRole}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2 items-end">
                            <Button size="sm" onClick={handleUpdateUser}>
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUserId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{u.username}</p>
                            <p className="text-sm text-muted-foreground">
                              Mobile: {u.mobile} • Role:{" "}
                              <span className="capitalize font-medium">
                                {u.role}
                              </span>{" "}
                              • Status:{" "}
                              <span
                                className={
                                  u.status === "suspended"
                                    ? "text-red-600 font-medium"
                                    : "text-green-600 font-medium"
                                }
                              >
                                {u.status || "active"}
                              </span>
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingUser(u)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id, u.username)}
                            >
                              Delete
                            </Button>
                            {u.status === "suspended" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                                onClick={() =>
                                  handleUnsuspendUser(u.id, u.username)
                                }
                              >
                                Unsuspend
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleSuspendUser(u.id, u.username)
                                }
                              >
                                Suspend
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
