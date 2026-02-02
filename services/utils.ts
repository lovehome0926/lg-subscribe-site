
import { Product, Promotion } from '../types';

export function calculatePromoPrice(basePrice: number, promo?: Promotion): number {
  if (!promo || promo.type === 'none') return basePrice;

  let finalPrice = basePrice;
  switch (promo.type) {
    case 'half_price':
      finalPrice = basePrice * 0.5;
      break;
    case 'percentage':
      // 88% 优惠意味着支付 12%
      finalPrice = basePrice * (1 - promo.value / 100);
      break;
    case 'fixed_discount':
      finalPrice = basePrice - promo.value;
      break;
    case 'fixed_price':
      finalPrice = promo.value;
      break;
  }
  // 小数点进位
  return Math.ceil(finalPrice);
}

export function generateWhatsappLink(phone: string, product: Product, agentId: string = 'Official'): string {
  const currentUrl = window.location.href;
  const message = `Hello! I am interested in LG Subscribe:
Product: ${product.name} (${product.modelCode})
Catalog Info: ${product.description}
Agent: ${agentId}
View here: ${currentUrl}#${product.id}`;
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
