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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blogs: {
        Row: {
          author_name: string | null
          content: string
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          gallery_image_urls: string[] | null
          id: string
          is_published: boolean | null
          published_at: string | null
          reading_time: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_name?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          gallery_image_urls?: string[] | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_name?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          gallery_image_urls?: string[] | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gift_options: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string
          icon: string | null
          image_url: string | null
          is_active: boolean
          sort_order: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: string
          icon?: string | null
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string
          icon?: string | null
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_gift_details: {
        Row: {
          id: string
          order_id: string
          gift_wrap_option_id: string | null
          gift_message: string | null
          gift_recipient_name: string | null
          gift_recipient_email: string | null
          gift_recipient_phone: string | null
          hide_prices: boolean
          selected_card_design: string | null
          total_gift_cost: number
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          gift_wrap_option_id?: string | null
          gift_message?: string | null
          gift_recipient_name?: string | null
          gift_recipient_email?: string | null
          gift_recipient_phone?: string | null
          hide_prices?: boolean
          selected_card_design?: string | null
          total_gift_cost?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          gift_wrap_option_id?: string | null
          gift_message?: string | null
          gift_recipient_name?: string | null
          gift_recipient_email?: string | null
          gift_recipient_phone?: string | null
          hide_prices?: boolean
          selected_card_design?: string | null
          total_gift_cost?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_gift_details_gift_wrap_option_id_fkey"
            columns: ["gift_wrap_option_id"]
            isOneToOne: false
            referencedRelation: "gift_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_gift_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price_at_time: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price_at_time: number
          product_id?: string | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price_at_time?: number
          product_id?: string | null
          quantity?: number
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
          created_at: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          shipping_address: string | null
          special_requirements: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          shipping_address?: string | null
          special_requirements?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          shipping_address?: string | null
          special_requirements?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          name: string
          price: number
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_id: string | null
          rating: number
          title: string | null
          comment: string | null
          images: Json | null
          is_verified_purchase: boolean
          is_approved: boolean
          helpful_count: number
          not_helpful_count: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          order_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          images?: Json | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          not_helpful_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          order_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          images?: Json | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          not_helpful_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          sku: string | null
          price: number
          stock_quantity: number
          size: string | null
          scent: string | null
          color: string | null
          wick_type: string | null
          weight: string | null
          custom_engraving: string | null
          image_url: string | null
          is_default: boolean
          sort_order: number
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          sku?: string | null
          price: number
          stock_quantity?: number
          size?: string | null
          scent?: string | null
          color?: string | null
          wick_type?: string | null
          weight?: string | null
          custom_engraving?: string | null
          image_url?: string | null
          is_default?: boolean
          sort_order?: number
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          sku?: string | null
          price?: number
          stock_quantity?: number
          size?: string | null
          scent?: string | null
          color?: string | null
          wick_type?: string | null
          weight?: string | null
          custom_engraving?: string | null
          image_url?: string | null
          is_default?: boolean
          sort_order?: number
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          postal_code: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      review_votes: {
        Row: {
          id: string
          review_id: string
          user_id: string
          vote_type: string
          created_at: string | null
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          vote_type: string
          created_at?: string | null
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          vote_type?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "product_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          variant_id: string | null
          notes: string | null
          notify_on_sale: boolean
          notify_on_restock: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          variant_id?: string | null
          notes?: string | null
          notify_on_sale?: boolean
          notify_on_restock?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          variant_id?: string | null
          notes?: string | null
          notify_on_sale?: boolean
          notify_on_restock?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      category_performance: {
        Row: {
          category: string | null
          product_count: number | null
          total_units_sold: number | null
          total_revenue: number | null
          average_rating: number | null
        }
        Relationships: []
      }
      customer_analytics: {
        Row: {
          user_id: string | null
          total_orders: number | null
          lifetime_value: number | null
          average_order_value: number | null
          first_order_date: string | null
          last_order_date: string | null
          days_since_last_order: number | null
        }
        Relationships: []
      }
      product_performance: {
        Row: {
          id: string | null
          name: string | null
          category: string | null
          price: number | null
          stock_quantity: number | null
          total_sold: number | null
          total_revenue: number | null
          average_rating: number | null
          review_count: number | null
        }
        Relationships: []
      }
      sales_analytics: {
        Row: {
          date: string | null
          order_count: number | null
          revenue: number | null
          average_order_value: number | null
          unique_customers: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_purchased_product: {
        Args: {
          p_user_id: string
          p_product_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      set_verified_purchase: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_product_rating: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
