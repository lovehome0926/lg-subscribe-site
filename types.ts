
export interface Multilingual {
  en: string;
  cn: string;
  ms: string;
}

export interface ProductPlan {
  termYears: number | 'Outright';
  maintenanceType: 'Self Service' | 'Regular Visit' | 'Combined' | 'Combine Maintenance' | 'None';
  serviceInterval?: string; // e.g., '4m', '6m', '12m', '24m'
  price: number;
  promoText?: string;
}

export interface ProductVariant {
  name: string; 
  image: string; 
  colorCode?: string; 
  modelId?: string; 
}

export interface HpOption {
  value: string;
  modelId?: string; 
  rentalOffset?: number; 
  cashOffset?: number;   
}

export interface Product {
  id: string; 
  category: string;
  name: string;
  subName: Multilingual;
  description: string;
  image: string;
  variants?: ProductVariant[]; 
  promoPrice: number; 
  normalPrice: number;
  promoText: string;
  warranty: string;
  outrightWarranty?: string; // 新增：买断保修文本
  features: Multilingual[];
  painPoints: Multilingual[];
  outrightPrice?: number;
  plans: ProductPlan[];
  officialUrl?: string;
  hpOptions?: HpOption[];
  isPromoActive?: boolean;
  isNew?: boolean;
  isHotSale?: boolean;
  isKlangValleyOnly?: boolean; // 新增：地区限定
  promoBadge?: Multilingual;
  promoDiscountType?: 'percentage' | 'fixed_price';
  promoDiscountValue?: number; 
  promoDurationMonths?: number;
  promoEndDate?: string;
}

export interface Agent {
  id: string;
  name: string;
  whatsapp: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  googleMapsUrl: string;
  image: string | null;
}

export interface PromotionTemplate {
  id: string;
  name: string;
  discountType: 'fixed' | 'percentage' | 'direct'; 
  discountAmount: number;
  durationMonths: number | 'full';
  endDate?: string; 
  isActive: boolean;
  applyToAll: boolean;
  targetProductIds: string[];
  description?: string;
}

export interface SiteSettings {
  joinUsTagline: Multilingual;
  joinUsBenefits: Multilingual[];
  joinUsPainPoints: Multilingual[];
  stores: StoreLocation[];
  promoTemplates: PromotionTemplate[];
  officeEmail: string;
  contactPhone?: string;
  recruitmentWa: string;
  featuredProductIds: string[]; 
  socialLinks?: {
    fb?: string;
    ig?: string;
    tiktok?: string;
  };
}

export enum AppRoute {
  HOME = 'home',
  ADMIN = 'admin'
}

export type Language = 'en' | 'cn' | 'ms';
