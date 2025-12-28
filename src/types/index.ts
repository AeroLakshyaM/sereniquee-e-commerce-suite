export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string | null;
  price: number;
  category: string | null;
  stock_quantity: number;
  image_url: string | null;
  image_urls?: string[]; // Array of image URLs for multiple product photos
  featured: boolean;
  average_rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string | null;
  special_requirements: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price_at_time: number;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  gallery_image_urls: string[] | null;
  author_name: string | null;
  is_published: boolean | null;
  tags: string[] | null;
  reading_time: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  platform: string;
  image_url: string;
  post_url: string | null;
  caption: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// PRODUCT VARIANTS
// ============================================

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price: number;
  stock_quantity: number;
  size: string | null;
  scent: string | null;
  color: string | null;
  wick_type: string | null;
  weight: string | null;
  custom_engraving: string | null;
  image_url: string | null;
  is_default: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// GIFT OPTIONS
// ============================================

export interface GiftOption {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: 'wrap' | 'card' | 'box' | 'message' | null;
  icon: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface OrderGiftDetails {
  id: string;
  order_id: string;
  gift_wrap_option_id: string | null;
  gift_message: string | null;
  gift_recipient_name: string | null;
  gift_recipient_email: string | null;
  gift_recipient_phone: string | null;
  hide_prices: boolean;
  selected_card_design: string | null;
  total_gift_cost: number;
  created_at: string;
}

export interface GiftFormData {
  isGift: boolean;
  giftWrapOption: GiftOption | null;
  giftMessage: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  hidePrices: boolean;
  cardDesign: string;
}

// ============================================
// REVIEWS & RATINGS
// ============================================

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string | null;
  comment: string | null;
  images: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string | null;
    email: string | null;
  };
}

export interface ReviewVote {
  id: string;
  review_id: string;
  user_id: string;
  vote_type: 'helpful' | 'not_helpful';
  created_at: string;
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  images: File[];
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// ============================================
// WISHLIST
// ============================================

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  notes: string | null;
  notify_on_sale: boolean;
  notify_on_restock: boolean;
  created_at: string;
  product?: Product;
  variant?: ProductVariant;
}

// ============================================
// ANALYTICS
// ============================================

export interface SalesAnalytics {
  date: string;
  order_count: number;
  revenue: number;
  average_order_value: number;
  unique_customers: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  category: string | null;
  price: number;
  stock_quantity: number;
  average_rating: number | null;
  review_count: number | null;
  total_sold: number;
  total_revenue: number;
  order_count: number;
}

export interface CustomerAnalytics {
  user_id: string;
  total_orders: number;
  lifetime_value: number;
  average_order_value: number;
  first_order_date: string;
  last_order_date: string;
  days_since_last_order: number;
}

export interface CategoryPerformance {
  category: string;
  product_count: number;
  total_units_sold: number;
  total_revenue: number;
  average_rating: number;
}

export interface AnalyticsDashboardData {
  salesTrends: SalesAnalytics[];
  topProducts: ProductPerformance[];
  categoryPerformance: CategoryPerformance[];
  customerMetrics: {
    totalCustomers: number;
    activeCustomers: number;
    avgLifetimeValue: number;
    repeatCustomerRate: number;
  };
  conversionMetrics: {
    cartAbandonmentRate: number;
    conversionRate: number;
    avgOrderValue: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    monthlyRevenue: number;
    growthRate: number;
  };
}
