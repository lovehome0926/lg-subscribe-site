
import { Product, SiteSettings, CategoryItem } from './types.ts';

export const DATA_VERSION = 19.0;

export const CATEGORIES: CategoryItem[] = [
  { id: 'Water Purifier', label: { en: 'Water Purifier', cn: '净水机', ms: 'Penapis Air' } },
  { id: 'Air Purifier', label: { en: 'Air Purifier', cn: '空气净化机', ms: 'Penapis Udara' } },
  { id: 'Air Conditioner', label: { en: 'Air Conditioner', cn: '空调', ms: 'Penyaman Udara' } },
  { id: 'Washer & Dryer', label: { en: 'Washer & Dryer', cn: '洗衣机与烘干机', ms: 'Mesin Basuh & Pengering' } },
  { id: 'Refrigerator', label: { en: 'Refrigerator', cn: '冰箱', ms: 'Peti Sejuk' } },
  { id: 'TV & Soundbar', label: { en: 'TV & Soundbar', cn: '电视与音响', ms: 'TV & Bar Bunyi' } },
  { id: 'Vacuum Cleaner', label: { en: 'Vacuum Cleaner', cn: '吸尘机', ms: 'Pembersih Vakum' } },
  { id: 'Styler', label: { en: 'Styler', cn: '蒸汽衣物护理柜', ms: 'Styler' } }
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  logoUrl: 'https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png',
  heroImageUrl: 'https://www.lg.com/content/dam/channel/wcms/my/images/air-conditioners/v10api_answ_e_my_c/gallery/dz-01.jpg',
  siteDescription: {
    en: 'Transforming the Malaysian home experience with flexible LG Subscribe™ technology.',
    cn: '通过灵活的 LG Subscribe™ 技术改变马来西亚的家居体验。',
    ms: 'Mengubah pengalaman kediaman Malaysia dengan teknologi LG Subscribe™.'
  },
  whatIsSection: {
    title: { en: 'What is LG Subscribe?', cn: '什么是 LG Subscribe？', ms: 'Apa itu LG Subscribe?' },
    description: {
      en: 'LG Subscribe is a household appliance subscription service that allows you to complete your home in a cost-effective way. A wide range of appliances from refrigerators to TVs are available, making your place truly feel like a home.',
      cn: 'LG Subscribe 是一项家电租赁服务，让您能以最经济的方式完善家居。从冰箱到电视机，全系列家电均可订阅，让您的房子更有家的感觉。',
      ms: 'LG Subscribe adalah perkhidmatan langganan perkakas rumah yang membolehkan anda melengkapkan rumah anda dengan cara yang jimat. Pelbagai pilihan dari peti sejuk hingga TV tersedia.'
    }
  },
  benefits: [
    {
      number: '01',
      image: 'https://www.lg.com/content/dam/channel/wcms/my/images/lg-subscribe/v1/intro_01.jpg',
      title: { en: 'Market Leader', cn: '市场领导者', ms: 'Peneraju Pasaran' },
      description: { en: 'Offering 10 product lines in Malaysia.', cn: '在马来西亚提供 10 条完整的产品线。', ms: 'Menawarkan 10 barisan produk di Malaysia.' }
    },
    {
      number: '02',
      image: 'https://www.lg.com/content/dam/channel/wcms/my/images/lg-subscribe/v1/intro_02.jpg',
      title: { en: 'Professional Care', cn: '专业维护保养', ms: 'Penjagaan Profesional' },
      description: { en: 'Regular visits and hassle-free maintenance.', cn: '提供多种无忧维护服务，包括自助服务或定期上门服务。', ms: 'Perkhidmatan penyelenggaraan berkala yang memudahkan anda.' }
    },
    {
      number: '03',
      image: 'https://www.lg.com/content/dam/channel/wcms/my/images/lg-subscribe/v1/intro_03.jpg',
      title: { en: 'Smart Lifestyle', cn: '智能生活方式', ms: 'Gaya Hidup Pintar' },
      description: { en: 'All devices connected with LG ThinQ app.', cn: '支持 LG ThinQ 智能连接的产品，全面升级您的生活品质。', ms: 'Semua produk bersambung dengan aplikasi LG ThinQ.' }
    }
  ],
  heroTitle: { en: 'A Complete Home. Today.', cn: '全屋高端家电，今日订即刻拥有。', ms: 'Rumah Lengkap. Hari Ini.' },
  heroSubtitle: { en: 'Elevate your lifestyle with flexible subscription plans.', cn: '极简月付方案，解锁全球顶尖家电艺术。', ms: 'Tingkatkan gaya hidup anda dengan pelan langganan fleksibel.' },
  joinUsTagline: { en: 'EARN EXTRA, LIVE BETTER.', cn: '轻松加入，给家人多一份收入保障。', ms: 'SERTI KAMI, HIDUP LEBIH SELESA.' },
  joinUsBenefits: [
    { en: '100% Flexible Time (Work from Home)', cn: '时间百分百自由（在家带娃也能做）', ms: 'Masa 100% Fleksibel (Sesuai untuk Pelajar/Suri Rumah)' },
    { en: 'No Experience Needed (Free Training)', cn: '无需经验（学长姐手把手带你上手）', ms: 'Tiada Pengalaman Diperlukan (Latihan Percuma)' },
    { en: 'Weekly/Monthly Extra Commission', cn: '额外佣金奖励（月入多 RM500-3000 并不难）', ms: 'Komisyen Mingguan/Bulanan Yang Lumayan' }
  ],
  joinUsPainPoints: [
    { en: 'Want extra pocket money for school?', cn: '想赚点零花钱减轻大学生活负担？', ms: 'Nak cari duit poket tambahan untuk belajar?' },
    { en: 'Want to earn while caring for kids?', cn: '想在照顾孩子的同时赚点买菜钱？', ms: 'Nak tambah pendapatan sambil jaga anak?' },
    { en: 'Looking for a stress-free side hustle?', cn: '正在寻找一份没有压力的副业？', ms: 'Mencari kerja sampingan tanpa tekanan?' }
  ],
  stores: [],
  promoTemplates: [],
  officeEmail: 'partner@lg-subscribe.com.my',
  recruitmentWa: '60177473787',
  featuredProductIds: [],
  categories: CATEGORIES,
  socialLinks: { fb: '', ig: '', tiktok: '' }
};

export const INITIAL_PRODUCTS: Product[] = [];
