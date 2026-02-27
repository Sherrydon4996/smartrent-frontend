import React from "react";
import { CurrentDate } from "@/components/CurrentDate";
import { SettingsGeneral } from "./GeneralSettings";
import { SettingsBuildingsUnitTypes } from "./SettingsBuildingUnitTypes";
import { SettingsUsersPenalties } from "./SettingsUsersPenalties";

export function Settings() {
  return (
    <div className="space-y-6 animate-fade-in">
      <CurrentDate />

      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, theme, currency, users, penalties, and buildings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings (Theme, Currency, Profile, Notifications) */}
        <SettingsGeneral />

        {/* Buildings & Unit Types */}
        <SettingsBuildingsUnitTypes />

        {/* Penalties & User Management */}
        <SettingsUsersPenalties />
      </div>
    </div>
  );
}
