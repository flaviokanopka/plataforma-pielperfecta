export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ao_clientes: {
        Row: {
          created_at: string | null
          finalizado: boolean | null
          follow1: boolean | null
          follow2: boolean | null
          follow3: boolean | null
          follow4: boolean | null
          id_card: string | null
          name: string | null
          numero: string
          updated_at: string | null
          whastapp: string | null
        }
        Insert: {
          created_at?: string | null
          finalizado?: boolean | null
          follow1?: boolean | null
          follow2?: boolean | null
          follow3?: boolean | null
          follow4?: boolean | null
          id_card?: string | null
          name?: string | null
          numero: string
          updated_at?: string | null
          whastapp?: string | null
        }
        Update: {
          created_at?: string | null
          finalizado?: boolean | null
          follow1?: boolean | null
          follow2?: boolean | null
          follow3?: boolean | null
          follow4?: boolean | null
          id_card?: string | null
          name?: string | null
          numero?: string
          updated_at?: string | null
          whastapp?: string | null
        }
        Relationships: []
      }
      cerebro: {
        Row: {
          id: number
          prompt: string
        }
        Insert: {
          id?: number
          prompt: string
        }
        Update: {
          id?: number
          prompt?: string
        }
        Relationships: []
      }
      crm_card_tags: {
        Row: {
          card_id: string
          created_at: string | null
          id: string
          tag_id: string
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string | null
          id?: string
          tag_id: string
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string | null
          id?: string
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_card_tags_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "crm_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_card_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_cards: {
        Row: {
          coluna_id: string
          created_at: string | null
          data_visita: string | null
          id: string
          nome: string
          tag_id: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coluna_id: string
          created_at?: string | null
          data_visita?: string | null
          id?: string
          nome: string
          tag_id?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coluna_id?: string
          created_at?: string | null
          data_visita?: string | null
          id?: string
          nome?: string
          tag_id?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_cards_coluna_id_fkey"
            columns: ["coluna_id"]
            isOneToOne: false
            referencedRelation: "crm_colunas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_cards_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_colunas: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          ordem: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          ordem?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      follow_ups: {
        Row: {
          ativo: boolean
          created_at: string
          delay_unit: string
          delay_value: number
          id: string
          idx: number
          mensagem: string
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          delay_unit?: string
          delay_value?: number
          id?: string
          idx: number
          mensagem: string
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          delay_unit?: string
          delay_value?: number
          id?: string
          idx?: number
          mensagem?: string
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memoria_chat: {
        Row: {
          created_at: string | null
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      modelos_motos: {
        Row: {
          created_at: string
          id: number
          informações: string | null
          link: string | null
          nome: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          informações?: string | null
          link?: string | null
          nome?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          informações?: string | null
          link?: string | null
          nome?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          cor: string
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cor?: string
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cor?: string
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          accent_color: string
          accent_dark: string | null
          accent_foreground_dark: string | null
          accent_foreground_light: string | null
          accent_light: string | null
          background_dark: string
          background_light: string
          border_dark: string | null
          border_light: string | null
          brand_gold: string | null
          brand_navy: string | null
          brand_pink: string | null
          card_dark: string | null
          card_foreground_dark: string | null
          card_foreground_light: string | null
          card_light: string | null
          created_at: string
          destructive_dark: string | null
          destructive_foreground_dark: string | null
          destructive_foreground_light: string | null
          destructive_light: string | null
          foreground_dark: string | null
          foreground_light: string | null
          id: string
          input_dark: string | null
          input_light: string | null
          muted_dark: string | null
          muted_foreground_dark: string | null
          muted_foreground_light: string | null
          muted_light: string | null
          popover_dark: string | null
          popover_foreground_dark: string | null
          popover_foreground_light: string | null
          popover_light: string | null
          primary_color: string
          primary_dark: string | null
          primary_foreground_dark: string | null
          primary_foreground_light: string | null
          primary_light: string | null
          ring_dark: string | null
          ring_light: string | null
          secondary_color: string
          secondary_dark: string | null
          secondary_foreground_dark: string | null
          secondary_foreground_light: string | null
          secondary_light: string | null
          sidebar_accent_dark: string | null
          sidebar_accent_foreground_dark: string | null
          sidebar_accent_foreground_light: string | null
          sidebar_accent_light: string | null
          sidebar_background_dark: string | null
          sidebar_background_light: string | null
          sidebar_border_dark: string | null
          sidebar_border_light: string | null
          sidebar_foreground_dark: string | null
          sidebar_foreground_light: string | null
          sidebar_primary_dark: string | null
          sidebar_primary_foreground_dark: string | null
          sidebar_primary_foreground_light: string | null
          sidebar_primary_light: string | null
          sidebar_ring_dark: string | null
          sidebar_ring_light: string | null
          text_dark: string
          text_light: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string
          accent_dark?: string | null
          accent_foreground_dark?: string | null
          accent_foreground_light?: string | null
          accent_light?: string | null
          background_dark?: string
          background_light?: string
          border_dark?: string | null
          border_light?: string | null
          brand_gold?: string | null
          brand_navy?: string | null
          brand_pink?: string | null
          card_dark?: string | null
          card_foreground_dark?: string | null
          card_foreground_light?: string | null
          card_light?: string | null
          created_at?: string
          destructive_dark?: string | null
          destructive_foreground_dark?: string | null
          destructive_foreground_light?: string | null
          destructive_light?: string | null
          foreground_dark?: string | null
          foreground_light?: string | null
          id?: string
          input_dark?: string | null
          input_light?: string | null
          muted_dark?: string | null
          muted_foreground_dark?: string | null
          muted_foreground_light?: string | null
          muted_light?: string | null
          popover_dark?: string | null
          popover_foreground_dark?: string | null
          popover_foreground_light?: string | null
          popover_light?: string | null
          primary_color?: string
          primary_dark?: string | null
          primary_foreground_dark?: string | null
          primary_foreground_light?: string | null
          primary_light?: string | null
          ring_dark?: string | null
          ring_light?: string | null
          secondary_color?: string
          secondary_dark?: string | null
          secondary_foreground_dark?: string | null
          secondary_foreground_light?: string | null
          secondary_light?: string | null
          sidebar_accent_dark?: string | null
          sidebar_accent_foreground_dark?: string | null
          sidebar_accent_foreground_light?: string | null
          sidebar_accent_light?: string | null
          sidebar_background_dark?: string | null
          sidebar_background_light?: string | null
          sidebar_border_dark?: string | null
          sidebar_border_light?: string | null
          sidebar_foreground_dark?: string | null
          sidebar_foreground_light?: string | null
          sidebar_primary_dark?: string | null
          sidebar_primary_foreground_dark?: string | null
          sidebar_primary_foreground_light?: string | null
          sidebar_primary_light?: string | null
          sidebar_ring_dark?: string | null
          sidebar_ring_light?: string | null
          text_dark?: string
          text_light?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string
          accent_dark?: string | null
          accent_foreground_dark?: string | null
          accent_foreground_light?: string | null
          accent_light?: string | null
          background_dark?: string
          background_light?: string
          border_dark?: string | null
          border_light?: string | null
          brand_gold?: string | null
          brand_navy?: string | null
          brand_pink?: string | null
          card_dark?: string | null
          card_foreground_dark?: string | null
          card_foreground_light?: string | null
          card_light?: string | null
          created_at?: string
          destructive_dark?: string | null
          destructive_foreground_dark?: string | null
          destructive_foreground_light?: string | null
          destructive_light?: string | null
          foreground_dark?: string | null
          foreground_light?: string | null
          id?: string
          input_dark?: string | null
          input_light?: string | null
          muted_dark?: string | null
          muted_foreground_dark?: string | null
          muted_foreground_light?: string | null
          muted_light?: string | null
          popover_dark?: string | null
          popover_foreground_dark?: string | null
          popover_foreground_light?: string | null
          popover_light?: string | null
          primary_color?: string
          primary_dark?: string | null
          primary_foreground_dark?: string | null
          primary_foreground_light?: string | null
          primary_light?: string | null
          ring_dark?: string | null
          ring_light?: string | null
          secondary_color?: string
          secondary_dark?: string | null
          secondary_foreground_dark?: string | null
          secondary_foreground_light?: string | null
          secondary_light?: string | null
          sidebar_accent_dark?: string | null
          sidebar_accent_foreground_dark?: string | null
          sidebar_accent_foreground_light?: string | null
          sidebar_accent_light?: string | null
          sidebar_background_dark?: string | null
          sidebar_background_light?: string | null
          sidebar_border_dark?: string | null
          sidebar_border_light?: string | null
          sidebar_foreground_dark?: string | null
          sidebar_foreground_light?: string | null
          sidebar_primary_dark?: string | null
          sidebar_primary_foreground_dark?: string | null
          sidebar_primary_foreground_light?: string | null
          sidebar_primary_light?: string | null
          sidebar_ring_dark?: string | null
          sidebar_ring_light?: string | null
          text_dark?: string
          text_light?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ultraintelligent: {
        Row: {
          id: number
          remotejid: string
        }
        Insert: {
          id?: number
          remotejid: string
        }
        Update: {
          id?: number
          remotejid?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
