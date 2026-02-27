// src/components/buildings/tabs/StaffTab.tsx
import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Button } from "@/components/ui/button";
import { StaffFormModal } from "../modals/StaffFormModal";
import type { Building } from "../utils";
import {
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
} from "@/hooks/useBuildingAps";
import { useToast } from "@/hooks/use-toast";

interface StaffTabProps {
  building: Building;
}

export const StaffTab: React.FC<StaffTabProps> = ({ building }) => {
  const { toast } = useToast();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    staff: any;
  }>({ isOpen: false, staff: null });

  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const handleSaveStaff = async (formData: any) => {
    try {
      if (modalState.staff) {
        await updateStaff.mutateAsync({
          id: modalState.staff.id,
          buildingId: building.id,
          data: formData,
        });
        toast({
          title: "Success",
          description: "Staff member updated successfully",
          variant: "success",
        });
      } else {
        await createStaff.mutateAsync({
          ...formData,
          building_id: building.id,
        });
        toast({
          title: "Success",
          description: "Staff member added successfully",
          variant: "success",
        });
      }
      setModalState({ isOpen: false, staff: null });
    } catch (error) {
      toast({
        title: error.response.data.code,
        description:
          error.response.data.message ||
          "Failed to save staff member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (
      window.confirm(
        `Delete staff member "${staffName}"? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteStaff.mutateAsync({ staffId, buildingId: building.id });
        toast({
          title: "Success",
          description: "Staff member deleted successfully",
          variant: "success",
        });
      } catch (error) {
        console.error("Failed to delete staff:", error);
        toast({
          title: error.response.data.code,
          description:
            error.response.data.message ||
            "Failed to delete staff member. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (!building) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-300">
        <p>No building data available</p>
      </div>
    );
  }

  const staff = building.staff || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Staff & Contacts
        </h2>
        <Button
          onClick={() => setModalState({ isOpen: true, staff: null })}
          disabled={createStaff.isPending}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Staff
        </Button>
      </div>

      <Card className="dark:bg-gray-800">
        {staff.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Staff Members Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Add staff members to manage this building
            </p>
            <Button
              onClick={() => setModalState({ isOpen: true, staff: null })}
              variant="outline"
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Add First Staff Member
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {staff.map((staffMember) => (
                  <tr
                    key={staffMember.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {staffMember.name || "Unnamed"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant="blue"
                        className="dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {staffMember.role || "unknown"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {staffMember.phone || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {staffMember.email || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() =>
                            setModalState({ isOpen: true, staff: staffMember })
                          }
                          disabled={updateStaff.isPending}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() =>
                            handleDeleteStaff(staffMember.id, staffMember.name)
                          }
                          disabled={deleteStaff.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modalState.isOpen && (
        <StaffFormModal
          isOpen={modalState.isOpen}
          staff={modalState.staff}
          onClose={() => setModalState({ isOpen: false, staff: null })}
          onSave={handleSaveStaff}
        />
      )}
    </div>
  );
};
