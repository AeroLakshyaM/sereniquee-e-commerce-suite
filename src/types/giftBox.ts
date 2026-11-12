import { Product } from '@/types';

export type GiftBoxSize = 'duet' | 'trio' | 'grand';

export interface GiftBoxTier {
  id: GiftBoxSize;
  title: string;
  subtitle: string;
  capacity: number;
  basePrice: number;
  isPopular?: boolean;
}

export interface BoxStyle {
  id: string;
  name: string;
  colorName: string;
  bgClass: string;
  borderClass: string;
  ribbonName: string;
  description: string;
}

export interface GiftAccessory {
  id: string;
  name: string;
  description: string;
  price: number;
  iconName: string;
}

export interface GiftCardMessage {
  to: string;
  from: string;
  note: string;
  cardDesign: 'ivory' | 'botanical' | 'obsidian';
}

export interface CustomBespokeBox {
  tier: GiftBoxTier;
  boxStyle: BoxStyle;
  selectedCandles: Product[];
  selectedAccessories: GiftAccessory[];
  cardMessage: GiftCardMessage;
  totalPrice: number;
}

export const GIFT_BOX_TIERS: GiftBoxTier[] = [
  {
    id: 'duet',
    title: 'The Duet',
    subtitle: '2 Signature Candles + Match Vial',
    capacity: 2,
    basePrice: 1799,
  },
  {
    id: 'trio',
    title: 'The Atelier Trio',
    subtitle: '3 Handcrafted Candles (Most Loved)',
    capacity: 3,
    basePrice: 2599,
    isPopular: true,
  },
  {
    id: 'grand',
    title: 'The Grand Sanctuary',
    subtitle: '4 Luxury Candles + Deluxe Accessories',
    capacity: 4,
    basePrice: 3399,
  },
];

export const BOX_STYLES: BoxStyle[] = [
  {
    id: 'ivory-gold',
    name: 'Ivory Gold Magnetic',
    colorName: 'Warm Linen & Gold Foil',
    bgClass: 'bg-[#fdfbf7]',
    borderClass: 'border-[#e8ded1]',
    ribbonName: 'Gold Satin Ribbon',
    description: 'Textured ivory linen rigid box with embossed gold foil crest.',
  },
  {
    id: 'botanical-sage',
    name: 'Botanical Sage',
    colorName: 'Earthy Sage & Bronze',
    bgClass: 'bg-[#f2f6f3]',
    borderClass: 'border-[#cddcd1]',
    ribbonName: 'Olive Green Velvet Ribbon',
    description: 'Matte botanical sage box tied with artisanal olive velvet.',
  },
  {
    id: 'midnight-obsidian',
    name: 'Midnight Obsidian',
    colorName: 'Matte Charcoal & Gold',
    bgClass: 'bg-[#1e2022]',
    borderClass: 'border-[#383d42]',
    ribbonName: 'Black Grosgrain & Gold Wax Seal',
    description: 'Dramatic black magnetic closure box with gold foil lettering.',
  },
];

export const GIFT_ACCESSORIES: GiftAccessory[] = [
  {
    id: 'brass-trimmer',
    name: 'Solid Brass Wick Trimmer',
    description: 'Calibrated scissors to trim wicks cleanly to 1/4 inch before each lighting.',
    price: 349,
    iconName: 'Scissors',
  },
  {
    id: 'brass-snuffer',
    name: 'Artisan Bell Snuffer',
    description: 'Gently extinguishes flames to prevent smoke and preserve room fragrance.',
    price: 299,
    iconName: 'Flame',
  },
  {
    id: 'match-vial',
    name: 'Apothecary Match Vial',
    description: 'Corked glass vial containing 20 luxury long-stem matches with striker.',
    price: 199,
    iconName: 'Sparkles',
  },
];
