// src/components/buildings/BuildingsList.tsx
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BuildingFormModal } from "./modals/BuildingFormModal";
import { icons } from "@/utils/utils";
import { getIconEmoji } from "./utils";
import type { Building } from "./utils";

import { useToast } from "@/hooks/use-toast";
import {
  useBuildingsList,
  useCreateBuilding,
  useDeleteBuilding,
} from "@/hooks/useBuildingAps";

interface BuildingsListProps {
  onSelectBuilding: (id: string) => void;
}

export const BuildingsList: React.FC<BuildingsListProps> = ({
  onSelectBuilding,
}) => {
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  const { data: buildings = [], isLoading, error } = useBuildingsList();
  const createBuilding = useCreateBuilding();
  const deleteBuilding = useDeleteBuilding();

  const handleAddBuilding = async (formData: any) => {
    try {
      await createBuilding.mutateAsync(formData);
      setShowModal(false);
      toast({
        title: "Success",
        description: "Building created successfully",
        variant: "success",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: error.response.data.code,
        description:
          error.response.data.message ||
          "Failed to create building. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      window.confirm(
        `Delete "${name}" and all its units/staff? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteBuilding.mutateAsync(id);
        toast({
          title: "Success",
          description: "Building deleted successfully",
          variant: "success",
        });
      } catch (error) {
        console.error("Failed to delete building:", error);
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
                Loading buildings...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <icons.alertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Error Loading Buildings
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {error?.message || "An unexpected error occurred"}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalUnits = buildings.reduce(
    (sum, b) => sum + (b.units?.length || 0),
    0,
  );
  const occupied = buildings.reduce(
    (sum, b) => sum + (b.units?.filter((u) => u?.is_occupied)?.length || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Buildings Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage your properties, units and staff
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <icons.plus className="w-4 h-4 mr-2" /> Add Building
          </Button>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <icons.building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {buildings.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Total Buildings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <icons.checkCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {buildings.filter((b) => b?.wifi_installed).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    With WiFi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <icons.home className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalUnits}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Total Units
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <icons.User className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {occupied}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Occupied
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {buildings.length === 0 ? (
          <Card className="dark:bg-gray-800 p-12 text-center">
            <icons.building2 className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Buildings Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get started by adding your first building
            </p>
            <Button onClick={() => setShowModal(true)}>
              <icons.plus className="w-4 h-4 mr-2" /> Add Your First Building
            </Button>
          </Card>
        ) : (
          /* Buildings grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.map((building) => {
              const units = building.units || [];
              const occupancy =
                units.length > 0
                  ? Math.round(
                      (units.filter((u) => u?.is_occupied).length /
                        units.length) *
                        100,
                    )
                  : 0;

              return (
                <Card
                  key={building.id}
                  className="dark:bg-gray-800 hover:shadow-md dark:hover:shadow-gray-900 transition-shadow duration-200 overflow-hidden"
                >
                  {/* Building Icon Banner */}
                  <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-4xl shadow-lg">
                          {getIconEmoji(building.icon || "b1")}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white dark:text-white">
                            {building.name || "Unnamed Building"}
                          </h3>
                          <p className="text-blue-100 dark:text-blue-200 text-sm flex items-center gap-1">
                            <icons.MapPin className="w-3 h-3" />
                            {building.city || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white dark:text-white hover:bg-white/20 dark:hover:bg-white/30"
                          onClick={() => onSelectBuilding(building.id)}
                        >
                          <icons.eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white dark:text-white hover:bg-red-500/30 dark:hover:bg-red-600/30"
                          onClick={() =>
                            handleDelete(building.id, building.name)
                          }
                          disabled={deleteBuilding.isPending}
                        >
                          <icons.trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Building Details */}
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2 mb-5">
                      <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40">
                        {building.type || "residential"}
                      </Badge>
                      {building.wifi_installed && (
                        <Badge
                          variant="secondary"
                          className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40"
                        >
                          <icons.Wifi className="w-3 h-3" /> WiFi
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className="inline-flex items-center gap-1 dark:bg-gray-700 dark:text-gray-300"
                      >
                        <icons.home className="w-3 h-3" />
                        {units.length} Units
                      </Badge>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1.5">
                        <span>Occupancy</span>
                        <span className="font-medium">{occupancy}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-700 transition-all duration-500"
                          style={{ width: `${occupancy}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>
                          {units.filter((u) => u?.is_occupied).length} occupied
                        </span>
                        <span>
                          {units.length -
                            units.filter((u) => u?.is_occupied).length}{" "}
                          vacant
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => onSelectBuilding(building.id)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {showModal && (
          <BuildingFormModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleAddBuilding}
          />
        )}
      </div>
    </div>
  );
};
