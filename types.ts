
export enum AppView {
  LANDING = 'landing',
  DASHBOARD = 'dashboard', // 现在是代理/后台管理入口
  CATALOG = 'catalog',
  CONTACT = 'contact'
}

export type PromoType = 'none' | 'half_price' | 'percentage' | 'fixed_discount' | 'fixed_price';

export interface Promotion {
  type: PromoType;
  value: number; // 比如 88 代表 88% 优惠，或 50 代表 50% 
  months?: number; // 持续月数
  endDate?: string; // 截止日期
}

export interface ProductPlan {
  name: string; // 比如 "7 Years Self-Service"
  monthlyPrice: number;
}

export interface Product {
  id: string;
  name: string;
  modelCode: string;
  category: string;
  outrightPrice: number;
  plans: ProductPlan[];
  imageUrl: string;
  description: string;
  isNew?: boolean;
  promo?: Promotion;
}

export interface AppConfig {
  logoUrl: string;
  heroImageUrl: string;
  contactWhatsapp: string;
  contactEmail: string;
}

export interface AppData {
  products: Product[];
  config: AppConfig;
}
