// src/components/buildings/tabs/OverviewTab.tsx
import { Card } from "../ui/Card";
import type { Building } from "../utils";

interface OverviewTabProps {
  building: Building;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ building }) => {
  if (!building) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-300">
        <p>No building data available</p>
      </div>
    );
  }

  const units = building.units || [];
  const staff = building.staff || [];

  console.log("units", units);

  const occupied = units.filter(
    (u) => u?.is_occupied === 1 || u?.is_occupied === true,
  ).length;
  const vacant = units.length - occupied;
  const occupancyRate =
    units.length > 0 ? Math.round((occupied / units.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dark:bg-gray-800 p-6 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {units.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Total Units
          </p>
        </Card>

        <Card className="dark:bg-gray-800 p-6 text-center">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {occupied}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Occupied
          </p>
        </Card>

        <Card className="dark:bg-gray-800 p-6 text-center">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {vacant}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Vacant
          </p>
        </Card>

        <Card className="dark:bg-gray-800 p-6 text-center">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {staff.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Staff Members
          </p>
        </Card>
      </div>

      {/* Additional Overview Information */}
      <Card className="dark:bg-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Building Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Type</p>
            <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
              {building.type || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">City</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {building.city || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              WiFi Status
            </p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {building.wifi_installed ? "Installed" : "Not Installed"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Occupancy Rate
            </p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {occupancyRate}%
            </p>
          </div>
        </div>
      </Card>

      {/* Monthly Revenue Estimate */}
      {units.length > 0 && (
        <Card className="dark:bg-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Full Capacity Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                KES{" "}
                {units
                  .reduce((sum, unit) => sum + (unit.monthly_rent || 0), 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                If all {units.length} unit{units.length !== 1 ? "s" : ""} were
                occupied
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Current Monthly Revenue
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                KES{" "}
                {units
                  .filter((u) => u.is_occupied === 1 || u.is_occupied === true)
                  .reduce((sum, unit) => sum + (unit.monthly_rent || 0), 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                From {occupied} occupied unit{occupied !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
