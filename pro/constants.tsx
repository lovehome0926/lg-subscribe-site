
import { Translation, Language, Product } from './types';

export const LANGUAGES: Record<Language, Translation> = {
  zh: {
    title: "LG Subscribe 专业管理系统",
    schedule: "排班表",
    salesKit: "销售工具箱",
    aiCoach: "AI 话术教练",
    agents: "代理管理",
    myAvailability: "填报时间",
    generate: "自动排班",
    ft: "全职 (FT)",
    pt: "兼职 (PT)",
    slot1: "早班 10am-4pm",
    slot2: "晚班 4pm-10pm",
    searchPlaceholder: "搜索型号、尺寸、常见问题...",
    faq: "常见问答",
    forms: "下载表格",
    scripts: "实战话术",
    specs: "规格参数",
    aiPlaceholder: "例如：顾客家厨房太小，怎么推介 Built-in 净水器？",
    aiInstruction: "AI 已学习 LG 最新手册，将提供专业安装建议与话术",
    am: "早",
    pm: "晚",
    weekdays: ["日", "一", "二", "三", "四", "五", "六"],
    notes: "注意事项",
    copy: "复制建议",
    expertBtn: "获取专家建议",
    thinking: "AI 正在思考中...",
    loginLSM: "LSM 登录",
    loginAgent: "LM 登录",
    passwordPlaceholder: "请输入密码",
    agentCodePlaceholder: "请输入 Agent Code (M/F000000)",
    loginBtn: "进入系统",
    logout: "注销"
  },
  en: {
    title: "LG Subscribe Pro System",
    schedule: "Timetable",
    salesKit: "Sales Kit",
    aiCoach: "AI Coach",
    agents: "Agents",
    myAvailability: "My Availability",
    generate: "Auto-Gen",
    ft: "Full Time",
    pt: "Part Time",
    slot1: "Morning (10am-4pm)",
    slot2: "Evening (4pm-10pm)",
    searchPlaceholder: "Search products, FAQ...",
    faq: "FAQ",
    forms: "Downloads",
    scripts: "Scripts",
    specs: "Specs",
    aiPlaceholder: "E.g.: 'Kitchen too small, how to answer?'",
    aiInstruction: "AI Mentor provides strategic responses based on LG logic",
    am: "AM",
    pm: "PM",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    notes: "Notes",
    copy: "Copy Script",
    expertBtn: "Get Advice",
    thinking: "AI is thinking...",
    loginLSM: "LSM Login",
    loginAgent: "LM Login",
    passwordPlaceholder: "Enter Password",
    agentCodePlaceholder: "Enter Agent Code (M/F000000)",
    loginBtn: "Login",
    logout: "Logout"
  },
  ms: {
    title: "Sistem LG Subscribe Pro",
    schedule: "Jadual",
    salesKit: "Kit Jualan",
    aiCoach: "Jurulatih AI",
    agents: "Ejen",
    myAvailability: "Masa Saya",
    generate: "Janakan",
    ft: "Sepenuh Masa",
    pt: "Sambilan",
    slot1: "Pagi (10pg-4ptg)",
    slot2: "Malam (4ptg-10mlm)",
    searchPlaceholder: "Cari produk, skrip...",
    faq: "FAQ",
    forms: "Borang",
    scripts: "Skrip",
    specs: "Spesifikasi",
    aiPlaceholder: "Cth: 'Dapur sempit, macam mana jawab?'",
    aiInstruction: "Mentor AI beri cadangan skrip profesional",
    am: "AM",
    pm: "PM",
    weekdays: ["Aha", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"],
    notes: "Nota",
    copy: "Salin Skrip",
    expertBtn: "Dapatkan Nasihat",
    thinking: "AI sedang berfikir...",
    loginLSM: "Log Masuk LSM",
    loginAgent: "Log Masuk LM",
    passwordPlaceholder: "Masukkan Kata Laluan",
    agentCodePlaceholder: "Kod Ejen (M/F000000)",
    loginBtn: "Log Masuk",
    logout: "Log Keluar"
  }
};

export const PRODUCT_DATA: Product[] = [
  {
    id: "WU525BS",
    name: "LG PuriCare™ Built-in Water Purifier",
    category: "Water Purifier",
    dims: "Faucet: 40x192x375mm | Body: 170x491x391mm",
    notes: "Needs space for power and drainage under cabinet. Faucet rotates 180°.",
    sellingPoints: ["4-Stage Filtration", "Auto High-Temp Sterilization", "Space Saving"]
  },
  {
    id: "WT2520NHEGR",
    name: "LG WashTower™ Objet Collection",
    category: "Washer",
    dims: "600 x 1655 x 660 mm (25kg/20kg)",
    notes: "Requires >1.7m vertical clearance. Integrated central control.",
    sellingPoints: ["AI DD™ Fabric Protection", "TurboWash™ 360", "Smart Pairing"]
  },
  {
    id: "GC-X24FFC7R",
    name: "LG InstaView™ Refrigerator",
    category: "Refrigerator",
    dims: "913 x 1790 x 735 mm (601L)",
    notes: "Reserve 5cm gap on sides for ventilation. UVnano™ hygiene nozzle.",
    sellingPoints: ["Knock Twice to See Inside", "LinearCooling™", "Hygiene Fresh+™"]
  }
];

export const FAQ_DATA = [
  {
    q: "Does the subscription price include maintenance?",
    a: "Yes, all LG Subscribe contracts in Malaysia include LG CareShip professional maintenance (filters, sterilization, cleaning) for the entire contract period."
  },
  {
    q: "What is the minimum contract period?",
    a: "Contracts usually vary from 5 to 7 years depending on the model and current promotion."
  },
  {
    q: "Can I move the machine to a new house?",
    a: "Yes, relocation services are available through LG authorized service centers. Relocation fees may apply."
  }
];
