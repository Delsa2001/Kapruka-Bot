/**
 * Structured gift/product search intent → distinct English Kapruka queries.
 */

export type SearchIntent = {
  recipient?: string;
  occasion?: string;
  product?: string;
  modifier?: string;
  rawEnglish: string[];
};

type Pattern = { re: RegExp; value: string };

/** More specific patterns first (e.g. grandmother before mother). */
const RECIPIENT_PATTERNS: Pattern[] = [
  { re: /අම්මාමා|பாட்டி|\bgrandma\b|\bgrandmother\b/i, value: "grandmother" },
  { re: /සුහාජී|பாட்டன்|\bgrandpa\b|\bgrandfather\b/i, value: "grandfather" },
  {
    re: /ග්?ර්ල්\s*ෆ්?‍රෙන්ඩ්|ගැහැණු\s*යාලු|ප්‍රේමිකාව|lover|girlfriend|girl\s*friend|for\s*her\b|to\s*her\b|gift\s*for\s*her|காதலி/i,
    value: "girlfriend",
  },
  {
    re: /බොය්\s*ෆ්‍රෙන්ඩ්|ප්‍රේමකාව|boyfriend|boy\s*friend|for\s*him\b|to\s*him\b|gift\s*for\s*him|காதலன/u,
    value: "boyfriend",
  },
  { re: /අම්ම(?!ාමා)|அம்மா|\bmother\b|\bmom\b|\bamma\b|for\s*mother|to\s*mother/i, value: "mother" },
  { re: /අප්ප|அப்பா|\bfather\b|\bdad\b|\bappa\b|for\s*father/i, value: "father" },
  { re: /බිරි|மனைவி|\bwife\b|for\s*wife/i, value: "wife" },
  { re: /ස්වාමී|கணவன்|\bhusband\b|for\s*husband/i, value: "husband" },
  { re: /සහෝදරිය|சகோதரி|\bsister\b/i, value: "sister" },
  { re: /සහෝදර(?!ිය)|சகோதரர்|\bbrother\b/i, value: "brother" },
  { re: /බිළි|බේබි|newborn|\bbaby\b|\binfant\b/i, value: "baby" },
  { re: /දරුව|ළමය|ළමා|குழந்தை|பிள்ளை|children|\bkids?\b|for\s*child/i, value: "kids" },
  { re: /යාලු|நண்பர்|\bfriend\b/i, value: "friend" },
  { re: /උසස්|boss|manager/i, value: "boss" },
  { re: /සගය|කොල්ල|office|colleague|coworker/i, value: "colleague" },
  { re: /ගුරු|teacher/i, value: "teacher" },
  { re: /fiancé|fiancée|engaged/i, value: "fiance" },
];

const OCCASION_PATTERNS: Pattern[] = [
  { re: /උපන්දින|பிறந்தநாள்|\bbirthday\b|bday/i, value: "birthday" },
  { re: /විවාහ|திருமண|\bwedding\b|marriage/i, value: "wedding" },
  { re: /සංවත්සර|ஆண்டுவிழா|\banniversary\b/i, value: "anniversary" },
  { re: /වැලන්ටයින්|valentine/i, value: "valentine" },
  { re: /උපාධි|பட்டமளிப்பு|\bgraduation\b/i, value: "graduation" },
  { re: /මව්\s*දින|mother'?s?\s*day/i, value: "mothers_day" },
  { re: /පියා\s*දින|father'?s?\s*day/i, value: "fathers_day" },
  { re: /අලුත්\s*අවුරුද්ද|new\s*year/i, value: "new_year" },
  { re: /සුබ\s*පැතුම්|get\s*well/i, value: "get_well" },
  { re: /ස්තූතියි|thank\s*you/i, value: "thank_you" },
  { re: /வாலண்டைன்|valentine/i, value: "valentine" },
  { re: /புதிய\s*ஆண்டு|new\s*year/i, value: "new_year" },
  { re: /සමාව|sorry/i, value: "sorry" },
  { re: /සුබ\s*උපන්|happy\s*birthday/i, value: "birthday" },
];

const PRODUCT_PATTERNS: Pattern[] = [
  { re: /චොකලට්|சாக்லேட்|\bchocolate/i, value: "chocolate" },
  { re: /මල්|பூக்கள்|பூ|\bflowers?\b|\bbouquet\b/i, value: "flowers" },
  { re: /කේක්|கேக்|\bcake/i, value: "cake" },
  { re: /ටෙඩි|teddy|soft\s*toy|plush/i, value: "teddy" },
  { re: /සුවඳ|perfume/i, value: "perfume" },
  { re: /පළතිරු|fruit\s*basket/i, value: "fruit" },
  { re: /මග්|mug/i, value: "mug" },
  { re: /වයින්|wine/i, value: "wine" },
  { re: /gift\s*box|තෑගි\s*පෙට්ටි|பரிசுப்\s*பெட்டி/i, value: "gift_box" },
  { re: /හැම්පර්|hamper/i, value: "hamper" },
  { re: /watch|ඔරලෝසු/i, value: "watch" },
  { re: /jewel|ආභරණ/i, value: "jewelry" },
  { re: /grocery|පළතිරු|grocery/i, value: "grocery" },
  { re: /\bmug\b|මග්/i, value: "mug" },
  { re: /\bwatch\b|ඔරලෝසු/i, value: "watch" },
];

const MODIFIER_PATTERNS: Pattern[] = [
  { re: /රොමාන්තික|romantic|love/i, value: "romantic" },
  { re: /ලස්සන|beautiful|cute/i, value: "cute" },
  { re: /විනෝද|funny|humor/i, value: "funny" },
  { re: /ලාභ|cheap|budget/i, value: "budget" },
  { re: /luxury|පහළ/i, value: "luxury" },
];

function matchPatterns(text: string, patterns: Pattern[]): string | undefined {
  for (const { re, value } of patterns) {
    if (re.test(text)) return value;
  }
  return undefined;
}

/** Tamil dative/genitive forms (e.g. நண்பருக்கு) — match stem before general patterns. */
function matchRecipient(text: string): string | undefined {
  const tamilStems: Pattern[] = [
    { re: /நண்பர/u, value: "friend" },
    { re: /காதலன/u, value: "boyfriend" },
    { re: /காதலி/u, value: "girlfriend" },
    { re: /அம்மா/u, value: "mother" },
    { re: /அப்பா/u, value: "father" },
    { re: /குழந்தை/u, value: "kids" },
    { re: /சகோதரி/u, value: "sister" },
    { re: /சகோதரர்/u, value: "brother" },
  ];
  return matchPatterns(text, tamilStems) ?? matchPatterns(text, RECIPIENT_PATTERNS);
}

function matchOccasion(text: string): string | undefined {
  if (/සංවත්සර|anniversary/i.test(text)) return "anniversary";
  if (/වැලන්ටයින්|valentine|வாலண்டைன்/i.test(text)) return "valentine";
  if (/මව්\s*දින|mother'?s?\s*day/i.test(text)) return "mothers_day";
  if (/පියා\s*දින|father'?s?\s*day/i.test(text)) return "fathers_day";
  if (/புதிய\s*ஆண்டு|new\s*year/i.test(text)) return "new_year";
  return matchPatterns(text, OCCASION_PATTERNS);
}

export function parseSearchIntent(text: string): SearchIntent {
  const intent: SearchIntent = { rawEnglish: [] };

  intent.recipient = matchRecipient(text);
  intent.occasion = matchOccasion(text);
  intent.product = matchPatterns(text, PRODUCT_PATTERNS);
  intent.modifier = matchPatterns(text, MODIFIER_PATTERNS);

  const englishPhrases =
    text.match(
      /\b(?:chocolate|flower|flowers|cake|gift|birthday|wedding|romantic|perfume|teddy|hamper|mug|fruit|basket|mother|father|girlfriend|boyfriend|wife|husband|baby|kids?|friend|colleague|boss|teacher|sister|brother|anniversary|graduation|valentine)(?:\s+(?:gift|box|bouquet|basket|for\s+her|for\s+him|for\s+mother|for\s+father))?\b/gi
    ) ?? [];

  intent.rawEnglish = [...new Set(englishPhrases.map((s) => s.toLowerCase()))];

  return intent;
}

/** Build a specific Kapruka English search query from parsed intent. */
export function buildKaprukaSearchQuery(intent: SearchIntent): string {
  const { recipient, occasion, product, modifier } = intent;
  const romantic =
    modifier === "romantic" ||
    recipient === "girlfriend" ||
    recipient === "boyfriend" ||
    occasion === "valentine" ||
    occasion === "anniversary";

  if (occasion === "thank_you") return "thank you gift";
  if (occasion === "sorry") return "sorry gift";
  if (occasion === "mothers_day") return "mothers day gift";
  if (occasion === "fathers_day") return "fathers day gift";
  if (occasion === "new_year") return "new year gift";
  if (occasion === "get_well") return "get well soon gift";
  if (recipient === "wife" && occasion === "anniversary") return "anniversary gift for wife";
  if (recipient === "fiance" || /engagement/i.test(intent.rawEnglish.join(" ")))
    return "engagement gift";

  if (product === "mug" && romantic) return "romantic mug gift";
  if (product === "mug") return "gift mug";
  if (product === "watch" && recipient === "boyfriend") return "watch gift for men";
  if (product === "watch") return "watch gift";
  if (product === "grocery") return "grocery hamper gift";

  if (product === "flowers" && recipient === "mother") return "flowers bouquet for mother";
  if (product === "flowers" && recipient === "girlfriend") return "romantic flowers bouquet for her";
  if (product === "flowers") return "flowers bouquet gift";
  if (product === "chocolate" && recipient === "girlfriend") return "chocolate gift box for her";
  if (product === "chocolate" && recipient === "boyfriend") return "chocolate gift for him";
  if (product === "chocolate") return "chocolate gift box";
  if (product === "cake" && recipient === "mother") return "birthday cake for mother";
  if (product === "cake") return "birthday cake";
  if (product === "teddy" && romantic) return "teddy bear romantic gift";
  if (product === "teddy") return "teddy bear gift";
  if (product === "perfume" && recipient === "girlfriend") return "perfume gift for her";
  if (product === "perfume") return "perfume gift set";
  if (product === "fruit") return "fruit basket gift";
  if (product === "hamper") return "gift hamper";
  if (product === "gift_box") return "gift box";

  if (recipient === "mother" && occasion === "birthday") return "birthday gift for mother";
  if (recipient === "mother" && occasion === "mothers_day") return "mothers day gift";
  if (recipient === "mother") return "gift for mother";
  if (recipient === "father" && occasion === "birthday") return "birthday gift for father";
  if (recipient === "father") return "gift for father";
  if (recipient === "girlfriend" && occasion === "birthday") return "birthday gift for girlfriend";
  if (recipient === "girlfriend") return "girlfriend gift romantic";
  if (recipient === "boyfriend" && occasion === "birthday") return "birthday gift for boyfriend";
  if (recipient === "boyfriend") return "boyfriend gift";
  if (recipient === "wife" && romantic) return "anniversary gift for wife";
  if (recipient === "wife") return romantic ? "romantic gift for wife" : "gift for wife";
  if (recipient === "husband") return "gift for husband";
  if (recipient === "kids" && occasion === "birthday") return "birthday gift for kids";
  if (recipient === "kids") return "gift for children";
  if (recipient === "baby") return "newborn baby gift";
  if (recipient === "grandmother") return "gift for grandmother";
  if (recipient === "grandfather") return "gift for grandfather";
  if (recipient === "sister") return "gift for sister";
  if (recipient === "brother") return "gift for brother";
  if (occasion === "wedding") return "wedding gift";
  if (occasion === "anniversary") return "anniversary gift romantic";
  if (occasion === "valentine") return "valentine gift romantic";
  if (occasion === "graduation") return "graduation gift";
  if (recipient === "friend") return "gift for friend";
  if (recipient === "boss") return "gift for boss";
  if (recipient === "colleague") return "office gift colleague";
  if (recipient === "teacher") return "gift for teacher";
  if (recipient === "fiance") return "engagement gift";
  if (occasion === "birthday") return "birthday gift";
  if (occasion === "get_well") return "get well soon gift";
  if (intent.rawEnglish.length > 0) {
    const joined = intent.rawEnglish.slice(0, 4).join(" ");
    if (/mothers?\s*day/.test(joined)) return "mothers day gift";
    if (/fathers?\s*day/.test(joined)) return "fathers day gift";
    if (/engagement/.test(joined)) return "engagement gift";
    if (/graduation/.test(joined) && !recipient) return "graduation gift";
    return joined;
  }

  return "special gift set";
}
