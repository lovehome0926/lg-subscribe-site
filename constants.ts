
import { Product } from './types';

// 强制更新版本号。如果修改了下方的 INITIAL_PRODUCTS，请将此数字加 1，以强制所有用户更新缓存。
export const DATA_VERSION = 3; 

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
    officialUrl: 'https://www.lg.com/my/air-conditioners/dualcool-premium-inverter-air-conditioner/',
    variants: [
      { name: 'Classic White', image: 'https://www.lg.com/content/dam/channel/wcms/my/images/air-conditioners/v10api_answ_e_my_c/gallery/dz-01.jpg', colorCode: '#ffffff', modelId: 'AC-V13ENS-W' }
    ],
    promoPrice: 45,
    normalPrice: 65,
    promoText: 'New Launch Promo',
    warranty: '10-year compressor warranty',
    features: [
      { en: 'Faster Cooling', cn: '极速制冷', ms: 'Penyejukan Lebih Pantas' },
      { en: 'Energy Saving', cn: '节省能源', ms: 'Penjimatan Tenaga' },
      { en: 'Ionizer Air Purification', cn: '负离子空气净化', ms: 'Pembersihan Udara Ionizer' },
      { en: 'ThinQ™ App Control', cn: 'ThinQ™ 手机智能控制', ms: 'Kawalan App ThinQ™' }
    ],
    painPoints: [
      { en: 'High electricity bills', cn: '昂贵的电费', ms: 'Bil elektrik tinggi' },
      { en: 'Unclean air circulation', cn: '空气循环不卫生', ms: 'Peredaran udara tidak bersih' }
    ],
    hpOptions: [
      { value: '1.0', modelId: 'AC-V10ENS' },
      { value: '1.5', modelId: 'AC-V13ENS' },
      { value: '2.0', modelId: 'AC-V18ENS' },
      { value: '2.5', modelId: 'AC-V24ENS' }
    ],
    plans: [
      { termYears: 7, maintenanceType: 'Regular Visit', serviceInterval: '6m', price: 45 },
      { termYears: 7, maintenanceType: 'Regular Visit', serviceInterval: '12m', price: 35 },
      { termYears: 5, maintenanceType: 'Regular Visit', serviceInterval: '6m', price: 55 },
      { termYears: 5, maintenanceType: 'Regular Visit', serviceInterval: '12m', price: 45 },
      { termYears: 'Outright', maintenanceType: 'None', price: 2499 }
    ]
  },
  {
    id: 'REF-GR-B247',
    category: 'Refrigerator',
    name: 'Side-by-Side Inverter Refrigerator',
    subName: {
      en: 'Large Capacity with Door-in-Door™',
      cn: '大容量对开门冰箱 (门中门技术)',
      ms: 'Kapasiti Besar dengan Door-in-Door™'
    },
    description: 'Keep food fresh longer with LG Inverter Linear Compressor.',
    image: 'https://www.lg.com/content/dam/channel/wcms/my/images/refrigerators/gr-b247sluv_asbp_e_my_c/gallery/dz-01.jpg',
    officialUrl: 'https://www.lg.com/my/refrigerators/gr-b247sluv/',
    variants: [
      { name: 'Platinum Silver', image: 'https://www.lg.com/content/dam/channel/wcms/my/images/refrigerators/gr-gr-b247sluv_asbp_e_my_c/gallery/dz-01.jpg', colorCode: '#c0c0c0', modelId: 'REF-GR-S' }
    ],
    promoPrice: 150,
    normalPrice: 200,
    promoText: 'Exclusive 5Y Subscription',
    warranty: '10-year compressor warranty',
    features: [
      { en: 'Linear Cooling™', cn: '线性制冷技术', ms: 'Linear Cooling™' },
      { en: 'Door Cooling+™', cn: '门控制冷+', ms: 'Door Cooling+™' },
      { en: 'Hygiene Fresh+™', cn: '强效抗菌过滤', ms: 'Hygiene Fresh+™' },
      { en: 'ThinQ™ Smart Control', cn: '智能手机控制', ms: 'Kawalan Pintar ThinQ™' }
    ],
    painPoints: [
      { en: 'Food spoiling fast', cn: '食物容易变质', ms: 'Makanan cepat rosak' },
      { en: 'Bad odors in fridge', cn: '冰箱异味重', ms: 'Bau busuk dalam peti sejuk' }
    ],
    plans: [
      { termYears: 5, maintenanceType: 'Regular Visit', serviceInterval: '12m', price: 150 },
      { termYears: 5, maintenanceType: 'Regular Visit', serviceInterval: '24m', price: 130 },
      { termYears: 'Outright', maintenanceType: 'None', price: 4999 }
    ]
  }
];

export const CATEGORIES: string[] = [
  'Water Purifier', 'Air Purifier', 'Air Conditioner', 'Washer & Dryer', 'Refrigerator', 'TV & Soundbar'
];
