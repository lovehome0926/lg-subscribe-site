
export interface Multilingual {
  en: string;
  cn: string;
  ms: string;
}

export interface CategoryItem {
  id: string; 
  label: Multilingual; 
}

export interface ProductPlan {
  termYears: number | 'Outright';
  maintenanceType: 'Self Service' | 'Regular Visit' | 'Combined' | 'Combine Maintenance' | 'No Service' | 'None';
  serviceInterval: 'None' | '3m' | '4m' | '6m' | '12m' | '24m'; 
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
  label: Multilingual;
  value: string;
  modelId?: string; 
  rentalOffset?: number; 
  cashOffset?: number;   
}

export interface FlashSaleConfig {
  isActive: boolean;
  productId: string;
  launchDate: string; 
  quantity: number;
  title: Multilingual;
  description: Multilingual;
  directLink?: string;
  customWasPrice?: number; // 手动输入原价
  customPromoPrice?: number; // 手动输入优惠价
}

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  postcode: string;
  productId: string;
  agentToken?: string;
  timestamp: number;
}

export interface Product {
  id: string; 
  category: string; 
  name: string;
  modelId?: string; 
  subName: Multilingual;
  description: string;
  image: string;
  variants?: ProductVariant[]; 
  promoPrice: number; 
  normalPrice: number;
  promoText: string;
  warranty: string;
  outrightWarranty?: string; 
  features: Multilingual[];
  painPoints: Multilingual[];
  outrightPrice?: number;
  plans: ProductPlan[];
  officialUrl?: string;
  hpOptions?: HpOption[];
  isPromoActive?: boolean;
  isNew?: boolean;
  isHotSale?: boolean;
  isKlangValleyOnly?: boolean; 
  promoBadge?: Multilingual;
}

export interface Agent {
  id: string;
  name: string;
  whatsapp: string;
  token?: string; 
}

export type PromoType = 'percentage' | 'fixed_price' | 'fixed_discount';

export interface PromotionTemplate {
  id: string;
  type: PromoType;
  title: Multilingual;
  applicableProductIds: string[]; 
  durationMonths?: number; // Only for percentage
  value: number; 
  endDate: string;
  content: Multilingual;
  color?: 'cyan' | 'rose' | 'amber' | 'blue' | 'emerald';
}

export interface Store {
  id: string;
  name: string;
  address: string;
  googleMapsUrl: string;
  image: string | null;
}

export interface BenefitItem {
  number: string;
  title: Multilingual;
  description: Multilingual;
  image: string;
}

export interface SiteSettings {
  logoUrl?: string;
  heroImageUrl?: string;
  siteAddress?: string; 
  googleMapsUrl?: string; 
  siteDescription?: Multilingual;
  whatIsSection: {
    title: Multilingual;
    description: Multilingual;
  };
  benefits: BenefitItem[];
  heroTitle: Multilingual;
  heroSubtitle: Multilingual;
  joinUsTagline: Multilingual;
  joinUsBenefits: Multilingual[];
  joinUsPainPoints: Multilingual[];
  stores: Store[];
  promoTemplates: PromotionTemplate[];
  flashSale?: FlashSaleConfig; 
  officeEmail: string;
  officePhone?: string; 
  recruitmentWa: string;
  featuredProductIds: string[]; 
  categories: CategoryItem[]; 
  socialLinks: {
    fb: string;
    ig: string;
    tiktok: string;
  };
}

export enum AppRoute {
  HOME = 'home',
  ADMIN = 'admin',
  AGENT_TOOLS = 'agent-tools'
}

export type Language = 'en' | 'cn' | 'ms';
