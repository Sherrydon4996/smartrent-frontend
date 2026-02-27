import { Moon, Sun, Bell, DollarSign, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme, setCurrency } from "@/slices/settingsQuerySlice";
import type { Currency } from "./types";
import { useAuth } from "@/hooks/useAuthentication";

export function SettingsGeneral() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { theme, currency } = useAppSelector((state) => state.settingsQ);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Toggle theme</p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={() => dispatch(toggleTheme())}
            />
          </div>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Currency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={currency}
            onValueChange={(v) => dispatch(setCurrency(v as Currency))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KES">KES (KSH)</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input
              value={user?.username || "user"}
              disabled
              className="bg-muted"
            />
          </div>
          <div>
            <Label>Role</Label>
            <Input
              value={user?.role || "user"}
              disabled
              className="bg-muted capitalize"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Email Reminders</p>
              <p className="text-sm text-muted-foreground">Rent due alerts</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">SMS Alerts</p>
              <p className="text-sm text-muted-foreground">Tenant SMS</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
