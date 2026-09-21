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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          show_in_app: boolean
          show_in_newsletter: boolean
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          show_in_app?: boolean
          show_in_newsletter?: boolean
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          show_in_app?: boolean
          show_in_newsletter?: boolean
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          show_in_app: boolean
          show_in_newsletter: boolean
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          show_in_app?: boolean
          show_in_newsletter?: boolean
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          show_in_app?: boolean
          show_in_newsletter?: boolean
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      newsletter_settings: {
        Row: {
          id: boolean
          settings: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: boolean
          settings?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: boolean
          settings?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          storage_label: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          storage_label?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          storage_label?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "vw_orders_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string
          customer_notes: string | null
          delivered_at: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_fee: number
          delivery_notes: string | null
          delivery_phone: string | null
          discount: number
          fulfillment_type: Database["public"]["Enums"]["order_fulfillment_type"]
          id: string
          order_number: string
          payment_method: Database["public"]["Enums"]["order_payment_method"]
          payment_status: Database["public"]["Enums"]["order_payment_status"]
          reject_reason: string | null
          rejected_at: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_notes?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_fee?: number
          delivery_notes?: string | null
          delivery_phone?: string | null
          discount?: number
          fulfillment_type?: Database["public"]["Enums"]["order_fulfillment_type"]
          id?: string
          order_number: string
          payment_method?: Database["public"]["Enums"]["order_payment_method"]
          payment_status?: Database["public"]["Enums"]["order_payment_status"]
          reject_reason?: string | null
          rejected_at?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_notes?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_fee?: number
          delivery_notes?: string | null
          delivery_phone?: string | null
          discount?: number
          fulfillment_type?: Database["public"]["Enums"]["order_fulfillment_type"]
          id?: string
          order_number?: string
          payment_method?: Database["public"]["Enums"]["order_payment_method"]
          payment_status?: Database["public"]["Enums"]["order_payment_status"]
          reject_reason?: string | null
          rejected_at?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          brand_id: string
          category_id: string
          cost: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          imei: string | null
          material_id: string | null
          model: string | null
          name: string
          price: number
          quantity: number
          show_in_app: boolean
          show_in_newsletter: boolean
          status: Database["public"]["Enums"]["product_status"]
          storage_option_id: string | null
          updated_at: string
          updated_by: string | null
          wholesale_price: number
        }
        Insert: {
          barcode?: string | null
          brand_id: string
          category_id: string
          cost?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          imei?: string | null
          material_id?: string | null
          model?: string | null
          name: string
          price?: number
          quantity?: number
          show_in_app?: boolean
          show_in_newsletter?: boolean
          status?: Database["public"]["Enums"]["product_status"]
          storage_option_id?: string | null
          updated_at?: string
          updated_by?: string | null
          wholesale_price?: number
        }
        Update: {
          barcode?: string | null
          brand_id?: string
          category_id?: string
          cost?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          imei?: string | null
          material_id?: string | null
          model?: string | null
          name?: string
          price?: number
          quantity?: number
          show_in_app?: boolean
          show_in_newsletter?: boolean
          status?: Database["public"]["Enums"]["product_status"]
          storage_option_id?: string | null
          updated_at?: string
          updated_by?: string | null
          wholesale_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_storage_option_id_fkey"
            columns: ["storage_option_id"]
            isOneToOne: false
            referencedRelation: "storage_options"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          manager_name: string | null
          notes: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          shop_address: string | null
          shop_landline: string | null
          shop_name: string | null
          shop_phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          manager_name?: string | null
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          shop_address?: string | null
          shop_landline?: string | null
          shop_name?: string | null
          shop_phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          manager_name?: string | null
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          shop_address?: string | null
          shop_landline?: string | null
          shop_name?: string | null
          shop_phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      storage_options: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          label: string
          ram_gb: number
          storage_gb: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          label: string
          ram_gb: number
          storage_gb: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          label?: string
          ram_gb?: number
          storage_gb?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      upgrade_requests: {
        Row: {
          created_at: string
          id: string
          manager_name: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          shop_address: string
          shop_landline: string | null
          shop_name: string
          shop_phone: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          manager_name: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          shop_address: string
          shop_landline?: string | null
          shop_name: string
          shop_phone: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          manager_name?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          shop_address?: string
          shop_landline?: string | null
          shop_name?: string
          shop_phone?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      vw_orders_summary: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_by_name: string | null
          cancelled_by_type: string | null
          confirmed_at: string | null
          confirmed_by_name: string | null
          customer_name: string | null
          customer_notes: string | null
          customer_phone: string | null
          delivered_at: string | null
          delivered_by_name: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_fee_usd: number | null
          delivery_notes: string | null
          delivery_phone: string | null
          discount_usd: number | null
          exchange_rate: number | null
          fulfillment_type: string | null
          id: string | null
          items_count: number | null
          order_date: string | null
          order_number: string | null
          payment_method: string | null
          payment_status: string | null
          pos_name: string | null
          reject_reason: string | null
          rejected_at: string | null
          rejected_by_name: string | null
          staff_notes: string | null
          status: string | null
          subtotal_usd: number | null
          total_quantity: number | null
          total_syp: number | null
          total_usd: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_dashboard_stats: { Args: never; Returns: Json }
      get_product_price: { Args: { p_product_id: string }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      order_fulfillment_type: "pickup" | "delivery"
      order_payment_method: "cash" | "electronic"
      order_payment_status: "unpaid" | "paid"
      order_status:
        | "pending"
        | "confirmed"
        | "delivered"
        | "cancelled"
        | "rejected"
      product_status: "active" | "inactive" | "out_of_stock" | "discontinued"
      user_role: "admin" | "customer" | "wholesaler"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      order_fulfillment_type: ["pickup", "delivery"],
      order_payment_method: ["cash", "electronic"],
      order_payment_status: ["unpaid", "paid"],
      order_status: [
        "pending",
        "confirmed",
        "delivered",
        "cancelled",
        "rejected",
      ],
      product_status: ["active", "inactive", "out_of_stock", "discontinued"],
      user_role: ["admin", "customer", "wholesaler"],
    },
  },
} as const
