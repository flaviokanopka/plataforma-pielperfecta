import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Palette, Save, Sun, Moon, Sidebar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ThemeSettings {
  id?: string;
  user_id?: string;
  
  // Brand colors
  brand_navy: string;
  brand_gold: string;
  brand_pink: string;
  
  // Light mode colors
  background_light: string;
  foreground_light: string;
  card_light: string;
  card_foreground_light: string;
  popover_light: string;
  popover_foreground_light: string;
  primary_light: string;
  primary_foreground_light: string;
  secondary_light: string;
  secondary_foreground_light: string;
  muted_light: string;
  muted_foreground_light: string;
  accent_light: string;
  accent_foreground_light: string;
  destructive_light: string;
  destructive_foreground_light: string;
  border_light: string;
  input_light: string;
  ring_light: string;
  
  // Dark mode colors
  background_dark: string;
  foreground_dark: string;
  card_dark: string;
  card_foreground_dark: string;
  popover_dark: string;
  popover_foreground_dark: string;
  primary_dark: string;
  primary_foreground_dark: string;
  secondary_dark: string;
  secondary_foreground_dark: string;
  muted_dark: string;
  muted_foreground_dark: string;
  accent_dark: string;
  accent_foreground_dark: string;
  destructive_dark: string;
  destructive_foreground_dark: string;
  border_dark: string;
  input_dark: string;
  ring_dark: string;
  
  // Sidebar colors light
  sidebar_background_light: string;
  sidebar_foreground_light: string;
  sidebar_primary_light: string;
  sidebar_primary_foreground_light: string;
  sidebar_accent_light: string;
  sidebar_accent_foreground_light: string;
  sidebar_border_light: string;
  sidebar_ring_light: string;
  
  // Sidebar colors dark
  sidebar_background_dark: string;
  sidebar_foreground_dark: string;
  sidebar_primary_dark: string;
  sidebar_primary_foreground_dark: string;
  sidebar_accent_dark: string;
  sidebar_accent_foreground_dark: string;
  sidebar_border_dark: string;
  sidebar_ring_dark: string;
}

const defaultSettings: ThemeSettings = {
  // Brand colors
  brand_navy: "#002736",
  brand_gold: "#91734E", 
  brand_pink: "#FBE5E9",
  
  // Light mode colors
  background_light: "#ffffff",
  foreground_light: "#002736",
  card_light: "#ffffff",
  card_foreground_light: "#002736",
  popover_light: "#ffffff",
  popover_foreground_light: "#002736",
  primary_light: "#002736",
  primary_foreground_light: "#ffffff",
  secondary_light: "#FBE5E9",
  secondary_foreground_light: "#002736",
  muted_light: "#FBE5E9",
  muted_foreground_light: "#4d7c8a",
  accent_light: "#91734E",
  accent_foreground_light: "#ffffff",
  destructive_light: "#ef4444",
  destructive_foreground_light: "#ffffff",
  border_light: "#e8ddd4",
  input_light: "#f5f0eb",
  ring_light: "#002736",
  
  // Dark mode colors
  background_dark: "#002736",
  foreground_dark: "#ffffff",
  card_dark: "#1a4654",
  card_foreground_dark: "#ffffff",
  popover_dark: "#1a4654",
  popover_foreground_dark: "#ffffff",
  primary_dark: "#91734E",
  primary_foreground_dark: "#002736",
  secondary_dark: "#2d5a69",
  secondary_foreground_dark: "#ffffff",
  muted_dark: "#2d5a69",
  muted_foreground_dark: "#b3b3b3",
  accent_dark: "#e8ddd4",
  accent_foreground_dark: "#002736",
  destructive_dark: "#dc2626",
  destructive_foreground_dark: "#ffffff",
  border_dark: "#3a6b7a",
  input_dark: "#3a6b7a",
  ring_dark: "#91734E",
  
  // Sidebar colors light
  sidebar_background_light: "#fcfcfc",
  sidebar_foreground_light: "#002736",
  sidebar_primary_light: "#002736",
  sidebar_primary_foreground_light: "#ffffff",
  sidebar_accent_light: "#FBE5E9",
  sidebar_accent_foreground_light: "#002736",
  sidebar_border_light: "#e8ddd4",
  sidebar_ring_light: "#002736",
  
  // Sidebar colors dark
  sidebar_background_dark: "#001a24",
  sidebar_foreground_dark: "#f2f2f2",
  sidebar_primary_dark: "#91734E",
  sidebar_primary_foreground_dark: "#002736",
  sidebar_accent_dark: "#2d5a69",
  sidebar_accent_foreground_dark: "#f2f2f2",
  sidebar_border_dark: "#3a6b7a",
  sidebar_ring_dark: "#91734E",
};

export default function Configuracoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("theme_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao carregar configurações:", error);
        return;
      }

      if (data) {
        const mergedSettings = { ...defaultSettings, ...data };
        setSettings(mergedSettings);
        applyThemeToCSS(mergedSettings);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const applyThemeToCSS = (themeSettings: ThemeSettings) => {
    const root = document.documentElement;
    
    // Brand colors
    root.style.setProperty('--brand-navy', hexToHsl(themeSettings.brand_navy));
    root.style.setProperty('--brand-gold', hexToHsl(themeSettings.brand_gold));
    root.style.setProperty('--brand-pink', hexToHsl(themeSettings.brand_pink));
    
    // Light mode
    root.style.setProperty('--background', hexToHsl(themeSettings.background_light));
    root.style.setProperty('--foreground', hexToHsl(themeSettings.foreground_light));
    root.style.setProperty('--card', hexToHsl(themeSettings.card_light));
    root.style.setProperty('--card-foreground', hexToHsl(themeSettings.card_foreground_light));
    root.style.setProperty('--popover', hexToHsl(themeSettings.popover_light));
    root.style.setProperty('--popover-foreground', hexToHsl(themeSettings.popover_foreground_light));
    root.style.setProperty('--primary', hexToHsl(themeSettings.primary_light));
    root.style.setProperty('--primary-foreground', hexToHsl(themeSettings.primary_foreground_light));
    root.style.setProperty('--secondary', hexToHsl(themeSettings.secondary_light));
    root.style.setProperty('--secondary-foreground', hexToHsl(themeSettings.secondary_foreground_light));
    root.style.setProperty('--muted', hexToHsl(themeSettings.muted_light));
    root.style.setProperty('--muted-foreground', hexToHsl(themeSettings.muted_foreground_light));
    root.style.setProperty('--accent', hexToHsl(themeSettings.accent_light));
    root.style.setProperty('--accent-foreground', hexToHsl(themeSettings.accent_foreground_light));
    root.style.setProperty('--destructive', hexToHsl(themeSettings.destructive_light));
    root.style.setProperty('--destructive-foreground', hexToHsl(themeSettings.destructive_foreground_light));
    root.style.setProperty('--border', hexToHsl(themeSettings.border_light));
    root.style.setProperty('--input', hexToHsl(themeSettings.input_light));
    root.style.setProperty('--ring', hexToHsl(themeSettings.ring_light));
    
    // Sidebar light
    root.style.setProperty('--sidebar-background', hexToHsl(themeSettings.sidebar_background_light));
    root.style.setProperty('--sidebar-foreground', hexToHsl(themeSettings.sidebar_foreground_light));
    root.style.setProperty('--sidebar-primary', hexToHsl(themeSettings.sidebar_primary_light));
    root.style.setProperty('--sidebar-primary-foreground', hexToHsl(themeSettings.sidebar_primary_foreground_light));
    root.style.setProperty('--sidebar-accent', hexToHsl(themeSettings.sidebar_accent_light));
    root.style.setProperty('--sidebar-accent-foreground', hexToHsl(themeSettings.sidebar_accent_foreground_light));
    root.style.setProperty('--sidebar-border', hexToHsl(themeSettings.sidebar_border_light));
    root.style.setProperty('--sidebar-ring', hexToHsl(themeSettings.sidebar_ring_light));
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("theme_settings")
        .upsert({
          user_id: user.id,
          ...settings,
        });

      if (error) throw error;

      applyThemeToCSS(settings);
      
      toast({
        title: "Configurações salvas!",
        description: "As cores do tema foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (field: keyof ThemeSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const ColorInput = ({ label, field, value }: { label: string; field: keyof ThemeSettings; value: string }) => (
    <div>
      <Label htmlFor={field}>{label}</Label>
      <div className="flex gap-2 items-center">
        <Input
          id={field}
          type="color"
          value={value}
          onChange={(e) => handleColorChange(field, e.target.value)}
          className="w-16 h-10 p-1 border rounded"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => handleColorChange(field, e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Configurações Completas do Tema</h1>
      </div>

      <Tabs defaultValue="brand" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="brand">Cores Marca</TabsTrigger>
          <TabsTrigger value="light" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Modo Light
          </TabsTrigger>
          <TabsTrigger value="dark" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Modo Dark
          </TabsTrigger>
          <TabsTrigger value="sidebar" className="flex items-center gap-2">
            <Sidebar className="h-4 w-4" />
            Sidebar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cores da Marca</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <ColorInput label="Navy Principal" field="brand_navy" value={settings.brand_navy} />
              <ColorInput label="Dourado" field="brand_gold" value={settings.brand_gold} />
              <ColorInput label="Rosa" field="brand_pink" value={settings.brand_pink} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="light" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cores Base - Light</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorInput label="Fundo" field="background_light" value={settings.background_light} />
                <ColorInput label="Texto Principal" field="foreground_light" value={settings.foreground_light} />
                <ColorInput label="Card Fundo" field="card_light" value={settings.card_light} />
                <ColorInput label="Card Texto" field="card_foreground_light" value={settings.card_foreground_light} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cores de Ação - Light</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorInput label="Primária" field="primary_light" value={settings.primary_light} />
                <ColorInput label="Primária Texto" field="primary_foreground_light" value={settings.primary_foreground_light} />
                <ColorInput label="Secundária" field="secondary_light" value={settings.secondary_light} />
                <ColorInput label="Secundária Texto" field="secondary_foreground_light" value={settings.secondary_foreground_light} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cores de UI - Light</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorInput label="Destaque" field="accent_light" value={settings.accent_light} />
                <ColorInput label="Destaque Texto" field="accent_foreground_light" value={settings.accent_foreground_light} />
                <ColorInput label="Silenciado" field="muted_light" value={settings.muted_light} />
                <ColorInput label="Silenciado Texto" field="muted_foreground_light" value={settings.muted_foreground_light} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cores de Sistema - Light</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorInput label="Borda" field="border_light" value={settings.border_light} />
                <ColorInput label="Input" field="input_light" value={settings.input_light} />
                <ColorInput label="Ring (Focus)" field="ring_light" value={settings.ring_light} />
                <ColorInput label="Destrutivo" field="destructive_light" value={settings.destructive_light} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dark" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cores Base - Dark</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorInput label="Fundo" field="background_dark" value={settings.background_dark} />
                <ColorInput label="Texto Principal" field="foreground_dark" value={settings.foreground_dark} />
                <ColorInput label="Card Fundo" field="card_dark" value={settings.card_dark} />
                <ColorInput label="Card Texto" field="card_foreground_dark" value={settings.card_foreground_dark} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cores de Ação - Dark</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorInput label="Primária" field="primary_dark" value={settings.primary_dark} />
                <ColorInput label="Primária Texto" field="primary_foreground_dark" value={settings.primary_foreground_dark} />
                <ColorInput label="Secundária" field="secondary_dark" value={settings.secondary_dark} />
                <ColorInput label="Secundária Texto" field="secondary_foreground_dark" value={settings.secondary_foreground_dark} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cores de UI - Dark</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorInput label="Destaque" field="accent_dark" value={settings.accent_dark} />
                <ColorInput label="Destaque Texto" field="accent_foreground_dark" value={settings.accent_foreground_dark} />
                <ColorInput label="Silenciado" field="muted_dark" value={settings.muted_dark} />
                <ColorInput label="Silenciado Texto" field="muted_foreground_dark" value={settings.muted_foreground_dark} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cores de Sistema - Dark</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorInput label="Borda" field="border_dark" value={settings.border_dark} />
                <ColorInput label="Input" field="input_dark" value={settings.input_dark} />
                <ColorInput label="Ring (Focus)" field="ring_dark" value={settings.ring_dark} />
                <ColorInput label="Destrutivo" field="destructive_dark" value={settings.destructive_dark} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sidebar" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sidebar - Light</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorInput label="Fundo Sidebar" field="sidebar_background_light" value={settings.sidebar_background_light} />
                <ColorInput label="Texto Sidebar" field="sidebar_foreground_light" value={settings.sidebar_foreground_light} />
                <ColorInput label="Primária Sidebar" field="sidebar_primary_light" value={settings.sidebar_primary_light} />
                <ColorInput label="Primária Texto Sidebar" field="sidebar_primary_foreground_light" value={settings.sidebar_primary_foreground_light} />
                <ColorInput label="Destaque Sidebar" field="sidebar_accent_light" value={settings.sidebar_accent_light} />
                <ColorInput label="Destaque Texto Sidebar" field="sidebar_accent_foreground_light" value={settings.sidebar_accent_foreground_light} />
                <ColorInput label="Borda Sidebar" field="sidebar_border_light" value={settings.sidebar_border_light} />
                <ColorInput label="Ring Sidebar" field="sidebar_ring_light" value={settings.sidebar_ring_light} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sidebar - Dark</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorInput label="Fundo Sidebar" field="sidebar_background_dark" value={settings.sidebar_background_dark} />
                <ColorInput label="Texto Sidebar" field="sidebar_foreground_dark" value={settings.sidebar_foreground_dark} />
                <ColorInput label="Primária Sidebar" field="sidebar_primary_dark" value={settings.sidebar_primary_dark} />
                <ColorInput label="Primária Texto Sidebar" field="sidebar_primary_foreground_dark" value={settings.sidebar_primary_foreground_dark} />
                <ColorInput label="Destaque Sidebar" field="sidebar_accent_dark" value={settings.sidebar_accent_dark} />
                <ColorInput label="Destaque Texto Sidebar" field="sidebar_accent_foreground_dark" value={settings.sidebar_accent_foreground_dark} />
                <ColorInput label="Borda Sidebar" field="sidebar_border_dark" value={settings.sidebar_border_dark} />
                <ColorInput label="Ring Sidebar" field="sidebar_ring_dark" value={settings.sidebar_ring_dark} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full md:w-auto"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Salvando..." : "Salvar Todas as Configurações"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}