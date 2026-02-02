
import { Product, AppConfig } from './types';

export const INITIAL_CONFIG: AppConfig = {
  logoUrl: 'https://www.lg.com/content/dam/lge/common/logo/logo-lg-100x44.png',
  heroImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
  contactWhatsapp: '60123456789',
  contactEmail: 'support@lg-subscribe.com'
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'wu525bs',
    name: 'PuriCare™ Water Purifier (Self-Service)',
    modelCode: 'WU525BS',
    category: 'Water Purifier',
    outrightPrice: 5200,
    plans: [
      { name: '7 Years Self-Service', monthlyPrice: 110 },
      { name: '5 Years Self-Service', monthlyPrice: 140 }
    ],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQALyz6MU6WQ2uSiWC7PTzGbYCmniaqBx2resT1lxsI10i02Fltkb3WAbtTcNZ-YOx-glI-7mzqtX6UGBhdN4XMwj-MPLOgHqfotKsW_eMfPtiNl3wN0WC4iZ8P_PeVIlfAB38SIBtLWXRQEFVxTlh7aBl7otbtGYYOr39hS1O6q9S1S3-cbYTOpR7S1rmag0zUZwPiI7j73K9Mo-M2ITFMtxl4_avQ6L3khsOJE6tSYZBs4oPDTTZan0pv2WnUpjPw8pTXnCm21ZO',
    description: 'A Water Purifier that Blends Seamlessly. Hot, Ambient, Cold.',
    isNew: true
  },
  {
    id: 'as10gdbyo',
    name: 'PuriCare™ Air Purifier Double Booster',
    modelCode: 'AS10GDBY0',
    category: 'Air Purifier',
    outrightPrice: 4600,
    plans: [
      { name: '7 Years Self-Service', monthlyPrice: 105 },
      { name: '5 Years Self-Service', monthlyPrice: 135 }
    ],
    imageUrl: 'https://picsum.photos/seed/air/600/600',
    description: 'Breathe Clean Air Everyday. 360 Purification, HEPA H13 Filter.',
    promo: { type: 'half_price', value: 50, months: 9 }
  },
  {
    id: 'oled77',
    name: 'LG OLED evo AI B5 77"',
    modelCode: 'OLED77B5PSA',
    category: 'TVs',
    outrightPrice: 15000,
    plans: [
      { name: '5 Years Plan', monthlyPrice: 560 }
    ],
    imageUrl: 'https://picsum.photos/seed/tv/600/600',
    description: 'World\'s No.1 OLED TV for 12 Years. α8 AI Processor 4K Gen 2.',
    isNew: true
  }
];

// Mock referral data for the Dashboard table
export const MOCK_REFERRALS = [
  { id: 1, campaign: 'FB Ad Group A', url: 'lg.com/ref/agent01', clicks: 120, conversions: 12, cr: 10 },
  { id: 2, campaign: 'Insta Story Promo', url: 'lg.com/ref/agent02', clicks: 450, conversions: 45, cr: 10 },
  { id: 3, campaign: 'WhatsApp Blast', url: 'lg.com/ref/agent03', clicks: 89, conversions: 22, cr: 24.7 },
  { id: 4, campaign: 'TikTok Review', url: 'lg.com/ref/agent04', clicks: 1200, conversions: 60, cr: 5 },
];

// Sales activity data for the Dashboard chart
export const SALES_CHART_DATA = [
  { month: 'Jan', referrals: 40 },
  { month: 'Feb', referrals: 30 },
  { month: 'Mar', referrals: 60 },
  { month: 'Apr', referrals: 45 },
  { month: 'May', referrals: 90 },
  { month: 'Jun', referrals: 75 },
];
