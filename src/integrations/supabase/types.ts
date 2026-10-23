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
          variant_id: string | null
          variant_name: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price_at_time: number
          product_id?: string | null
          variant_id?: string | null
          variant_name?: string | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price_at_time?: number
          product_id?: string | null
          variant_id?: string | null
          variant_name?: string | null
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
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
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
          order_number: string | null
          order_source: string
          discount_code_id: string | null
          payment_status: string
          payment_method: string
          payment_expires_at: string | null
          payment_resume_token: string | null
          payment_resume_token_expires_at: string | null
          inventory_reserved: boolean
          coupon_use_reserved: boolean
          checkout_idempotency_key: string | null
          utr_number: string | null
          payment_proof_path: string | null
          upi_submission_email_sent: boolean
          upi_received_email_sent: boolean
          shipping_address: string | null
          special_requirements: string | null
          status: string | null
          tracking_number: string | null
          total_amount: number
          subtotal_amount: number
          shipping_amount: number
          shipping_quote_amount: number | null
          shipping_quote_status: string
          shipping_quote_token: string | null
          shipping_utr: string | null
          gst_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          order_number?: string | null
          order_source?: string
          discount_code_id?: string | null
          payment_status?: string
          payment_method?: string
          payment_expires_at?: string | null
          payment_resume_token?: string | null
          payment_resume_token_expires_at?: string | null
          inventory_reserved?: boolean
          coupon_use_reserved?: boolean
          checkout_idempotency_key?: string | null
          utr_number?: string | null
          payment_proof_path?: string | null
          upi_submission_email_sent?: boolean
          upi_received_email_sent?: boolean
          shipping_address?: string | null
          special_requirements?: string | null
          status?: string | null
          tracking_number?: string | null
          total_amount: number
          subtotal_amount?: number
          shipping_amount?: number
          shipping_quote_amount?: number | null
          shipping_quote_status?: string
          shipping_quote_token?: string | null
          shipping_utr?: string | null
          gst_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          order_number?: string | null
          order_source?: string
          discount_code_id?: string | null
          payment_status?: string
          payment_method?: string
          payment_expires_at?: string | null
          payment_resume_token?: string | null
          payment_resume_token_expires_at?: string | null
          inventory_reserved?: boolean
          coupon_use_reserved?: boolean
          checkout_idempotency_key?: string | null
          utr_number?: string | null
          payment_proof_path?: string | null
          upi_submission_email_sent?: boolean
          upi_received_email_sent?: boolean
          shipping_address?: string | null
          special_requirements?: string | null
          status?: string | null
          tracking_number?: string | null
          total_amount?: number
          subtotal_amount?: number
          shipping_amount?: number
          shipping_quote_amount?: number | null
          shipping_quote_status?: string
          shipping_quote_token?: string | null
          shipping_utr?: string | null
          gst_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          id: string
          code: string
          type: string
          value: number
          min_order_amount: number | null
          max_uses: number | null
          uses_count: number | null
          expires_at: string | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          code: string
          type: string
          value: number
          min_order_amount?: number | null
          max_uses?: number | null
          uses_count?: number | null
          expires_at?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          type?: string
          value?: number
          min_order_amount?: number | null
          max_uses?: number | null
          uses_count?: number | null
          expires_at?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      custom_order_inquiries: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          inquiry_type: "custom" | "bulk" | "wholesale" | "other"
          description: string
          quantity_estimate: number | null
          budget_range: string | null
          status: "new" | "contacted" | "quoted" | "ordered"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          inquiry_type: "custom" | "bulk" | "wholesale" | "other"
          description: string
          quantity_estimate?: number | null
          budget_range?: string | null
          status?: "new" | "contacted" | "quoted" | "ordered"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          inquiry_type?: "custom" | "bulk" | "wholesale" | "other"
          description?: string
          quantity_estimate?: number | null
          budget_range?: string | null
          status?: "new" | "contacted" | "quoted" | "ordered"
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string | null
          is_active?: boolean | null
        }
        Relationships: []
      }
      products: {
        Row: {
          average_rating: number | null
          category: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          full_description: string | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          metadata: Json
          name: string
          price: number
          review_count: number | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string
          sku: string | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          metadata?: Json
          name: string
          price: number
          review_count?: number | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          metadata?: Json
          name?: string
          price?: number
          review_count?: number | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          id: string
          site_name: string | null
          site_description: string | null
          default_og_image: string | null
          canonical_base_url: string
          instagram_handle: string | null
          facebook_url: string | null
          twitter_handle: string | null
          google_analytics_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          site_name?: string | null
          site_description?: string | null
          default_og_image?: string | null
          canonical_base_url?: string
          instagram_handle?: string | null
          facebook_url?: string | null
          twitter_handle?: string | null
          google_analytics_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          site_name?: string | null
          site_description?: string | null
          default_og_image?: string | null
          canonical_base_url?: string
          instagram_handle?: string | null
          facebook_url?: string | null
          twitter_handle?: string | null
          google_analytics_id?: string | null
          created_at?: string | null
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
      create_checkout_order: {
        Args: {
          p_idempotency_key: string
          p_items: Json
          p_customer_name: string
          p_customer_email: string
          p_customer_phone: string | null
          p_shipping_address: string
          p_special_requirements?: string | null
          p_coupon_code?: string | null
          p_payment_method?: string
        }
        Returns: Array<{
          id: string
          order_number: string
          total_amount: number
          subtotal_amount: number
          shipping_amount: number
          gst_amount: number
          payment_status: string
          payment_expires_at: string | null
        }>
      }
      get_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: Array<{
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          country: string | null
          created_at: string | null
          last_sign_in_at: string | null
        }>
      }
      delete_user_by_admin: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      admin_delete_pending_order: {
        Args: { p_order_id: string }
        Returns: boolean
      }
      admin_update_pending_order: {
        Args: {
          p_order_id: string
          p_guest_name: string
          p_guest_email: string
          p_guest_phone: string | null
          p_shipping_address: string
          p_special_requirements: string | null
          p_shipping_amount: number
          p_gst_amount: number
          p_discount_amount: number
          p_items: Json
        }
        Returns: boolean
      }
      increment_coupon_uses: {
        Args: {
          code_id: string
        }
        Returns: undefined
      }
      decrement_stock: {
        Args: {
          product_id: string
          qty: number
        }
        Returns: undefined
      }
      submit_upi_payment_utr: {
        Args: {
          p_order_id: string
          p_utr: string
          p_guest_email?: string | null
          p_proof_path?: string | null
          p_resume_token?: string | null
        }
        Returns: boolean
      }
      mark_manual_upi_payment_received: {
        Args: {
          p_order_id: string
          p_bank_utr: string
        }
        Returns: boolean
      }
      expire_pending_upi_order: {
        Args: { p_order_id: string; p_guest_email?: string | null; p_resume_token?: string | null }
        Returns: boolean
      }
      resume_pending_upi_order: {
        Args: { p_order_id: string; p_resume_token: string }
        Returns: Array<{ id: string; order_number: string | null; amount: number; customer_email: string | null; customer_name: string | null; created_at: string; payment_expires_at: string | null }>
      }
      get_pending_upi_order_state: {
        Args: { p_order_id: string; p_guest_email?: string | null; p_resume_token?: string | null }
        Returns: Array<{ payment_status: string; payment_expires_at: string | null }>
      }
      cancel_pending_upi_order: {
        Args: { p_order_id: string; p_guest_email?: string | null; p_resume_token?: string | null }
        Returns: boolean
      }
      admin_cancel_pending_upi_order: {
        Args: { p_order_id: string }
        Returns: boolean
      }
      mark_cod_payment_received: {
        Args: { p_order_id: string }
        Returns: boolean
      }
      respond_shipping_quote: { Args: { p_order_id: string; p_token: string; p_approve: boolean }; Returns: boolean }
      get_shipping_quote: { Args: { p_order_id: string; p_token: string }; Returns: Array<{ order_number: string | null; shipping_quote_amount: number; shipping_quote_status: string; payment_method: string }> }
      submit_shipping_quote_payment: { Args: { p_order_id: string; p_token: string; p_utr: string }; Returns: boolean }
      admin_mark_shipping_received: { Args: { p_order_id: string; p_bank_utr: string }; Returns: boolean }
      reserve_checkout_order: {
        Args: { p_order_id: string; p_guest_email?: string | null }
        Returns: boolean
      }
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
