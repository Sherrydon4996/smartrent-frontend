export const BUILDING_ICONS = {
  b1: "🏠",
  b2: "💙",
  b3: "🌿",
  b4: "🌅",
  b5: "🏢",
  b6: "🏬",
  b7: "🏗️",
  b8: "🏛️",
  b9: "🏨",
  b0: "🏪",
};

// Helper function to get emoji from icon key
export const getIconEmoji = (iconKey) => {
  return BUILDING_ICONS[iconKey] || BUILDING_ICONS.b1; // fallback to 🏠
};

export interface Staff {
  id: string;
  building_id: string;
  role: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface Unit {
  id: string;
  building_id: string;
  unit_type_id: string;
  // unit_type_name: string;
  unit_number: string;
  is_occupied: boolean;
  // monthly_rent: number;
  tenant_name?: string | null;
  tenant_phone?: string | null;
  created_at: string;
}
export interface Building {
  id: string;
  name: string;
  type: string;
  city: string;
  wifi_installed: boolean;
  icon: string;
  created_at: string;
  units: Unit[];
  staff: Staff[];
}

export interface ExtendedBuilding extends Building {
  type: "residential" | "commercial" | "mixed";
  status: "active" | "pending" | "inactive";
  address: string;
  city: string;
  totalUnits: number;
  occupiedUnits: number;
  wifiInstalled: boolean;
  unitBreakdown: {
    bedsitters: number;
    singleRooms: number;
    oneBedroom: number;
    twoBedroom: number;
    threeBedroom: number;
  };
  createdAt: string;
  description: string;
}

// types/buildings.ts

// Payload types for API requests
export interface CreateBuildingPayload {
  id?: string;
  name: string;
  type?: string;
  city: string;
  wifi_installed?: boolean;
  icon?: string;
}

export interface UpdateBuildingPayload {
  name?: string;
  type?: string;
  city?: string;
  wifi_installed?: boolean;
  icon?: string;
}

export interface CreateUnitPayload {
  id?: string;
  building_id: string;
  unit_type_id: string;
  unit_number: string;
}

export interface UpdateUnitPayload {
  unit_type_id?: string;
  unit_number?: string;
  is_occupied?: boolean;
  tenant_name?: string | null;
  tenant_phone?: string | null;
}

export interface CreateStaffPayload {
  id?: string;
  building_id: string;
  role: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateStaffPayload {
  role?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// API Response types
export interface CreateBuildingResponse {
  message: string;
  id: string;
}

export interface CreateUnitResponse {
  id: string;
  message: string;
  data: Unit;
}

export interface UpdateUnitResponse {
  message: string;
  data: Unit;
}

export interface CreateStaffResponse {
  id: string;
  message: string;
}
