
export interface Multilingual {
  en: string;
  cn: string;
  ms: string;
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

export interface Product {
  id: string; 
  category: string;
  name: string;
  modelId?: string; // 主型号 ID
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
}

export type PromoType = 'percentage' | 'fixed_price' | 'fixed_discount';

export interface PromotionTemplate {
  id: string;
  type: PromoType;
  title: Multilingual;
  applicableProductIds: string[]; 
  durationMonths?: number;
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
  officeEmail: string;
  officePhone?: string; // 新增电话字段
  recruitmentWa: string;
  featuredProductIds: string[]; 
  categories: string[];
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
