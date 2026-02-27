// src/components/buildings/BuildingDetails.tsx
import { useState } from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/Button";
import { OverviewTab } from "./tabs/OverviewTab";
import { UnitsTab } from "./tabs/UnitsTab";
import { StaffTab } from "./tabs/StaffTabs";
import { BuildingFormModal } from "./modals/BuildingFormModal";
import type { Building } from "./utils";
import { useUpdateBuilding, useDeleteBuilding } from "@/hooks/useBuildingAps";
import { useToast } from "@/hooks/use-toast";

import {
  useBuildingDetail,
  useBuildingUnits,
  useBuildingStaff,
} from "./../../hooks/useBuildingAps";

interface BuildingDetailsProps {
  buildingId: string;
  onBack: () => void;
}

export const BuildingDetails: React.FC<BuildingDetailsProps> = ({
  buildingId,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

  const {
    data: buildingBase,
    isLoading: loadingBase,
    error: errorBase,
  } = useBuildingDetail(buildingId);
  const {
    data: units = [],
    isLoading: loadingUnits,
    error: errorUnits,
  } = useBuildingUnits(buildingId);
  const {
    data: staff = [],
    isLoading: loadingStaff,
    error: errorStaff,
  } = useBuildingStaff(buildingId);

  const isLoading = loadingBase || loadingUnits || loadingStaff;
  const error = errorBase || errorUnits || errorStaff;

  const building: Building | undefined = buildingBase
    ? { ...buildingBase, units, staff }
    : undefined;

  const updateBuilding = useUpdateBuilding();
  const deleteBuilding = useDeleteBuilding();

  const handleUpdate = async (formData: any) => {
    try {
      await updateBuilding.mutateAsync({ id: buildingId, data: formData });
      setShowEditModal(false);
      toast({
        title: "Success",
        description: "Building updated successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: error.response.data.code,
        description:
          error.response.data.message ||
          "failed to update building please try again",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Delete "${building?.name}" and all related data? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteBuilding.mutateAsync(buildingId);
        toast({
          title: "Success",
          description: "Building deleted successfully",
          variant: "success",
        });
        onBack();
      } catch (error) {
        toast({
          title: error.response.data.code,
          description:
            error.response.data.message ||
            "Failed to delete building. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                Loading building details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
            <p className="text-yellow-800 dark:text-yellow-200">
              {error?.message || "No building data available"}
            </p>
            <Button onClick={onBack} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {building.name || "Unnamed Building"}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {building.city || "Unknown City"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(true)}
              disabled={updateBuilding.isPending}
            >
              <Edit className="w-4 h-4 mr-2" /> Edit Building
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteBuilding.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteBuilding.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-8">
            {["overview", "units", "staff"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === "overview" && <OverviewTab building={building} />}
        {activeTab === "units" && <UnitsTab building={building} />}
        {activeTab === "staff" && <StaffTab building={building} />}

        {/* Edit Modal */}
        {showEditModal && (
          <BuildingFormModal
            isOpen={showEditModal}
            building={building}
            onClose={() => setShowEditModal(false)}
            onSave={handleUpdate}
          />
        )}
      </div>
    </div>
  );
};
