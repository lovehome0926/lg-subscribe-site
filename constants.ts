import { Product, SiteSettings } from './types';

export const DATA_VERSION = 5;

export const CATEGORIES = [
  'Water Purifier', 'Air Purifier', 'Air Conditioner', 'Washer & Dryer', 'Refrigerator', 'TV & Soundbar'
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  joinUsTagline: { 
    en: 'Stability Matters.', 
    cn: '只要您稳定，我们给的更多。', 
    ms: 'Kestabilan Penting.' 
  },
  joinUsBenefits: [],
  joinUsPainPoints: [],
  stores: [
    { 
      id: 'S1', 
      name: 'LG Brand Shop - Kuala Lumpur', 
      address: 'Lot 10, Bukit Bintang, KL', 
      googleMapsUrl: 'https://maps.google.com', 
      image: null 
    }
  ],
  promoTemplates: [],
  officeEmail: 'support@lg-subscribe.com.my',
  recruitmentWa: '60177473787',
  featuredProductIds: [],
  socialLinks: {
    fb: 'https://facebook.com',
    ig: 'https://instagram.com',
    tiktok: 'https://tiktok.com'
  }
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'AC-V13ENS',
    category: 'Air Conditioner',
    name: 'DUALCOOL™ Premium',
    subName: {
      en: 'Inverter Air Conditioner with Ionizer',
      cn: '双变频冷气机 (含负离子净化)',
      ms: 'Penyaman Udara Inverter dengan Ionizer'
    },
    description: 'Energy saving with faster cooling and ionizer for cleaner air.',
    image: 'https://www.lg.com/content/dam/channel/wcms/my/images/air-conditioners/v10api_answ_e_my_c/gallery/dz-01.jpg',
    promoPrice: 45,
    normalPrice: 65,
    promoText: 'New Launch Promo',
    warranty: '10-year compressor warranty',
    features: [
      { en: 'Faster Cooling', cn: '极速制冷', ms: 'Penyejukan Lebih Pantas' },
      { en: 'Energy Saving', cn: '节省能源', ms: 'Penjimatan Tenaga' }
    ],
    painPoints: [
      { en: 'High electricity bills', cn: '昂贵的电费', ms: 'Bil elektrik tinggi' }
    ],
    plans: [
      { termYears: 7, maintenanceType: 'Regular Visit', serviceInterval: '6m', price: 45 },
      { termYears: 'Outright', maintenanceType: 'None', price: 2499 }
    ]
  },
  {
    id: 'REF-GR-B247',
    category: 'Refrigerator',
    name: 'Side-by-Side Refrigerator',
    subName: {
      en: 'Large Capacity with Door-in-Door™',
      cn: '大容量对开门冰箱 (门中门技术)',
      ms: 'Kapasiti Besar dengan Door-in-Door™'
    },
    description: 'Keep food fresh longer with LG Inverter Linear Compressor.',
    image: 'https://www.lg.com/content/dam/channel/wcms/my/images/refrigerators/gr-b247sluv_asbp_e_my_c/gallery/dz-01.jpg',
    promoPrice: 150,
    normalPrice: 200,
    promoText: 'Exclusive Promo',
    warranty: '10-year compressor warranty',
    features: [
      { en: 'Linear Cooling™', cn: '线性制冷技术', ms: 'Linear Cooling™' }
    ],
    painPoints: [
      { en: 'Food spoiling fast', cn: '食物容易变质', ms: 'Makanan cepat rosak' }
    ],
    plans: [
      { termYears: 5, maintenanceType: 'Regular Visit', serviceInterval: '12m', price: 150 },
      { termYears: 'Outright', maintenanceType: 'None', price: 4999 }
    ]
  }
];