"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface AppearanceSettingsProps {
  settings: any;
}

export function AppearanceSettings({ settings: initialSettings }: AppearanceSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    primaryColor: initialSettings?.primaryColor || "#f97316",
    logo: initialSettings?.logo || "/logo-flickerplay.png",
    favicon: initialSettings?.favicon || "/favicon.ico",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement appearance settings update
      toast.success("Appearance settings updated successfully");
    } catch (error) {
      toast.error("Failed to update appearance settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement file upload
      toast.info("File upload functionality coming soon");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Appearance Settings</CardTitle>
          <CardDescription>
            Customize the look and feel of your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Color */}
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-4 items-center">
              <Input
                id="primaryColor"
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                placeholder="#f97316"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This color will be used for buttons, links, and accents
            </p>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {settings.logo && (
                <div className="relative w-20 h-20 rounded border border-border overflow-hidden">
                  <Image
                    src={settings.logo}
                    alt="Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Label htmlFor="logo-upload">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </span>
                  </Button>
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended size: 512x512px, PNG or SVG format
                </p>
              </div>
            </div>
          </div>

          {/* Favicon Upload */}
          <div className="space-y-2">
            <Label>Favicon</Label>
            <div className="flex items-center gap-4">
              {settings.favicon && (
                <div className="relative w-10 h-10 rounded border border-border overflow-hidden">
                  <Image
                    src={settings.favicon}
                    alt="Favicon"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/x-icon,image/png"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="favicon-upload"
                />
                <Label htmlFor="favicon-upload">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Favicon
                    </span>
                  </Button>
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended size: 32x32px or 64x64px, ICO or PNG format
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}