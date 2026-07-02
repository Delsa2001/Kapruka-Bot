/**
 * Homepage category circles from kapruka.com `.rebrandCircles` (live HTML, 2026).
 */
import type { UiLanguage } from "@/types/kapruka";

export type CategoryLabelSet = {
  label: string;
  shortLabel: string;
};

export type KaprukaHomeCategory = {
  id: string;
  image: string;
  /** English search sent to Kapa when tapped */
  searchQuery: string;
  labels: Record<UiLanguage, CategoryLabelSet>;
};

const BASE = "https://www.kapruka.com";

export const KAPRUKA_HOME_CATEGORIES: KaprukaHomeCategory[] = [
  {
    id: "cakes",
    image: `${BASE}/static/image/menu_categories/cake.png?v2`,
    searchQuery: "Show me cakes on Kapruka",
    labels: {
      en: { label: "Cakes", shortLabel: "Cakes" },
      si: { label: "කේක්", shortLabel: "කේක්" },
      ta: { label: "கேக்", shortLabel: "கேக்" },
    },
  },
  {
    id: "flowers",
    image: `${BASE}/static/image/menu_categories/flowers.png?v2`,
    searchQuery: "Show me flowers and bouquets",
    labels: {
      en: { label: "Flowers", shortLabel: "Flowers" },
      si: { label: "මල්", shortLabel: "මල්" },
      ta: { label: "பூக்கள்", shortLabel: "பூக்கள்" },
    },
  },
  {
    id: "chocolates",
    image: `${BASE}/static/image/menu_categories/chocolate.png?v2`,
    searchQuery: "Show me chocolates and gift boxes",
    labels: {
      en: { label: "Chocolates", shortLabel: "Chocolates" },
      si: { label: "චොකලට්", shortLabel: "චොකලට්" },
      ta: { label: "சாக்லேட்", shortLabel: "சாக்லேட்" },
    },
  },
  {
    id: "clothing",
    image: `${BASE}/static/image/menu_categories/clothing2.png?v2`,
    searchQuery: "Show me clothing",
    labels: {
      en: { label: "Clothing", shortLabel: "Clothing" },
      si: { label: "ඇඳුම්", shortLabel: "ඇඳුම්" },
      ta: { label: "உடை", shortLabel: "உடை" },
    },
  },
  {
    id: "electronics",
    image: `${BASE}/static/image/menu_categories/elec.png?v2`,
    searchQuery: "Show me electronics",
    labels: {
      en: { label: "Electronics", shortLabel: "Electronics" },
      si: { label: "විද්‍යුත් උපකරණ", shortLabel: "ඉලෙක්ට්‍රොනික්" },
      ta: { label: "மின்சாதனங்கள்", shortLabel: "மின்சாதனம்" },
    },
  },
  {
    id: "fashion",
    image: `${BASE}/images/hand_bags_shoes.jpg?v2`,
    searchQuery: "Show me fashion handbags and shoes",
    labels: {
      en: { label: "Fashion", shortLabel: "Fashion" },
      si: { label: "ෆැෂන්", shortLabel: "ෆැෂන්" },
      ta: { label: "ஃபேஷன்", shortLabel: "ஃபேஷன்" },
    },
  },
  {
    id: "food",
    image: `${BASE}/images/food_restaurants_cat.jpg?v1`,
    searchQuery: "Show me food and restaurant items",
    labels: {
      en: { label: "Food & Restaurants", shortLabel: "Food" },
      si: { label: "ආහාර සහ අවන්හල්", shortLabel: "ආහාර" },
      ta: { label: "உணவு & உணவகம்", shortLabel: "உணவு" },
    },
  },
  {
    id: "fruits",
    image: `${BASE}/images/fruitbaskets_cat.jpg?v1`,
    searchQuery: "Show me fruit baskets",
    labels: {
      en: { label: "Fruits", shortLabel: "Fruits" },
      si: { label: "පලතුරු", shortLabel: "පලතුරු" },
      ta: { label: "பழங்கள்", shortLabel: "பழங்கள்" },
    },
  },
  {
    id: "toys",
    image: `${BASE}/images/softtoyskidstoys.jpg?v2`,
    searchQuery: "Show me soft toys and kids toys",
    labels: {
      en: { label: "Soft Toys & Kids Toys", shortLabel: "Toys" },
      si: { label: "මෘදු බෝනි & ළමා ක්‍රීඩා", shortLabel: "බෝනි" },
      ta: { label: "மென்மையான பொம்மைகள்", shortLabel: "பொம்மைகள்" },
    },
  },
  {
    id: "grocery",
    image: `${BASE}/static/image/menu_categories/grocery.png?v3`,
    searchQuery: "Show me grocery and hampers",
    labels: {
      en: { label: "Grocery & Hampers", shortLabel: "Grocery" },
      si: { label: "සිල්ලර & හැම්පර්", shortLabel: "සිල්ලර" },
      ta: { label: "மளிகை & ஹாம்பர்", shortLabel: "மளிகை" },
    },
  },
  {
    id: "greeting-cards",
    image: `${BASE}/static/image/menu_categories/greeting%20card.png?v2`,
    searchQuery: "Show me greeting cards and party supplies",
    labels: {
      en: { label: "Greeting Cards & Party Supplies", shortLabel: "Cards" },
      si: { label: "සුබ පත් & පාටි", shortLabel: "සුබ පත්" },
      ta: { label: "வாழ்த்து அட்டை & பார்ட்டி", shortLabel: "அட்டை" },
    },
  },
  {
    id: "sports",
    image: `${BASE}/images/sportsbicycles.jpg?v2`,
    searchQuery: "Show me sports and bicycles",
    labels: {
      en: { label: "Sports and Bicycles", shortLabel: "Sports" },
      si: { label: "ක්‍රීඩා & බයිසිකල්", shortLabel: "ක්‍රීඩා" },
      ta: { label: "விளையாட்டு & சைக்கிள்", shortLabel: "விளையாட்டு" },
    },
  },
  {
    id: "baby",
    image: `${BASE}/images/motherbaby.jpg?v1`,
    searchQuery: "Show me mother and baby products",
    labels: {
      en: { label: "Mother and Baby", shortLabel: "Baby" },
      si: { label: "මව් & ළමා", shortLabel: "ළමා" },
      ta: { label: "தாய் & குழந்தை", shortLabel: "குழந்தை" },
    },
  },
  {
    id: "jewellery",
    image: `${BASE}/static/image/menu_categories/jewl_watc.png?v3`,
    searchQuery: "Show me jewellery and watches",
    labels: {
      en: { label: "Jewellery and Watches", shortLabel: "Jewellery" },
      si: { label: "ආභරණ & ඔරලෝසු", shortLabel: "ආභරණ" },
      ta: { label: "நகை & கடிகாரம்", shortLabel: "நகை" },
    },
  },
  {
    id: "cosmetics",
    image: `${BASE}/images/perfume_fragrance/cosmetics_cat.png`,
    searchQuery: "Show me cosmetics and perfumes",
    labels: {
      en: { label: "Cosmetics & Perfumes", shortLabel: "Cosmetics" },
      si: { label: "රූපලාවණ්‍ය & සුවඳ", shortLabel: "රූපලාවණ්‍ය" },
      ta: { label: "அலங்காரம் & perfume", shortLabel: "அலங்காரம்" },
    },
  },
  {
    id: "custom-gifts",
    image: `${BASE}/images/custom_gifts_cat.png?v2`,
    searchQuery: "Show me customized gifts",
    labels: {
      en: { label: "Customized Gifts", shortLabel: "Custom" },
      si: { label: "අභිරුචි තෑගි", shortLabel: "තෑගි" },
      ta: { label: "தனிப்பயன் பரிசு", shortLabel: "பரிசு" },
    },
  },
  {
    id: "health",
    image: `${BASE}/images/health_wealth.png?v1`,
    searchQuery: "Show me health and wellness products",
    labels: {
      en: { label: "Health and Wellness", shortLabel: "Health" },
      si: { label: "සෞඛ්‍ය සුවය", shortLabel: "සෞඛ්‍ය" },
      ta: { label: "உடல்நலம்", shortLabel: "உடல்நலம்" },
    },
  },
  {
    id: "home",
    image: `${BASE}/images/homelifestyle_cat.jpg?v1`,
    searchQuery: "Show me home and lifestyle products",
    labels: {
      en: { label: "Home & Lifestyle", shortLabel: "Home" },
      si: { label: "ගෘහස්ථ & ජීවන රටා", shortLabel: "නිවස" },
      ta: { label: "வீடு & வாழ்க்கை", shortLabel: "வீடு" },
    },
  },
  {
    id: "gift-sets",
    image: `${BASE}/static/image/menu_categories/giftset.png?v2`,
    searchQuery: "Show me combo and gift sets",
    labels: {
      en: { label: "Combo and Gift Sets", shortLabel: "Gift Sets" },
      si: { label: "කොම්බෝ & තෑගි කට්ටල", shortLabel: "කට්ටල" },
      ta: { label: "காம்போ & பரிசு தொகுப்பு", shortLabel: "தொகுப்பு" },
    },
  },
  {
    id: "books",
    image: `${BASE}/images/soft_toys/books_cat.png`,
    searchQuery: "Show me books and stationery",
    labels: {
      en: { label: "Books & Stationery", shortLabel: "Books" },
      si: { label: "පොත් & ලිපි ද්‍රව්‍ය", shortLabel: "පොත්" },
      ta: { label: "புத்தகங்கள் & stationery", shortLabel: "புத்தகம்" },
    },
  },
];

const SECTION_TITLES: Record<UiLanguage, string> = {
  en: "Shop by category",
  si: "වර්ග අනුව සොයන්න",
  ta: "வகைகள்",
};

export function getCategorySectionTitle(language: UiLanguage): string {
  return SECTION_TITLES[language];
}

export function getCategoryDisplay(
  cat: KaprukaHomeCategory,
  language: UiLanguage,
  compact = false
): string {
  const set = cat.labels[language];
  return compact ? set.shortLabel : set.label;
}
