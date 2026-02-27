// src/components/buildings/tabs/UnitsTab.tsx
import { useState } from "react";
import { Plus, Edit, Trash2, Home } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Button } from "@/components/ui/button";
import { UnitFormModal } from "../modals/UnitFormModal";
import type { Building } from "../utils";
import {
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
} from "@/hooks/useBuildingAps";
import { useToast } from "@/hooks/use-toast";
import { useSettingsApi } from "@/hooks/useSettingsApi";

// Color palette for unit type cards
const UNIT_TYPE_COLORS = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-green-500 to-green-600",
  "from-orange-500 to-orange-600",
  "from-pink-500 to-pink-600",
  "from-indigo-500 to-indigo-600",
  "from-teal-500 to-teal-600",
  "from-red-500 to-red-600",
];

interface UnitsTabProps {
  building: Building;
}

export const UnitsTab: React.FC<UnitsTabProps> = ({ building }) => {
  // const { buildings } = useAppSelector((state) => state.settings);
  const { buildings, buildingsLoading, buildingsError } = useSettingsApi();

  console.log(buildings);

  const { toast } = useToast();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    unit: any;
  }>({ isOpen: false, unit: null });

  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  const deleteUnit = useDeleteUnit();

  // Fetch building settings to get unit types

  if (!building) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-300">
        <p>No building data available</p>
      </div>
    );
  }

  const currentBuilding = buildings?.find((b) => b.id === building.id);
  const configuredUnitTypes = currentBuilding?.unitTypes || [];
  const units = building.units || [];

  // Group units by unit_type_id
  const unitsByType = units.reduce(
    (acc, unit) => {
      if (!unit?.unit_type_id) return acc;
      if (!acc[unit.unit_type_id]) acc[unit.unit_type_id] = [];
      acc[unit.unit_type_id].push(unit);
      return acc;
    },
    {} as Record<string, typeof units>,
  );

  // Only show unit types that have units OR are configured
  const displayUnitTypes = configuredUnitTypes
    .map((config, index) => ({
      ...config,
      count: unitsByType[config.unit_type_id]?.length || 0,
      colorClass: UNIT_TYPE_COLORS[index % UNIT_TYPE_COLORS.length],
    }))
    .filter((ut) => ut.count > 0 || configuredUnitTypes.length > 0);

  const handleSaveUnit = async (formData: any) => {
    try {
      if (modalState.unit) {
        await updateUnit.mutateAsync({
          id: modalState.unit.id,
          data: formData,
        });
        toast({
          title: "Success",
          description: "Unit updated successfully",
          variant: "success",
        });
      } else {
        await createUnit.mutateAsync({
          ...formData,
          building_id: building.id,
        });
        toast({
          title: "Success",
          description: "Unit created successfully",
          variant: "success",
        });
      }
      setModalState({ isOpen: false, unit: null });
    } catch (error) {
      toast({
        title: error.response.data.code,
        description:
          error.response.data.message ||
          "Failed to save unit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUnit = async (unitId: string, unitNumber: string) => {
    if (
      window.confirm(`Delete unit ${unitNumber}? This action cannot be undone.`)
    ) {
      try {
        await deleteUnit.mutateAsync({ unitId, buildingId: building.id });
        toast({
          title: "Success",
          description: "Unit deleted successfully",
          variant: "success",
        });
      } catch (error) {
        console.error("Failed to delete unit:", error);
        toast({
          title: error.response.data.code,
          description:
            error.response.data.message ||
            "Failed to delete unit. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Units Management
        </h2>
        <Button
          onClick={() => setModalState({ isOpen: true, unit: null })}
          disabled={createUnit.isPending}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Unit
        </Button>
      </div>

      {displayUnitTypes.length === 0 ? (
        <Card className="dark:bg-gray-800 p-8 text-center">
          <Home className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            No unit types configured
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure unit types in Settings → Buildings & Unit Types
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayUnitTypes.map((typeConfig) => (
              <div
                key={typeConfig.unit_type_id}
                className="cursor-pointer group"
                onClick={() =>
                  setSelectedType(
                    selectedType === typeConfig.unit_type_id
                      ? null
                      : typeConfig.unit_type_id,
                  )
                }
              >
                <Card
                  className={`relative overflow-hidden transition-all duration-300 dark:bg-gray-800 ${
                    selectedType === typeConfig.unit_type_id
                      ? "ring-4 ring-white dark:ring-gray-700 shadow-2xl scale-105"
                      : "hover:shadow-xl hover:scale-102"
                  }`}
                >
                  <div
                    className={`bg-gradient-to-br ${typeConfig.colorClass} p-6 text-white`}
                  >
                    <p className="text-4xl font-bold mb-2">
                      {typeConfig.count}
                    </p>
                    <p className="text-sm font-medium opacity-90">
                      {typeConfig.unit_type_name || "Unnamed"}
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                      KES {typeConfig.monthly_rent?.toLocaleString() || "0"}/mo
                    </p>
                  </div>
                  {selectedType === typeConfig.unit_type_id && (
                    <div className="absolute inset-0 bg-white/20 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-3 h-3 bg-white dark:bg-gray-300 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>

          {selectedType && (
            <Card className="dark:bg-gray-800">
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                  {configuredUnitTypes.find(
                    (ut) => ut.unit_type_id === selectedType,
                  )?.unit_type_name || "Units"}
                </h3>

                {!unitsByType[selectedType] ||
                unitsByType[selectedType].length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No units of this type yet</p>
                    <Button
                      onClick={() =>
                        setModalState({ isOpen: true, unit: null })
                      }
                      className="mt-4 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add First Unit
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Unit Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Monthly Rent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Tenant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {(unitsByType[selectedType] || []).map((unit) => (
                          <tr
                            key={unit.id}
                            className={`transition-colors ${
                              unit.is_occupied
                                ? "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                                : "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                              {unit.unit_number || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-semibold">
                              KES {unit.monthly_rent?.toLocaleString() || "0"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                variant={
                                  unit.is_occupied ? "warning" : "success"
                                }
                                className={
                                  unit.is_occupied
                                    ? "dark:bg-yellow-900/30 dark:text-yellow-300"
                                    : "dark:bg-green-900/30 dark:text-green-300"
                                }
                              >
                                {unit.is_occupied ? "Occupied" : "Vacant"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                              {unit.tenant_name || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                              {unit.tenant_phone || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="dark:text-gray-300 dark:hover:bg-gray-700"
                                  onClick={() =>
                                    setModalState({ isOpen: true, unit })
                                  }
                                  disabled={updateUnit.isPending}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteUnit(unit.id, unit.unit_number)
                                  }
                                  className="hover:bg-red-100 dark:hover:bg-red-900/30 dark:text-gray-300"
                                  disabled={deleteUnit.isPending}
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
              </div>
            </Card>
          )}
        </>
      )}

      {modalState.isOpen && (
        <UnitFormModal
          isOpen={modalState.isOpen}
          unit={modalState.unit}
          buildingId={building.id}
          onClose={() => setModalState({ isOpen: false, unit: null })}
          onSave={handleSaveUnit}
        />
      )}
    </div>
  );
};
