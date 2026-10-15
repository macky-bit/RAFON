const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const ICONS = {
  create: '<path d="M12 3l1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z"/><path d="M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z"/>',
  saved: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  admin: '<path d="M12 3 4 7v5c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V7l-8-4Z"/><path d="m9 12 2 2 4-4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
  hanger: '<path d="M9 5a3 3 0 1 1 4.5 2.6L21 14H3l7.3-6.3"/>',
  palette: '<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12h-3Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="9" cy="6.5" r="1"/><circle cx="14" cy="6" r="1"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>'
};

function icon(name, className = "") {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}

const PALETTE = {
  "Deep teal": { hex: "#285d5b", matches: ["Ivory", "Muted gold", "Olive"], dots: ["#eee9df", "#c49a5a", "#78836c"] },
  Navy: { hex: "#25364a", matches: ["White", "Sand", "Muted gold"], dots: ["#ffffff", "#c7ad8b", "#c49a5a"] },
  Olive: { hex: "#6b705c", matches: ["Cream", "Black", "Rust"], dots: ["#f3ede2", "#202322", "#a35d3d"] },
  Sand: { hex: "#c7ad8b", matches: ["Deep teal", "White", "Burgundy"], dots: ["#285d5b", "#ffffff", "#6f3345"] },
  Rust: { hex: "#a35d3d", matches: ["Cream", "Navy", "Olive"], dots: ["#f3ede2", "#25364a", "#6b705c"] },
  Burgundy: { hex: "#6f3345", matches: ["Sand", "Charcoal", "Ivory"], dots: ["#c7ad8b", "#343737", "#eee9df"] },
  White: { hex: "#ffffff", matches: ["Deep teal", "Black", "Sand"], dots: ["#285d5b", "#202322", "#c7ad8b"] },
  Black: { hex: "#202322", matches: ["White", "Muted gold", "Olive"], dots: ["#ffffff", "#c49a5a", "#6b705c"] },
  Gray: { hex: "#7b7f82", matches: ["White", "Navy", "Burgundy"], dots: ["#ffffff", "#25364a", "#6f3345"] },
  Brown: { hex: "#7a5138", matches: ["Beige", "Light blue", "White"], dots: ["#d9c8ad", "#9fc4df", "#ffffff"] },
  Beige: { hex: "#d9c8ad", matches: ["Brown", "Navy", "Deep teal"], dots: ["#7a5138", "#25364a", "#285d5b"] },
  "Light blue": { hex: "#9fc4df", matches: ["Navy", "Gray", "White"], dots: ["#25364a", "#7b7f82", "#ffffff"] },
  Red: { hex: "#d93032", matches: ["White", "Black", "Navy"], dots: ["#ffffff", "#202322", "#25364a"] },
  Blue: { hex: "#1557c0", matches: ["White", "Gray", "Beige"], dots: ["#ffffff", "#7b7f82", "#d9c8ad"] },
  Yellow: { hex: "#f2c318", matches: ["Navy", "Gray", "White"], dots: ["#25364a", "#7b7f82", "#ffffff"] }
};

const COLOR_GROUPS = [
  { name: "Basics", colors: ["White", "Black", "Gray", "Beige", "Navy"] },
  { name: "Earth tones", colors: ["Brown", "Sand", "Olive"] },
  { name: "Accent colors", colors: ["Light blue", "Deep teal", "Rust", "Burgundy"] },
  { name: "Primary colors", colors: ["Red", "Blue", "Yellow"] }
];

const ITEM_ASSET = name => `assets/items/${name}.png`;

const SEED_CATALOG = [
  { id: "UNI-OUT-001", name: "Deep Teal Regular Overshirt", category: "Outerwear", gender: "Unisex", fit: "Regular", color: "Deep teal", sizes: "XS–2XL", styles: "Casual, Smart Casual, Streetwear", image: ITEM_ASSET("unisex-teal-overshirt"), active: true },
  { id: "UNI-SHO-001", name: "White Low-top Sneakers", category: "Shoes", gender: "Unisex", fit: "All fits", color: "White", sizes: "36–45", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("unisex-white-sneakers"), active: true },
  { id: "UNI-ACC-001", name: "Structured Black Tote", category: "Accessory", gender: "Unisex", fit: "All fits", color: "Black", sizes: "One size", styles: "Smart Casual, Minimalist", image: ITEM_ASSET("unisex-black-tote"), active: true },
  { id: "UNI-ACC-002", name: "Muted Gold Watch", category: "Accessory", gender: "Unisex", fit: "All fits", color: "Muted gold", sizes: "One size", styles: "Smart Casual, Formal, Minimalist", image: ITEM_ASSET("unisex-gold-watch"), active: true },
  { id: "MEN-TOP-001", name: "Men's Regular Ivory Tee", category: "Top", gender: "Man", fit: "Regular", color: "White", sizes: "XS–2XL", styles: "Casual, Minimalist", image: ITEM_ASSET("men-ivory-tee"), active: true },
  { id: "MEN-TOP-002", name: "Men's Regular Charcoal Polo", category: "Top", gender: "Man", fit: "Regular", color: "Black", sizes: "S–2XL", styles: "Smart Casual, Formal", image: ITEM_ASSET("men-charcoal-polo"), active: true },
  { id: "MEN-BOT-001", name: "Men's Regular Khaki Trousers", category: "Bottom", gender: "Man", fit: "Regular", color: "Sand", sizes: "S–2XL", styles: "Casual, Smart Casual, Minimalist", image: ITEM_ASSET("men-khaki-trousers"), active: true },
  { id: "MEN-SLM-TOP-001", name: "Men's Slim Navy Shirt", category: "Top", gender: "Man", fit: "Slim", color: "Navy", sizes: "XS–2XL", styles: "Smart Casual, Formal, Minimalist", image: ITEM_ASSET("men-slim-navy-shirt"), active: true },
  { id: "MEN-SLM-BOT-001", name: "Men's Slim Black Trousers", category: "Bottom", gender: "Man", fit: "Slim", color: "Black", sizes: "XS–2XL", styles: "Smart Casual, Formal, Minimalist", image: ITEM_ASSET("men-slim-black-trousers"), active: true },
  { id: "MEN-SLM-TOP-002", name: "Men's Slim White Tee", category: "Top", gender: "Man", fit: "Slim", color: "White", sizes: "XS–2XL", styles: "Casual, Minimalist", image: ITEM_ASSET("men-slim-white-tee"), active: true },
  { id: "MEN-SLM-BOT-002", name: "Men's Slim Gray Trousers", category: "Bottom", gender: "Man", fit: "Slim", color: "Gray", sizes: "XS–2XL", styles: "Smart Casual, Formal, Minimalist", image: ITEM_ASSET("men-slim-gray-trousers"), active: true },
  { id: "MEN-REG-TOP-003", name: "Men's Regular Light Blue Shirt", category: "Top", gender: "Man", fit: "Regular", color: "Light blue", sizes: "XS–2XL", styles: "Smart Casual, Formal, Minimalist", image: ITEM_ASSET("men-regular-light-blue-shirt"), active: true },
  { id: "MEN-REG-BOT-002", name: "Men's Regular Navy Trousers", category: "Bottom", gender: "Man", fit: "Regular", color: "Navy", sizes: "XS–2XL", styles: "Smart Casual, Formal, Minimalist", image: ITEM_ASSET("men-regular-navy-trousers"), active: true },
  { id: "MEN-RLX-TOP-001", name: "Men's Relaxed Olive Tee", category: "Top", gender: "Man", fit: "Relaxed", color: "Olive", sizes: "XS–2XL", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("men-relaxed-olive-tee"), active: true },
  { id: "MEN-RLX-BOT-001", name: "Men's Relaxed Sand Chinos", category: "Bottom", gender: "Man", fit: "Relaxed", color: "Sand", sizes: "XS–2XL", styles: "Casual, Smart Casual, Minimalist", image: ITEM_ASSET("men-relaxed-sand-chinos"), active: true },
  { id: "MEN-RLX-TOP-002", name: "Men's Relaxed Brown Overshirt", category: "Outerwear", gender: "Man", fit: "Relaxed", color: "Brown", sizes: "XS–2XL", styles: "Casual, Smart Casual, Streetwear", image: ITEM_ASSET("men-relaxed-brown-overshirt"), active: true },
  { id: "MEN-RLX-BOT-002", name: "Men's Relaxed Beige Trousers", category: "Bottom", gender: "Man", fit: "Relaxed", color: "Beige", sizes: "XS–2XL", styles: "Casual, Smart Casual, Minimalist", image: ITEM_ASSET("men-relaxed-beige-trousers"), active: true },
  { id: "MEN-OVR-TOP-001", name: "Men's Oversized Teal Sweater", category: "Top", gender: "Man", fit: "Oversized", color: "Deep teal", sizes: "XS–2XL", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("men-oversized-teal-sweater"), active: true },
  { id: "MEN-OVR-BOT-001", name: "Men's Oversized Charcoal Trousers", category: "Bottom", gender: "Man", fit: "Oversized", color: "Black", sizes: "XS–2XL", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("men-oversized-charcoal-trousers"), active: true },
  { id: "MEN-OVR-TOP-002", name: "Men's Oversized Gray Hoodie", category: "Top", gender: "Man", fit: "Oversized", color: "Gray", sizes: "XS–2XL", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("men-oversized-gray-hoodie"), active: true },
  { id: "MEN-OVR-BOT-002", name: "Men's Oversized Navy Jeans", category: "Bottom", gender: "Man", fit: "Oversized", color: "Navy", sizes: "XS–2XL", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("men-oversized-navy-jeans"), active: true },
  { id: "MEN-SHO-001", name: "Men's Black Leather Loafers", category: "Shoes", gender: "Man", fit: "All fits", color: "Black", sizes: "38–45", styles: "Smart Casual, Formal", image: ITEM_ASSET("men-black-loafers"), active: true },
  { id: "WMN-TOP-001", name: "Women's Regular Deep Teal Blouse", category: "Top", gender: "Woman", fit: "Regular", color: "Deep teal", sizes: "XS–2XL", styles: "Smart Casual, Formal", image: ITEM_ASSET("women-teal-blouse"), active: true },
  { id: "WMN-TOP-002", name: "Women's Regular Ivory Knit Top", category: "Top", gender: "Woman", fit: "Regular", color: "White", sizes: "XS–2XL", styles: "Casual, Minimalist", image: ITEM_ASSET("women-ivory-top"), active: true },
  { id: "WMN-BOT-001", name: "Women's Regular Sand Midi Skirt", category: "Bottom", gender: "Woman", fit: "Regular", color: "Sand", sizes: "XS–2XL", styles: "Smart Casual, Formal", image: ITEM_ASSET("women-sand-skirt"), active: true },
  { id: "WMN-BOT-002", name: "Women's Regular Black Trousers", category: "Bottom", gender: "Woman", fit: "Regular", color: "Black", sizes: "XS–2XL", styles: "Smart Casual, Minimalist", image: ITEM_ASSET("women-black-trousers"), active: true },
  { id: "WMN-DRS-001", name: "Women's Regular Burgundy Midi Dress", category: "Dress", gender: "Woman", fit: "Regular", color: "Burgundy", sizes: "XS–2XL", styles: "Formal, Smart Casual", image: ITEM_ASSET("women-burgundy-dress"), active: true },
  { id: "WMN-SLM-TOP-001", name: "Women's Slim Burgundy Knit Top", category: "Top", gender: "Woman", fit: "Slim", color: "Burgundy", sizes: "XS–2XL", styles: "Smart Casual, Formal, Minimalist", image: ITEM_ASSET("women-slim-burgundy-top"), active: true },
  { id: "WMN-SLM-BOT-001", name: "Women's Slim Black Trousers", category: "Bottom", gender: "Woman", fit: "Slim", color: "Black", sizes: "XS–2XL", styles: "Smart Casual, Formal, Minimalist", image: ITEM_ASSET("women-slim-black-trousers"), active: true },
  { id: "WMN-SLM-TOP-002", name: "Women's Slim White Blouse", category: "Top", gender: "Woman", fit: "Slim", color: "White", sizes: "XS–2XL", styles: "Smart Casual, Formal, Minimalist", image: ITEM_ASSET("women-slim-white-blouse"), active: true },
  { id: "WMN-SLM-BOT-002", name: "Women's Slim Gray Trousers", category: "Bottom", gender: "Woman", fit: "Slim", color: "Gray", sizes: "XS–2XL", styles: "Smart Casual, Formal, Minimalist", image: ITEM_ASSET("women-slim-gray-trousers"), active: true },
  { id: "WMN-REG-TOP-003", name: "Women's Regular Light Blue Cardigan", category: "Top", gender: "Woman", fit: "Regular", color: "Light blue", sizes: "XS–2XL", styles: "Casual, Smart Casual, Minimalist", image: ITEM_ASSET("women-regular-light-blue-cardigan"), active: true },
  { id: "WMN-REG-BOT-003", name: "Women's Regular Beige Trousers", category: "Bottom", gender: "Woman", fit: "Regular", color: "Beige", sizes: "XS–2XL", styles: "Casual, Smart Casual, Minimalist", image: ITEM_ASSET("women-regular-beige-trousers"), active: true },
  { id: "WMN-RLX-TOP-001", name: "Women's Relaxed Teal Blouse", category: "Top", gender: "Woman", fit: "Relaxed", color: "Deep teal", sizes: "XS–2XL", styles: "Casual, Smart Casual, Minimalist", image: ITEM_ASSET("women-relaxed-teal-blouse"), active: true },
  { id: "WMN-RLX-BOT-001", name: "Women's Relaxed Sand Trousers", category: "Bottom", gender: "Woman", fit: "Relaxed", color: "Sand", sizes: "XS–2XL", styles: "Casual, Smart Casual, Minimalist", image: ITEM_ASSET("women-relaxed-sand-trousers"), active: true },
  { id: "WMN-RLX-TOP-002", name: "Women's Relaxed Brown Knit", category: "Top", gender: "Woman", fit: "Relaxed", color: "Brown", sizes: "XS–2XL", styles: "Casual, Smart Casual, Minimalist", image: ITEM_ASSET("women-relaxed-brown-knit"), active: true },
  { id: "WMN-RLX-BOT-002", name: "Women's Relaxed Gray Trousers", category: "Bottom", gender: "Woman", fit: "Relaxed", color: "Gray", sizes: "XS–2XL", styles: "Casual, Smart Casual, Minimalist", image: ITEM_ASSET("women-relaxed-gray-trousers"), active: true },
  { id: "WMN-OVR-TOP-001", name: "Women's Oversized Ivory Sweater", category: "Top", gender: "Woman", fit: "Oversized", color: "White", sizes: "XS–2XL", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("women-oversized-ivory-sweater"), active: true },
  { id: "WMN-OVR-BOT-001", name: "Women's Oversized Black Trousers", category: "Bottom", gender: "Woman", fit: "Oversized", color: "Black", sizes: "XS–2XL", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("women-oversized-black-trousers"), active: true },
  { id: "WMN-OVR-TOP-002", name: "Women's Oversized Beige Hoodie", category: "Top", gender: "Woman", fit: "Oversized", color: "Beige", sizes: "XS–2XL", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("women-oversized-beige-hoodie"), active: true },
  { id: "WMN-OVR-BOT-002", name: "Women's Oversized Navy Jeans", category: "Bottom", gender: "Woman", fit: "Oversized", color: "Navy", sizes: "XS–2XL", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("women-oversized-navy-jeans"), active: true },
  { id: "WMN-SHO-001", name: "Women's Black Leather Loafers", category: "Shoes", gender: "Woman", fit: "All fits", color: "Black", sizes: "35–42", styles: "Smart Casual, Formal", image: ITEM_ASSET("women-black-loafers"), active: true },
  { id: "MEN-SLM-TOP-003", name: "Men's Slim Red Polo", category: "Top", gender: "Man", fit: "Slim", color: "Red", sizes: "XS–2XL", styles: "Smart Casual, Casual", image: ITEM_ASSET("men-slim-red-polo"), active: true },
  { id: "MEN-REG-TOP-004", name: "Men's Regular Blue Sweater", category: "Top", gender: "Man", fit: "Regular", color: "Blue", sizes: "XS–2XL", styles: "Casual, Smart Casual, Minimalist", image: ITEM_ASSET("men-regular-blue-sweater"), active: true },
  { id: "MEN-RLX-TOP-003", name: "Men's Relaxed Yellow Tee", category: "Top", gender: "Man", fit: "Relaxed", color: "Yellow", sizes: "XS–2XL", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("men-relaxed-yellow-tee"), active: true },
  { id: "MEN-OVR-OUT-001", name: "Men's Oversized Red Varsity Jacket", category: "Outerwear", gender: "Man", fit: "Oversized", color: "Red", sizes: "XS–2XL", styles: "Casual, Streetwear", image: ITEM_ASSET("men-oversized-red-jacket"), active: true },
  { id: "WMN-SLM-TOP-003", name: "Women's Slim Blue Knit Top", category: "Top", gender: "Woman", fit: "Slim", color: "Blue", sizes: "XS–2XL", styles: "Smart Casual, Casual, Minimalist", image: ITEM_ASSET("women-slim-blue-top"), active: true },
  { id: "WMN-REG-TOP-004", name: "Women's Regular Red Blouse", category: "Top", gender: "Woman", fit: "Regular", color: "Red", sizes: "XS–2XL", styles: "Smart Casual, Formal", image: ITEM_ASSET("women-regular-red-blouse"), active: true },
  { id: "WMN-RLX-TOP-003", name: "Women's Relaxed Yellow Cardigan", category: "Top", gender: "Woman", fit: "Relaxed", color: "Yellow", sizes: "XS–2XL", styles: "Casual, Smart Casual, Minimalist", image: ITEM_ASSET("women-relaxed-yellow-cardigan"), active: true },
  { id: "WMN-OVR-TOP-003", name: "Women's Oversized Blue Sweatshirt", category: "Top", gender: "Woman", fit: "Oversized", color: "Blue", sizes: "XS–2XL", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("women-oversized-blue-sweatshirt"), active: true },
  { id: "MEN-NEW-CAS-001", name: "Men's Relaxed Rust Graphic Tee", category: "Top", gender: "Man", fit: "Relaxed", color: "Rust", sizes: "XS–2XL", styles: "Casual", occasions: "School, Date", image: ITEM_ASSET("men-relaxed-rust-graphic-tee"), active: true },
  { id: "MEN-NEW-SMT-001", name: "Men's Regular Burgundy Knit Polo", category: "Top", gender: "Man", fit: "Regular", color: "Burgundy", sizes: "XS–2XL", styles: "Smart Casual", occasions: "Work, Date, Special occasion", image: ITEM_ASSET("men-regular-burgundy-knit-polo"), active: true },
  { id: "MEN-NEW-FRM-001", name: "Men's Slim Navy Formal Shirt", category: "Top", gender: "Man", fit: "Slim", color: "Navy", sizes: "XS–2XL", styles: "Formal", occasions: "Work, Gala, Special occasion", image: ITEM_ASSET("men-slim-navy-formal-shirt"), active: true },
  { id: "MEN-NEW-STR-001", name: "Men's Oversized Blue Graphic Tee", category: "Top", gender: "Man", fit: "Oversized", color: "Blue", sizes: "XS–2XL", styles: "Streetwear", occasions: "School, Date, Special occasion", image: ITEM_ASSET("men-oversized-blue-graphic-tee"), active: true },
  { id: "MEN-NEW-MIN-001", name: "Men's Regular Olive Tank Top", category: "Top", gender: "Man", fit: "Regular", color: "Olive", sizes: "XS–2XL", styles: "Minimalist", occasions: "School, Work, Date", image: ITEM_ASSET("men-regular-olive-tank"), active: true },
  { id: "WMN-NEW-CAS-001", name: "Women's Relaxed Yellow Tank Top", category: "Top", gender: "Woman", fit: "Relaxed", color: "Yellow", sizes: "XS–2XL", styles: "Casual", occasions: "School, Date", image: ITEM_ASSET("women-relaxed-yellow-tank"), active: true },
  { id: "WMN-NEW-SMT-001", name: "Women's Regular Rust Wrap Blouse", category: "Top", gender: "Woman", fit: "Regular", color: "Rust", sizes: "XS–2XL", styles: "Smart Casual", occasions: "Work, Date, Special occasion", image: ITEM_ASSET("women-regular-rust-wrap-blouse"), active: true },
  { id: "WMN-NEW-FRM-001", name: "Women's Slim Burgundy Satin Blouse", category: "Top", gender: "Woman", fit: "Slim", color: "Burgundy", sizes: "XS–2XL", styles: "Formal", occasions: "Gala, Special occasion", image: ITEM_ASSET("women-slim-burgundy-satin-blouse"), active: true },
  { id: "WMN-NEW-STR-001", name: "Women's Oversized Olive Graphic Tee", category: "Top", gender: "Woman", fit: "Oversized", color: "Olive", sizes: "XS–2XL", styles: "Streetwear", occasions: "School, Date, Special occasion", image: ITEM_ASSET("women-oversized-olive-graphic-tee"), active: true },
  { id: "WMN-NEW-MIN-001", name: "Women's Slim Light Blue Tank Top", category: "Top", gender: "Woman", fit: "Slim", color: "Light blue", sizes: "XS–2XL", styles: "Minimalist", occasions: "School, Work, Date", image: ITEM_ASSET("women-slim-light-blue-tank"), active: true },
  { id: "MEN-NEW-CAS-002", name: "Men's Relaxed Light Blue Jorts", category: "Bottom", gender: "Man", fit: "Relaxed", color: "Light blue", sizes: "XS–2XL", styles: "Casual", occasions: "School, Date", image: ITEM_ASSET("men-relaxed-light-blue-jorts"), active: true },
  { id: "MEN-NEW-SMT-002", name: "Men's Regular Beige Knit Polo", category: "Top", gender: "Man", fit: "Regular", color: "Beige", sizes: "XS–2XL", styles: "Smart Casual", occasions: "Work, Date, Special occasion", image: ITEM_ASSET("men-regular-beige-knit-polo-v2"), active: true },
  { id: "MEN-NEW-FRM-002", name: "Men's Slim Black Tuxedo Trousers", category: "Bottom", gender: "Man", fit: "Slim", color: "Black", sizes: "XS–2XL", styles: "Formal", occasions: "Work, Gala, Special occasion", image: ITEM_ASSET("men-slim-black-tuxedo-trousers-v2"), active: true },
  { id: "MEN-NEW-STR-002", name: "Men's Oversized Black Jorts", category: "Bottom", gender: "Man", fit: "Oversized", color: "Black", sizes: "XS–2XL", styles: "Streetwear", occasions: "School, Date, Special occasion", image: ITEM_ASSET("men-oversized-black-jorts"), active: true },
  { id: "MEN-NEW-MIN-002", name: "Men's Slim White Ribbed Tank Top", category: "Top", gender: "Man", fit: "Slim", color: "White", sizes: "XS–2XL", styles: "Minimalist", occasions: "School, Work, Date", image: ITEM_ASSET("men-slim-white-ribbed-tank-v2"), active: true },
  { id: "WMN-NEW-CAS-002", name: "Women's Relaxed Light Blue Jorts", category: "Bottom", gender: "Woman", fit: "Relaxed", color: "Light blue", sizes: "XS–2XL", styles: "Casual", occasions: "School, Date", image: ITEM_ASSET("women-relaxed-light-blue-jorts"), active: true },
  { id: "WMN-NEW-SMT-002", name: "Women's Regular Brown Tailored Vest", category: "Top", gender: "Woman", fit: "Regular", color: "Brown", sizes: "XS–2XL", styles: "Smart Casual", occasions: "Work, Date, Special occasion", image: ITEM_ASSET("women-regular-brown-tailored-vest"), active: true },
  { id: "WMN-NEW-FRM-002", name: "Women's Slim Red Satin Maxi Skirt", category: "Bottom", gender: "Woman", fit: "Slim", color: "Red", sizes: "XS–2XL", styles: "Formal", occasions: "Gala, Special occasion", image: ITEM_ASSET("women-slim-red-satin-maxi-skirt"), active: true },
  { id: "WMN-NEW-STR-002", name: "Women's Oversized Black Cargo Jorts", category: "Bottom", gender: "Woman", fit: "Oversized", color: "Black", sizes: "XS–2XL", styles: "Streetwear", occasions: "School, Date, Special occasion", image: ITEM_ASSET("women-oversized-black-cargo-jorts"), active: true },
  { id: "WMN-NEW-MIN-002", name: "Women's Slim Beige Ribbed Tank Top", category: "Top", gender: "Woman", fit: "Slim", color: "Beige", sizes: "XS–2XL", styles: "Minimalist", occasions: "School, Work, Date", image: ITEM_ASSET("women-slim-beige-ribbed-tank-v2"), active: true },
  { id: "MEN-ACC-NEW-001", name: "Men's Black Crossbody Sling Bag", category: "Accessory", gender: "Man", fit: "All fits", color: "Black", sizes: "One size", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("men-black-crossbody-sling-bag"), active: true },
  { id: "MEN-ACC-NEW-002", name: "Men's Olive Canvas Tote Bag", category: "Accessory", gender: "Man", fit: "All fits", color: "Olive", sizes: "One size", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("men-olive-canvas-tote-bag"), active: true },
  { id: "MEN-ACC-NEW-003", name: "Men's Brown Leather Messenger Bag", category: "Accessory", gender: "Man", fit: "All fits", color: "Brown", sizes: "One size", styles: "Smart Casual, Formal, Minimalist", image: ITEM_ASSET("men-brown-leather-messenger-bag"), active: true },
  { id: "MEN-SHO-NEW-001", name: "Men's White Court Sneakers", category: "Shoes", gender: "Man", fit: "All fits", color: "White", sizes: "38–45", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("men-white-court-sneakers"), active: true },
  { id: "MEN-SHO-NEW-002", name: "Men's Brown Leather Derby Shoes", category: "Shoes", gender: "Man", fit: "All fits", color: "Brown", sizes: "38–45", styles: "Smart Casual, Formal", image: ITEM_ASSET("men-brown-leather-derby-shoes"), active: true },
  { id: "MEN-SHO-NEW-003", name: "Men's Black Chunky Street Sneakers", category: "Shoes", gender: "Man", fit: "All fits", color: "Black", sizes: "38–45", styles: "Casual, Streetwear", image: ITEM_ASSET("men-black-chunky-street-sneakers"), active: true },
  { id: "WMN-ACC-NEW-001", name: "Women's Beige Structured Tote Bag", category: "Accessory", gender: "Woman", fit: "All fits", color: "Beige", sizes: "One size", styles: "Smart Casual, Formal, Minimalist", image: ITEM_ASSET("women-beige-structured-tote-bag"), active: true },
  { id: "WMN-ACC-NEW-002", name: "Women's Burgundy Shoulder Sling Bag", category: "Accessory", gender: "Woman", fit: "All fits", color: "Burgundy", sizes: "One size", styles: "Casual, Smart Casual, Formal", image: ITEM_ASSET("women-burgundy-shoulder-sling-bag"), active: true },
  { id: "WMN-ACC-NEW-003", name: "Women's Black Mini Crossbody Bag", category: "Accessory", gender: "Woman", fit: "All fits", color: "Black", sizes: "One size", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("women-black-mini-crossbody-bag"), active: true },
  { id: "WMN-SHO-NEW-001", name: "Women's Beige Ballet Flats", category: "Shoes", gender: "Woman", fit: "All fits", color: "Beige", sizes: "35–42", styles: "Smart Casual, Formal, Minimalist", image: ITEM_ASSET("women-beige-ballet-flats"), active: true },
  { id: "WMN-SHO-NEW-002", name: "Women's Black Heeled Pumps", category: "Shoes", gender: "Woman", fit: "All fits", color: "Black", sizes: "35–42", styles: "Smart Casual, Formal", image: ITEM_ASSET("women-black-heeled-pumps"), active: true },
  { id: "WMN-SHO-NEW-003", name: "Women's White Platform Sneakers", category: "Shoes", gender: "Woman", fit: "All fits", color: "White", sizes: "35–42", styles: "Casual, Streetwear, Minimalist", image: ITEM_ASSET("women-white-platform-sneakers"), active: true }
];

const catalogItem = id => SEED_CATALOG.find(item => item.id === id);
const outfit = (id, name, style, gender, fit, itemIds, colors, baseScore) => ({
  id, name, style, gender, fit, itemIds, items: itemIds.map(catalogItem).filter(Boolean), colors, baseScore
});

const OUTFITS = [
  outfit("men-slim-tailored", "Slim Tailored Navy", "Smart Casual", "Man", "Slim", ["MEN-SLM-TOP-001","MEN-SLM-BOT-001","MEN-SHO-001","UNI-ACC-002"], ["#25364a","#202322","#c49a5a"], 94),
  outfit("men-slim-city", "Slim Red City", "Casual", "Man", "Slim", ["MEN-SLM-TOP-003","MEN-SLM-BOT-002","UNI-SHO-001","UNI-ACC-001"], ["#d93032","#7b7f82","#202322"], 91),
  outfit("men-slim-minimal", "Slim Minimal Edit", "Minimalist", "Man", "Slim", ["MEN-SLM-TOP-002","MEN-SLM-BOT-001","UNI-SHO-001","UNI-ACC-002"], ["#ffffff","#202322","#c49a5a"], 88),
  outfit("men-casual", "Regular Easygoing Layers", "Casual", "Man", "Regular", ["UNI-OUT-001","MEN-TOP-001","MEN-BOT-001","UNI-SHO-001"], ["#285d5b","#eee9df","#c7ad8b"], 94),
  outfit("men-smart", "Regular Blue Essentials", "Smart Casual", "Man", "Regular", ["MEN-REG-TOP-003","MEN-REG-BOT-002","MEN-SHO-001","UNI-ACC-001"], ["#9fc4df","#25364a","#202322"], 91),
  outfit("men-minimal", "Regular Blue Minimal", "Minimalist", "Man", "Regular", ["MEN-REG-TOP-004","MEN-REG-BOT-002","UNI-SHO-001","UNI-ACC-002"], ["#1557c0","#25364a","#c49a5a"], 88),
  outfit("men-relaxed-casual", "Relaxed Yellow Weekend", "Casual", "Man", "Relaxed", ["MEN-RLX-TOP-003","MEN-RLX-BOT-002","UNI-SHO-001","UNI-ACC-001"], ["#f2c318","#d9c8ad","#ffffff"], 94),
  outfit("men-relaxed-smart", "Relaxed Brown Balance", "Smart Casual", "Man", "Relaxed", ["MEN-RLX-TOP-002","MEN-RLX-BOT-001","MEN-SHO-001","UNI-ACC-002"], ["#7a5138","#c7ad8b","#202322"], 91),
  outfit("men-relaxed-minimal", "Relaxed Neutral Ease", "Minimalist", "Man", "Relaxed", ["MEN-RLX-TOP-002","MEN-RLX-BOT-002","UNI-SHO-001","UNI-ACC-002"], ["#7a5138","#d9c8ad","#c49a5a"], 88),
  outfit("men-oversized-street", "Oversized Red Street", "Streetwear", "Man", "Oversized", ["MEN-OVR-OUT-001","MEN-OVR-TOP-001","MEN-OVR-BOT-002","UNI-SHO-001"], ["#d93032","#285d5b","#25364a"], 94),
  outfit("men-oversized-casual", "Oversized Gray Volume", "Casual", "Man", "Oversized", ["MEN-OVR-TOP-002","MEN-OVR-BOT-001","UNI-SHO-001","UNI-ACC-002"], ["#7b7f82","#343737","#c49a5a"], 91),
  outfit("men-oversized-minimal", "Oversized Navy Minimal", "Minimalist", "Man", "Oversized", ["MEN-OVR-TOP-002","MEN-OVR-BOT-002","UNI-SHO-001","UNI-ACC-001"], ["#7b7f82","#25364a","#202322"], 88),
  outfit("women-slim-polished", "Slim Burgundy Polish", "Smart Casual", "Woman", "Slim", ["WMN-SLM-TOP-001","WMN-SLM-BOT-001","WMN-SHO-001","UNI-ACC-001"], ["#6f3345","#202322","#c49a5a"], 94),
  outfit("women-slim-formal", "Slim Gray Evening", "Formal", "Woman", "Slim", ["WMN-SLM-TOP-002","WMN-SLM-BOT-002","WMN-SHO-001","UNI-ACC-002"], ["#ffffff","#7b7f82","#c49a5a"], 91),
  outfit("women-slim-minimal", "Slim Blue Minimal", "Minimalist", "Woman", "Slim", ["WMN-SLM-TOP-003","WMN-SLM-BOT-001","UNI-SHO-001","UNI-ACC-001"], ["#1557c0","#202322","#ffffff"], 88),
  outfit("women-casual", "Regular Soft Layers", "Casual", "Woman", "Regular", ["WMN-TOP-002","WMN-REG-BOT-003","UNI-OUT-001","UNI-SHO-001"], ["#eee9df","#d9c8ad","#285d5b"], 94),
  outfit("women-smart", "Regular Polished Teal", "Smart Casual", "Woman", "Regular", ["WMN-TOP-001","WMN-BOT-001","WMN-SHO-001","UNI-ACC-001"], ["#285d5b","#c7ad8b","#202322"], 92),
  outfit("women-formal", "Regular Red Occasion", "Formal", "Woman", "Regular", ["WMN-REG-TOP-004","WMN-BOT-002","WMN-SHO-001","UNI-ACC-002"], ["#d93032","#202322","#c49a5a"], 90),
  outfit("women-relaxed-casual", "Relaxed Teal Ease", "Casual", "Woman", "Relaxed", ["WMN-RLX-TOP-001","WMN-RLX-BOT-001","UNI-SHO-001","UNI-ACC-001"], ["#285d5b","#c7ad8b","#ffffff"], 94),
  outfit("women-relaxed-smart", "Relaxed Brown Balance", "Smart Casual", "Woman", "Relaxed", ["WMN-RLX-TOP-002","WMN-RLX-BOT-002","WMN-SHO-001","UNI-ACC-002"], ["#7a5138","#7b7f82","#202322"], 91),
  outfit("women-relaxed-minimal", "Relaxed Yellow Flow", "Minimalist", "Woman", "Relaxed", ["WMN-RLX-TOP-003","WMN-RLX-BOT-001","UNI-SHO-001","UNI-ACC-002"], ["#f2c318","#c7ad8b","#c49a5a"], 88),
  outfit("women-oversized-street", "Oversized Ivory Denim", "Streetwear", "Woman", "Oversized", ["WMN-OVR-TOP-001","WMN-OVR-BOT-002","UNI-SHO-001","UNI-ACC-001"], ["#eee9df","#25364a","#285d5b"], 94),
  outfit("women-oversized-casual", "Oversized Beige Volume", "Casual", "Woman", "Oversized", ["WMN-OVR-TOP-002","WMN-OVR-BOT-001","UNI-SHO-001","UNI-ACC-002"], ["#d9c8ad","#202322","#c49a5a"], 91),
  outfit("women-oversized-minimal", "Oversized Blue Minimal", "Minimalist", "Woman", "Oversized", ["WMN-OVR-TOP-003","WMN-OVR-BOT-002","UNI-SHO-001","UNI-ACC-001"], ["#1557c0","#25364a","#ffffff"], 88)
];

const OCCASIONS = ["School", "Work", "Date", "Gala", "Special occasion"];
const STYLES = ["Casual", "Smart Casual", "Formal", "Streetwear", "Minimalist"];
const SIZES = ["XS", "S", "M", "L", "XL", "2XL"];
const FITS = ["Slim", "Regular", "Relaxed", "Oversized"];
const GENDERS = ["Woman", "Man", "Prefer not to say"];

const defaultState = {
  currentUser: null,
  users: [{ id: 1, name: "Maya Santos", email: "demo@pormatch.local", password: "demo1234", gender: "Woman", role: "admin", active: true }],
  profile: { name: "Maya Santos", email: "demo@pormatch.local", gender: "Woman", size: "M", fit: "Regular" },
  selection: { occasion: "Work", style: "Smart Casual", color: "Red" },
  results: [],
  saved: [],
  history: [],
  catalog: SEED_CATALOG,
  generations: 0,
  uiVersion: 8
};

function normalizeOutfits(items, catalog = SEED_CATALOG) {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
    const legacyIds = { "outfit-casual": "men-casual", "outfit-smart": "men-smart", "outfit-minimal": "men-minimal" };
    const normalizedId = legacyIds[item?.id] || item?.id;
    const source = OUTFITS.find(outfit => outfit.id === normalizedId);
    if (!source) {
      if (!normalizedId || !Array.isArray(item?.itemIds)) return null;
      const savedItems = Array.isArray(item.items) && item.items.every(entry => entry?.image) ? item.items : [];
      const resolvedItems = item.itemIds.map(id => catalog.find(entry => entry.id === id)).filter(Boolean);
      const outfitItems = savedItems.length ? savedItems : resolvedItems;
      return outfitItems.length >= 2 ? { ...item, id: normalizedId, items: outfitItems, itemIds: item.itemIds } : null;
    }
    return {
      ...source,
      ...item,
      id: normalizedId,
      items: Array.isArray(item.items) && item.items.every(entry => entry?.image) ? item.items : source.items,
      itemIds: Array.isArray(item.itemIds) ? item.itemIds : source.itemIds,
      colors: Array.isArray(item.colors) ? item.colors : source.colors,
      score: Number.isFinite(item.score) ? item.score : source.baseScore
    };
  }).filter(Boolean);
}

function normalizeCatalog(items) {
  const stored = Array.isArray(items) ? items : [];
  const legacySeedIds = new Set(["TOP-001","TOP-002","BOT-001","TOP-003","BOT-002","SHO-001","SHO-002","ACC-001"]);
  const seeded = SEED_CATALOG.map(item => {
    const previous = stored.find(entry => entry.id === item.id);
    return previous ? { ...item, active: previous.active !== false } : structuredClone(item);
  });
  const custom = stored
    .filter(item => !legacySeedIds.has(item.id) && !SEED_CATALOG.some(seed => seed.id === item.id) && !/^(MEN|WMN)-NEW-/.test(item.id))
    .map(item => ({ ...item, gender: item.gender || "Unisex", fit: item.fit || "All fits", image: item.image || "" }));
  return [...seeded, ...custom];
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem("pormatch-mvp"));
    if (!stored || typeof stored !== "object") return structuredClone(defaultState);

    const catalog = normalizeCatalog(stored.catalog);
    const next = {
      ...structuredClone(defaultState),
      ...stored,
      profile: { ...defaultState.profile, ...(stored.profile || {}) },
      selection: { ...defaultState.selection, ...(stored.selection || {}) },
      users: Array.isArray(stored.users) && stored.users.length ? stored.users : structuredClone(defaultState.users),
      results: normalizeOutfits(stored.results, catalog),
      saved: normalizeOutfits(stored.saved, catalog),
      history: Array.isArray(stored.history)
        ? stored.history.filter(entry => !entry.outfitIds?.some(id => String(id).startsWith("new-")))
        : [],
      catalog
    };

    if (stored.uiVersion !== defaultState.uiVersion && (!stored.currentUser || stored.currentUser.email === "demo@pormatch.local")) {
      next.currentUser = stored.currentUser ? { ...defaultState.users[0] } : null;
      next.profile = { ...defaultState.profile };
      next.selection = { ...defaultState.selection };
      next.results = [];
      next.uiVersion = defaultState.uiVersion;
    }

    if (!OCCASIONS.includes(next.selection.occasion)) next.selection.occasion = defaultState.selection.occasion;
    if (!STYLES.includes(next.selection.style)) next.selection.style = defaultState.selection.style;
    if (!Object.hasOwn(PALETTE, next.selection.color)) next.selection.color = defaultState.selection.color;
    if (!SIZES.includes(next.profile.size)) next.profile.size = defaultState.profile.size;
    if (!FITS.includes(next.profile.fit)) next.profile.fit = defaultState.profile.fit;
    if (!GENDERS.includes(next.profile.gender)) next.profile.gender = defaultState.profile.gender;
    if (next.currentUser && !GENDERS.includes(next.currentUser.gender)) next.currentUser.gender = next.profile.gender;
    if (!Number.isFinite(next.generations) || next.generations < 0) next.generations = 0;
    return next;
  } catch {
    return structuredClone(defaultState);
  }
}

let state = loadState();

function saveState() {
  localStorage.setItem("pormatch-mvp", JSON.stringify(state));
}

saveState();

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function initials(name = "Pormatch User") {
  return name.split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase();
}



const STYLE_AFFINITY = {
  Casual: { Casual: 1, Streetwear: 0.75, Minimalist: 0.72, "Smart Casual": 0.48, Formal: 0.2 },
  "Smart Casual": { "Smart Casual": 1, Minimalist: 0.78, Formal: 0.72, Casual: 0.5, Streetwear: 0.3 },
  Formal: { Formal: 1, "Smart Casual": 0.76, Minimalist: 0.52, Casual: 0.2, Streetwear: 0.1 },
  Streetwear: { Streetwear: 1, Casual: 0.78, Minimalist: 0.5, "Smart Casual": 0.28, Formal: 0.1 },
  Minimalist: { Minimalist: 1, Casual: 0.75, "Smart Casual": 0.68, Formal: 0.48, Streetwear: 0.42 }
};

const ACTIVITY_STYLE_AFFINITY = {
  School: { Casual: 1, Streetwear: 1, Minimalist: 0.9, "Smart Casual": 0.55, Formal: 0.25 },
  Work: { "Smart Casual": 1, Formal: 0.95, Minimalist: 0.9, Casual: 0.45, Streetwear: 0.2 },
  Date: { "Smart Casual": 1, Casual: 0.9, Minimalist: 0.86, Formal: 0.76, Streetwear: 0.74 },
  Gala: { Formal: 1, "Smart Casual": 0.7, Minimalist: 0.55, Casual: 0.15, Streetwear: 0.1 },
  "Special occasion": { Formal: 1, "Smart Casual": 0.92, Minimalist: 0.82, Streetwear: 0.56, Casual: 0.52 }
};

const FIT_AFFINITY = {
  Slim: { Slim: 1, Regular: 0.76, Relaxed: 0.46, Oversized: 0.2 },
  Regular: { Regular: 1, Slim: 0.78, Relaxed: 0.76, Oversized: 0.48 },
  Relaxed: { Relaxed: 1, Regular: 0.8, Oversized: 0.7, Slim: 0.42 },
  Oversized: { Oversized: 1, Relaxed: 0.78, Regular: 0.5, Slim: 0.18 }
};

const INFERRED_ACTIVITIES = {
  Casual: ["School", "Date", "Special occasion"],
  "Smart Casual": ["Work", "Date", "Special occasion"],
  Formal: ["Work", "Gala", "Special occasion"],
  Streetwear: ["School", "Date"],
  Minimalist: ["School", "Work", "Date", "Special occasion"]
};

const NEUTRAL_COLORS = new Set(["White", "Black", "Gray", "Brown", "Beige", "Sand", "Navy"]);
const listValues = value => String(value || "").split(",").map(entry => entry.trim()).filter(Boolean);
const itemStyles = item => listValues(item?.styles);
const itemActivities = item => item?.occasions
  ? listValues(item.occasions)
  : [...new Set(itemStyles(item).flatMap(itemStyle => INFERRED_ACTIVITIES[itemStyle] || []))];
const styleAffinity = (item, preferredStyle) => Math.max(0, ...itemStyles(item).map(itemStyle => STYLE_AFFINITY[preferredStyle]?.[itemStyle] || 0));
const activityAffinity = (item, activity) => itemActivities(item).includes(activity) ? 1 : 0.12;
const fitAffinity = (item, preferredFit) => item.fit === "All fits" ? 1 : FIT_AFFINITY[preferredFit]?.[item.fit] || 0.1;

function normalizedColor(color) {
  return ({ Ivory: "White", Cream: "White", Charcoal: "Black", "Muted gold": "Yellow" })[color] || color;
}

function colorHarmony(firstColor, secondColor, selectedColor) {
  const first = normalizedColor(firstColor);
  const second = normalizedColor(secondColor);
  if (first === second) return first === selectedColor ? 0.82 : 0.62;
  if (NEUTRAL_COLORS.has(first) || NEUTRAL_COLORS.has(second)) return 1;
  const firstMatches = (PALETTE[first]?.matches || []).map(normalizedColor);
  const secondMatches = (PALETTE[second]?.matches || []).map(normalizedColor);
  return firstMatches.includes(second) || secondMatches.includes(first) ? 1 : 0.35;
}

function supportColorAffinity(item, selectedColor) {
  if (!item) return 0;
  const itemColor = normalizedColor(item.color);
  if (itemColor === selectedColor) return 1;
  const coordinatingColors = (PALETTE[selectedColor]?.matches || []).map(normalizedColor);
  if (coordinatingColors.includes(itemColor)) return 0.82;
  return NEUTRAL_COLORS.has(itemColor) ? 0.68 : 0.35;
}

function coreSignature(outfit) {
  return outfit.items.filter(item => ["Top", "Bottom", "Dress"].includes(item.category)).map(item => item.id).sort().join("|");
}

function buildCatalogCandidate(coreItems, shoe, accessory, gender) {
  const { color, style, occasion } = state.selection;
  const items = [...coreItems, shoe, accessory].filter(Boolean);
  const average = (values, fallback = 0) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
  const coreStyle = average(coreItems.map(item => styleAffinity(item, style)));
  const garmentActivity = average(coreItems.map(item => activityAffinity(item, occasion)));
  const activityStyle = ACTIVITY_STYLE_AFFINITY[occasion]?.[style] || 0.2;
  const activityPoints = (garmentActivity * 0.8 + activityStyle * 0.2) * 30;
  const stylePoints = coreStyle * 25;
  const normalizedCoreColors = coreItems.map(item => normalizedColor(item.color));
  const exactItem = coreItems.find(item => normalizedColor(item.color) === color);
  const coordinatingColors = (PALETTE[color]?.matches || []).map(normalizedColor);
  const coordinatedItem = coreItems.find(item => coordinatingColors.includes(normalizedColor(item.color)));
  const selectedColorPoints = exactItem ? 12 : coordinatedItem ? 7 : 3;
  const harmonyPoints = (coreItems.length > 1 ? colorHarmony(coreItems[0].color, coreItems[1].color, color) : 1) * 8;
  const colorPoints = selectedColorPoints + harmonyPoints;
  const fitPoints = average(coreItems.map(item => fitAffinity(item, state.profile.fit))) * 15;
  const shoeSupport = styleAffinity(shoe, style) * 1.8 + supportColorAffinity(shoe, color) * 0.8 + (shoe?.gender === gender ? 0.4 : 0);
  const accessorySupport = styleAffinity(accessory, style) * 1.2 + supportColorAffinity(accessory, color) * 0.5 + (accessory?.gender === gender ? 0.3 : 0);
  const supportPoints = Math.min(10, 5 + shoeSupport + accessorySupport);
  const score = Math.max(0, Math.min(99, Math.round(activityPoints + stylePoints + colorPoints + fitPoints + supportPoints)));
  const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const id = ["rules-v2", ...items.map(item => item.id), slug(style), slug(occasion)].join("-");
  const coreLabel = coreItems.length === 1 ? `${coreItems[0].color} dress edit` : `${coreItems[0].color} and ${coreItems[1].color}`;
  const activityDescription = garmentActivity >= 0.95 ? `The core pieces are appropriate for ${occasion.toLowerCase()}` : `The pieces are the closest available match for ${occasion.toLowerCase()}`;
  const styleDescription = coreStyle >= 0.95 ? `strongly match ${style.toLowerCase()}` : `coordinate with the ${style.toLowerCase()} direction`;
  const colorDescription = exactItem
    ? `${exactItem.name} includes your selected ${color.toLowerCase()}`
    : coordinatedItem
      ? `${coordinatedItem.name} uses a color that coordinates with ${color.toLowerCase()}`
      : `neutral pieces keep the palette balanced around ${color.toLowerCase()}`;
  return {
    id,
    name: `${coreLabel} · ${gender === "Woman" ? "Women's" : "Men's"} ${state.profile.fit}`,
    style,
    gender,
    fit: state.profile.fit,
    itemIds: items.map(item => item.id),
    items,
    colors: items.map(item => PALETTE[normalizedColor(item.color)]?.hex).filter(Boolean),
    baseScore: score,
    score,
    supportQuality: supportPoints,
    exactColorMatch: Boolean(exactItem),
    colorMatchLabel: exactItem ? `${color} included · ${exactItem.name}` : `Coordinated with ${color.toLowerCase()}`,
    explanation: `${activityDescription}, ${styleDescription}, and ${colorDescription}. Match score: activity ${Math.round(activityPoints)}/30, style ${Math.round(stylePoints)}/25, color ${Math.round(colorPoints)}/20, fit ${Math.round(fitPoints)}/15, completeness ${Math.round(supportPoints)}/10.`,
    coreSignature: coreItems.map(item => item.id).sort().join("|")
  };
}

function catalogOutfitCandidates() {
  const { style } = state.selection;
  const genders = state.profile.gender === "Prefer not to say" ? ["Woman", "Man"] : [state.profile.gender];
  const active = state.catalog.filter(item => item.active !== false);
  const combinations = [];

  for (const gender of genders) {
    const belongsToGender = item => item.gender === gender || item.gender === "Unisex";
    const wearable = item => fitAffinity(item, state.profile.fit) >= 0.4;
    const tops = active.filter(item => item.gender === gender && item.category === "Top" && wearable(item));
    const bottoms = active.filter(item => item.gender === gender && item.category === "Bottom" && wearable(item));
    const dresses = active.filter(item => item.gender === gender && item.category === "Dress" && wearable(item));
    const shoes = active.filter(item => item.category === "Shoes" && belongsToGender(item));
    const accessories = active.filter(item => item.category === "Accessory" && belongsToGender(item));
    const supportShoes = shoes.length ? shoes : [null];
    const supportAccessories = accessories.length ? accessories : [null];

    for (const top of tops) for (const bottom of bottoms) {
      if (Math.max(styleAffinity(top, style), styleAffinity(bottom, style)) < 0.42) continue;
      for (const shoe of supportShoes) for (const accessory of supportAccessories) combinations.push(buildCatalogCandidate([top, bottom], shoe, accessory, gender));
    }
    for (const dress of dresses) {
      if (styleAffinity(dress, style) < 0.42) continue;
      for (const shoe of supportShoes) for (const accessory of supportAccessories) combinations.push(buildCatalogCandidate([dress], shoe, accessory, gender));
    }
  }

  if (combinations.length < 3) return [];
  const bestPerCore = new Map();
  combinations.forEach(candidate => {
    const current = bestPerCore.get(candidate.coreSignature);
    if (!current
      || candidate.score > current.score
      || (candidate.score === current.score && candidate.supportQuality > current.supportQuality)
      || (candidate.score === current.score && candidate.supportQuality === current.supportQuality && candidate.id.localeCompare(current.id) < 0)) {
      bestPerCore.set(candidate.coreSignature, candidate);
    }
  });
  const ranked = [...bestPerCore.values()].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const exactColorCandidates = ranked.filter(candidate => candidate.exactColorMatch);
  const colorQualified = exactColorCandidates.length >= 3 ? exactColorCandidates : ranked;
  const previousCore = new Set(state.results.map(coreSignature));
  const fresh = colorQualified.filter(candidate => !previousCore.has(candidate.coreSignature));
  const pool = fresh.length >= 3 ? fresh : colorQualified;
  const shortlist = pool.slice(0, Math.min(40, pool.length));
  const rotation = shortlist.length ? (state.generations * 3) % shortlist.length : 0;
  const rotated = shortlist.slice(rotation).concat(shortlist.slice(0, rotation));
  const selected = [];

  while (selected.length < 3 && rotated.length) {
    let bestIndex = 0;
    let bestAdjustedScore = -Infinity;
    rotated.forEach((candidate, index) => {
      const candidateCore = new Set(candidate.coreSignature.split("|"));
      const sharedCoreItems = selected.reduce((count, existing) => count + existing.coreSignature.split("|").filter(id => candidateCore.has(id)).length, 0);
      const adjustedScore = candidate.score - sharedCoreItems * 13 - index * 0.01;
      if (adjustedScore > bestAdjustedScore) {
        bestAdjustedScore = adjustedScore;
        bestIndex = index;
      }
    });
    selected.push(rotated.splice(bestIndex, 1)[0]);
  }

  return selected.map((candidate, index) => {
    const { coreSignature: _signature, supportQuality: _supportQuality, ...outfit } = candidate;
    return { ...outfit, rank: index + 1 };
  });
}

function rankedOutfits() {
  const candidates = catalogOutfitCandidates();
  if (candidates.length >= 3) return candidates.slice(0, 3);

  const { occasion, style, color } = state.selection;
  const coreCategories = new Set(["Top", "Bottom", "Outerwear", "Dress"]);
  const hasExactColor = outfit => outfit.items.some(item => coreCategories.has(item.category) && item.color === color);
  const fitMatches = OUTFITS.filter(outfit => outfit.fit === state.profile.fit);
  const eligible = state.profile.gender === "Prefer not to say" ? fitMatches : fitMatches.filter(outfit => outfit.gender === state.profile.gender);
  const ordered = [...eligible].sort((a, b) => {
    const aStyleMatch = a.style === style || (style === "Minimalist" && a.style === "Casual") ? 2 : 0;
    const bStyleMatch = b.style === style || (style === "Minimalist" && b.style === "Casual") ? 2 : 0;
    const aMatch = aStyleMatch + (hasExactColor(a) ? 4 : 0);
    const bMatch = bStyleMatch + (hasExactColor(b) ? 4 : 0);
    return bMatch - aMatch || b.baseScore - a.baseScore;
  }).slice(0, 3);
  return ordered.map((source, rank) => {
    const score = 96 - rank * 5;
    const catalogLabel = source.gender === "Woman" ? "women's catalog" : "men's catalog";
    const exactColorMatch = hasExactColor(source);
    const matchingItem = source.items.find(item => coreCategories.has(item.category) && item.color === color);
    return {
      ...source,
      score,
      rank: rank + 1,
      exactColorMatch,
      colorMatchLabel: exactColorMatch ? `${color} included${matchingItem ? ` · ${matchingItem.name}` : ""}` : `Coordinated alternative · no ${color.toLowerCase()} core item`,
      explanation: exactColorMatch
        ? `${matchingItem.name} gives this outfit the ${color.toLowerCase()} you selected, balanced with coordinating pieces. The look suits ${occasion.toLowerCase()} and your ${state.profile.fit.toLowerCase()} fit preference in the ${catalogLabel}.`
        : `A ${color.toLowerCase()} core garment is not yet available for this catalog and fit, so this look uses its closest coordinating palette. It still suits ${occasion.toLowerCase()} and your ${state.profile.fit.toLowerCase()} fit preference.`
    };
  });
}

function generateOfflineOutfits() {
  return rankedOutfits();
}



