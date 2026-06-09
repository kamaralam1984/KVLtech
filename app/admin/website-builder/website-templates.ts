import type { WebsiteProject, Section, BuilderElement, GlobalStyles } from './builder-types';

export interface WebsiteTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  previewBg: string;
  previewAccent: string;
  buildProject: () => WebsiteProject;
}

let _n = 0;
const gid = (p = 'x') => `${p}${++_n}_tmpl`;

function makeEl(type: string, config: Record<string, unknown> | unknown[]): BuilderElement {
  const c: Record<string, unknown> = Array.isArray(config) ? { plans: config } : config;
  return { id: gid('el'), type: type as never, styles: {}, config: c };
}

function makeCol(elements: BuilderElement[], width = 100) {
  return { id: gid('col'), width, elements };
}

function makeSection(
  name: string,
  elements: BuilderElement[],
  bg: string,
  padding = { top: 0, bottom: 0 }
): Section {
  return {
    id: gid('sec'), name,
    columns: [makeCol(elements)],
    background: { type: 'color', value: bg },
    padding, margin: { top: 0, bottom: 0 },
    maxWidth: 'xl',
  };
}

function makeSectionCols(
  name: string,
  columns: ReturnType<typeof makeCol>[],
  bg: string,
  padding = { top: 40, bottom: 40 }
): Section {
  return {
    id: gid('sec'), name,
    columns,
    background: { type: 'color', value: bg },
    padding, margin: { top: 0, bottom: 0 },
    maxWidth: 'xl',
  };
}

// suppress unused warning
const _makeSectionCols = makeSectionCols;
void _makeSectionCols;

function makeProject(name: string, gs: GlobalStyles, sections: Section[]): WebsiteProject {
  return {
    id: gid('proj'), name,
    pages: [{
      id: gid('pg'), name: 'Home', slug: 'home',
      sections,
      seo: { title: name, description: '', keywords: '' },
    }],
    globalStyles: gs,
    createdAt: '2026-06-09T00:00:00.000Z',
    updatedAt: '2026-06-09T00:00:00.000Z',
  };
}

export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [

// ═══════════════════ RESTAURANT (1-4) ═══════════════════

{
  id: 'rest-1', name: 'Classic Dhaba', category: 'restaurant',
  description: 'Traditional Indian restaurant with warm earthy tones',
  tags: ['restaurant', 'indian', 'traditional', 'dhaba'],
  primaryColor: '#C2440C', secondaryColor: '#1A0A00', accentColor: '#F4A261',
  headingFont: 'Playfair Display', bodyFont: 'Lato',
  previewBg: '#1A0A00', previewAccent: '#C2440C',
  buildProject: () => makeProject('Classic Dhaba', {
    primaryColor: '#C2440C', secondaryColor: '#1A0A00', accentColor: '#F4A261',
    headingFont: 'Playfair Display', bodyFont: 'Lato', baseFontSize: 16, maxWidth: 1280, borderRadius: 'md',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: 'Classic Dhaba', links: [{label:'Menu',href:'#'},{label:'About',href:'#'},{label:'Reservations',href:'#'}], sticky: true })], '#1A0A00'),
    makeSection('Hero', [makeEl('hero', { heading: 'Flavours Passed Down Through Generations', subheading: 'Authentic Indian Cuisine Since 1978', text: 'Every dish tells a story of tradition, spice, and love.', cta: { label: 'View Menu', href: '#', variant: 'primary', size: 'lg' }, overlay: 65, align: 'center', bgImage: '' })], '#2D1100'),
    makeSection('Marquee', [makeEl('marquee', { items: ['🍛 Dal Makhani', '🔥 Tandoori Chicken', '🫓 Butter Naan', '🍚 Biryani', '🥘 Paneer Tikka', '🌶️ Rogan Josh'], speed: 20, direction: 'left', separator: '  ·  ' })], '#F4A261'),
    makeSection('Features', [makeEl('iconbox', { icon: '🍴', title: 'Family Recipes', description: 'Secret spice blends passed down for 3 generations', align: 'center' })], '#FFF8F0', { top: 60, bottom: 60 }),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 47, label: 'Years Serving', suffix: '+' }, { value: 200, label: 'Menu Items', suffix: '+' }, { value: 5000, label: 'Happy Diners/Month', suffix: '+' }, { value: 4.9, label: 'Rating', suffix: '★' }] })], '#1A0A00', { top: 50, bottom: 50 }),
    makeSection('Gallery', [makeEl('gallery', { images: [{ src: '/photos/restaurant.jpg', alt: 'Food 1', fit: 'cover' }, { src: '/photos/restaurant.jpg', alt: 'Food 2', fit: 'cover' }, { src: '/photos/restaurant.jpg', alt: 'Ambiance', fit: 'cover' }], columns: 3, gap: 8, style: 'grid' })], '#FFF8F0', { top: 40, bottom: 40 }),
    makeSection('Testimonial', [makeEl('testimonial', { name: 'Priya Sharma', role: 'Food Blogger, Delhi', text: 'The Dal Makhani here is the best I have ever tasted — smoky, rich, and absolutely divine!', rating: 5 })], '#2D1100', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: 'Classic Dhaba', tagline: 'Taste the Tradition', columns: [{ heading: 'Hours', links: [{ label: 'Mon-Sun: 11am-11pm', href: '#' }] }, { heading: 'Location', links: [{ label: 'Connaught Place, Delhi', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }, { platform: 'facebook', url: '#' }], copyright: '2026 Classic Dhaba' })], '#1A0A00'),
  ]),
},

{
  id: 'rest-2', name: 'Modern Bistro', category: 'restaurant',
  description: 'Contemporary restaurant with dark luxury aesthetic',
  tags: ['restaurant', 'bistro', 'modern', 'luxury'],
  primaryColor: '#E94560', secondaryColor: '#0A0A15', accentColor: '#FFD700',
  headingFont: 'Montserrat', bodyFont: 'Inter',
  previewBg: '#0A0A15', previewAccent: '#E94560',
  buildProject: () => makeProject('Modern Bistro', {
    primaryColor: '#E94560', secondaryColor: '#0A0A15', accentColor: '#FFD700',
    headingFont: 'Montserrat', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1280, borderRadius: 'lg',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: 'BISTRO', links: [{label:'Cuisine',href:'#'},{label:'Wine List',href:'#'},{label:'Private Dining',href:'#'},{label:'Reserve',href:'#'}], sticky: true, cta: { label: 'Book Table', href: '#', variant: 'primary', size: 'sm' } })], '#0A0A15'),
    makeSection('Hero', [makeEl('hero', { heading: 'Where Food Meets Art', subheading: 'A Culinary Experience Like No Other', text: 'Michelin-inspired cuisine crafted with locally sourced seasonal ingredients.', cta: { label: 'Reserve a Table', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'View Menu', href: '#', variant: 'outline', size: 'lg' }, overlay: 70, align: 'left', bgImage: '' })], '#0A0A15'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 12, label: 'Years of Excellence', suffix: '' }, { value: 3, label: 'Michelin Stars', suffix: '' }, { value: 50, label: 'Signature Dishes', suffix: '+' }, { value: 98, label: 'Guest Satisfaction', suffix: '%' }] })], '#16162A', { top: 50, bottom: 50 }),
    makeSection('Slider', [makeEl('slider', { slides: [{ src: '/photos/restaurant.jpg', heading: 'Signature Tasting Menu', text: '7-course journey through flavours' }, { src: '/photos/restaurant.jpg', heading: 'Private Dining Suite', text: 'Exclusive events for up to 20 guests' }], autoPlay: true, interval: 5000, arrows: true, dots: true, effect: 'fade' })], '#0A0A15'),
    makeSection('Pricing', [makeEl('pricing', [{ name: 'Lunch Menu', price: '₹1,499', period: 'per person', features: ['3 Courses', 'Soft Drinks Included', 'Mon-Fri Only'], cta: { label: 'Book Lunch', href: '#', variant: 'outline', size: 'md' }, highlighted: false }, { name: 'Dinner Experience', price: '₹3,999', period: 'per person', features: ['7 Courses', 'Wine Pairing', "Chef's Table Option", 'All Days'], cta: { label: 'Reserve Dinner', href: '#', variant: 'primary', size: 'md' }, highlighted: true, badge: 'Signature' }])], '#16162A', { top: 60, bottom: 60 }),
    makeSection('CTA', [makeEl('cta', { heading: 'An Evening to Remember', text: 'Limited tables available. Reserve your experience today.', cta: { label: 'Make Reservation', href: '#', variant: 'primary', size: 'lg' }, bgColor: '#E94560' })], '#E94560'),
    makeSection('Footer', [makeEl('footer', { logoText: 'BISTRO', tagline: 'Fine Dining Redefined', columns: [{ heading: 'Visit Us', links: [{ label: 'Bandra, Mumbai', href: '#' }, { label: '+91 98765 43210', href: '#' }] }, { heading: 'Hours', links: [{ label: 'Lunch: 12pm-3pm', href: '#' }, { label: 'Dinner: 7pm-11pm', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 Modern Bistro' })], '#0A0A15'),
  ]),
},

{
  id: 'rest-3', name: 'Urban Café', category: 'restaurant',
  description: 'Trendy café with warm coffee-brown branding',
  tags: ['cafe', 'coffee', 'brunch', 'urban'],
  primaryColor: '#6B4226', secondaryColor: '#F5F0E8', accentColor: '#C9A227',
  headingFont: 'Lora', bodyFont: 'Open Sans',
  previewBg: '#F5F0E8', previewAccent: '#6B4226',
  buildProject: () => makeProject('Urban Café', {
    primaryColor: '#6B4226', secondaryColor: '#F5F0E8', accentColor: '#C9A227',
    headingFont: 'Lora', bodyFont: 'Open Sans', baseFontSize: 16, maxWidth: 1200, borderRadius: 'xl',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '☕ Urban Café', links: [{label:'Menu',href:'#'},{label:'About',href:'#'},{label:'Events',href:'#'}], sticky: true })], '#6B4226'),
    makeSection('Hero', [makeEl('hero', { heading: 'Your Daily Coffee Ritual', subheading: 'Specialty Coffee & All-Day Brunch', text: 'Freshly roasted single-origin beans, homemade pastries, and a cosy atmosphere.', cta: { label: 'See Our Menu', href: '#', variant: 'primary', size: 'lg' }, overlay: 30, align: 'center', bgImage: '' })], '#E8DDD0'),
    makeSection('Marquee', [makeEl('marquee', { items: ['Cold Brew', 'Flat White', 'Avocado Toast', 'Acai Bowl', 'Croissant', 'Matcha Latte', 'Eggs Benedict'], speed: 22, direction: 'left', separator: '  ☕  ' })], '#6B4226'),
    makeSection('Tabs', [makeEl('tabs', { items: [{ id: 't1', label: 'Coffee', content: 'Espresso, Americano, Flat White, Cappuccino, Cold Brew, Filter Coffee' }, { id: 't2', label: 'Brunch', content: 'Avocado Toast, Eggs Benedict, Shakshuka, Acai Bowl, French Toast' }, { id: 't3', label: 'Pastries', content: 'Croissants, Muffins, Banana Bread, Cheesecake, Tarts' }] })], '#F5F0E8', { top: 50, bottom: 50 }),
    makeSection('Gallery', [makeEl('gallery', { images: [{ src: '/photos/restaurant.jpg', alt: 'Cafe', fit: 'cover' }, { src: '/photos/restaurant.jpg', alt: 'Coffee', fit: 'cover' }, { src: '/photos/restaurant.jpg', alt: 'Food', fit: 'cover' }, { src: '/photos/restaurant.jpg', alt: 'Interior', fit: 'cover' }], columns: 4, gap: 4, style: 'grid' })], '#E8DDD0', { top: 20, bottom: 20 }),
    makeSection('Testimonial', [makeEl('testimonial', { name: 'Aditya R.', role: 'Regular Customer', text: "Best cold brew in the city. I come here every morning before work — it's my happy place!", rating: 5 })], '#6B4226', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '☕ Urban Café', tagline: 'Good Coffee. Good Vibes.', columns: [{ heading: 'Find Us', links: [{ label: 'Koramangala, Bangalore', href: '#' }, { label: 'Open 7am - 10pm', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 Urban Café' })], '#3D2314'),
  ]),
},

{
  id: 'rest-4', name: 'Fast Food Hub', category: 'restaurant',
  description: 'Bold fast food brand with high energy red-orange design',
  tags: ['fastfood', 'delivery', 'quick', 'burgers'],
  primaryColor: '#FF4500', secondaryColor: '#1A1A1A', accentColor: '#FFD700',
  headingFont: 'Montserrat', bodyFont: 'Roboto',
  previewBg: '#1A1A1A', previewAccent: '#FF4500',
  buildProject: () => makeProject('Fast Food Hub', {
    primaryColor: '#FF4500', secondaryColor: '#1A1A1A', accentColor: '#FFD700',
    headingFont: 'Montserrat', bodyFont: 'Roboto', baseFontSize: 16, maxWidth: 1280, borderRadius: 'sm',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🍔 FAST FOOD HUB', links: [{label:'Order Online',href:'#'},{label:'Menu',href:'#'},{label:'Offers',href:'#'},{label:'Franchise',href:'#'}], sticky: true, cta: { label: 'Order Now', href: '#', variant: 'primary', size: 'sm' } })], '#FF4500'),
    makeSection('Hero', [makeEl('hero', { heading: 'Fast. Fresh. Delicious.', subheading: 'Order in 30 Seconds. Delivered in 30 Minutes.', text: 'Hot burgers, crispy fries, and ice-cold shakes — delivered right to your door.', cta: { label: '🛵 Order Now', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'View Menu', href: '#', variant: 'ghost', size: 'lg' }, overlay: 75, align: 'center', bgImage: '' })], '#1A1A1A'),
    makeSection('Marquee', [makeEl('marquee', { items: ['🍔 Classic Burger ₹149', '🍕 Margherita Pizza ₹199', '🌮 Crispy Tacos ₹129', '🍟 Loaded Fries ₹99', '🥤 Thick Shakes ₹89'], speed: 18, direction: 'left', separator: '  |  ' })], '#FF4500'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 30, label: 'Min Delivery', suffix: '' }, { value: 50, label: 'Menu Items', suffix: '+' }, { value: 10000, label: 'Orders Daily', suffix: '+' }, { value: 4.8, label: 'App Rating', suffix: '⭐' }] })], '#222222', { top: 40, bottom: 40 }),
    makeSection('Accordion', [makeEl('accordion', { items: [{ id: '1', question: 'How fast is delivery?', answer: 'We guarantee delivery in 30 minutes or your next order is free.' }, { id: '2', question: 'Do you have veg options?', answer: 'Yes! We have a full vegetarian menu including veg burgers, paneer wraps, and more.' }, { id: '3', question: 'How to order?', answer: 'Order via our app, website, or call us directly. We accept all payment methods.' }] })], '#1A1A1A', { top: 40, bottom: 40 }),
    makeSection('CTA', [makeEl('cta', { heading: '🎉 First Order 20% OFF', text: 'Use code FIRST20 at checkout. Limited time offer!', cta: { label: 'Claim Offer', href: '#', variant: 'primary', size: 'lg' }, bgColor: '#FF4500' })], '#FF4500'),
    makeSection('Footer', [makeEl('footer', { logoText: '🍔 FAST FOOD HUB', tagline: 'Hunger? We Got You.', columns: [{ heading: 'Quick Links', links: [{ label: 'Order Online', href: '#' }, { label: 'Track Order', href: '#' }, { label: 'Franchise', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }, { platform: 'facebook', url: '#' }], copyright: '2026 Fast Food Hub' })], '#1A1A1A'),
  ]),
},

// ═══════════════════ RESTAURANT (5-8) ═══════════════════

{
  id: 'rest-5', name: 'Seafood Shack', category: 'restaurant',
  description: 'Coastal seafood restaurant with ocean-blue palette',
  tags: ['seafood', 'coastal', 'fish', 'restaurant'],
  primaryColor: '#0369A1', secondaryColor: '#F0F9FF', accentColor: '#FB923C',
  headingFont: 'Poppins', bodyFont: 'Lato',
  previewBg: '#F0F9FF', previewAccent: '#0369A1',
  buildProject: () => makeProject('Seafood Shack', {
    primaryColor: '#0369A1', secondaryColor: '#F0F9FF', accentColor: '#FB923C',
    headingFont: 'Poppins', bodyFont: 'Lato', baseFontSize: 16, maxWidth: 1280, borderRadius: 'lg',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🦞 Seafood Shack', links: [{label:'Menu',href:'#'},{label:'Fresh Catch',href:'#'},{label:'Reserve',href:'#'}], sticky: true, cta: { label: 'Book Table', href: '#', variant: 'primary', size: 'sm' } })], '#075985'),
    makeSection('Hero', [makeEl('hero', { heading: 'Fresh From the Ocean to Your Plate', subheading: 'Daily Fresh Catch · Coastal Flavours · Goa Vibes', text: 'Lobster, prawns, crab, and fish — sourced directly from local fishermen every morning.', cta: { label: 'View Menu', href: '#', variant: 'primary', size: 'lg' }, overlay: 50, align: 'center', bgImage: '' })], '#0C4A6E'),
    makeSection('Marquee', [makeEl('marquee', { items: ['🦞 Lobster Thermidor', '🦐 Butter Garlic Prawns', '🦀 Chilli Crab', '🐟 Grilled Fish', '🍤 Calamari'], speed: 20, direction: 'left', separator: '  🌊  ' })], '#FB923C'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 15, label: 'Years by the Sea', suffix: '' }, { value: 40, label: 'Fresh Dishes Daily', suffix: '' }, { value: 300, label: 'Covers', suffix: '' }, { value: 4.8, label: 'Google Rating', suffix: '★' }] })], '#0369A1', { top: 40, bottom: 40 }),
    makeSection('Tabs', [makeEl('tabs', { items: [{ id: 't1', label: '🦐 Starters', content: 'Prawn cocktail, Fish tikka, Crab cakes, Calamari rings, Oysters' }, { id: 't2', label: '🦞 Mains', content: 'Lobster bisque, Grilled sea bass, Butter garlic prawns, Fish curry, Crab masala' }, { id: 't3', label: '🍹 Drinks', content: 'Coconut water, Seafood pairings, Fresh lime soda, Goan feni' }] })], '#F0F9FF', { top: 50, bottom: 50 }),
    makeSection('Gallery', [makeEl('gallery', { images: [{ src: '/photos/restaurant.jpg', alt: 'Seafood', fit: 'cover' }, { src: '/photos/restaurant.jpg', alt: 'Beach', fit: 'cover' }, { src: '/photos/restaurant.jpg', alt: 'Grill', fit: 'cover' }], columns: 3, gap: 8, style: 'grid' })], '#E0F2FE', { top: 30, bottom: 30 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🦞 Seafood Shack', tagline: 'Where the ocean meets your plate', columns: [{ heading: 'Find Us', links: [{ label: 'Calangute, Goa', href: '#' }, { label: 'Open 12pm - 11pm', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 Seafood Shack' })], '#075985'),
  ]),
},

{
  id: 'rest-6', name: 'Pizzeria Italia', category: 'restaurant',
  description: 'Authentic Italian pizzeria with red-white classic design',
  tags: ['pizza', 'italian', 'pasta', 'restaurant'],
  primaryColor: '#DC2626', secondaryColor: '#FFFBEB', accentColor: '#16A34A',
  headingFont: 'Lora', bodyFont: 'Open Sans',
  previewBg: '#FFFBEB', previewAccent: '#DC2626',
  buildProject: () => makeProject('Pizzeria Italia', {
    primaryColor: '#DC2626', secondaryColor: '#FFFBEB', accentColor: '#16A34A',
    headingFont: 'Lora', bodyFont: 'Open Sans', baseFontSize: 16, maxWidth: 1200, borderRadius: 'md',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🍕 Pizzeria Italia', links: [{label:'Menu',href:'#'},{label:'About',href:'#'},{label:'Order Online',href:'#'}], sticky: true, cta: { label: 'Order Now', href: '#', variant: 'primary', size: 'sm' } })], '#B91C1C'),
    makeSection('Hero', [makeEl('hero', { heading: 'Authentic Italian Pizza', subheading: 'Wood-Fired Oven · Imported Ingredients · Napoli Recipe', text: 'Using 72-hour fermented dough and San Marzano tomatoes imported from Italy.', cta: { label: 'Order Online', href: '#', variant: 'primary', size: 'lg' }, overlay: 55, align: 'center', bgImage: '' })], '#7F1D1D'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 900, label: 'Degrees Wood Fire', suffix: '°' }, { value: 25, label: 'Pizza Varieties', suffix: '' }, { value: 72, label: 'Hour Dough Ferment', suffix: 'h' }, { value: 4.9, label: 'Zomato Rating', suffix: '★' }] })], '#DC2626', { top: 40, bottom: 40 }),
    makeSection('Accordion', [makeEl('accordion', { items: [{ id: '1', question: '🍅 Are ingredients authentic?', answer: 'Yes! We import San Marzano tomatoes, 00-grade flour, and Fior di latte mozzarella directly from Italy.' }, { id: '2', question: '🌿 Veg options?', answer: 'Absolutely. Our Margherita, Pesto, and 5-cheese pizzas are pure vegetarian and fan favourites.' }, { id: '3', question: '🛵 Delivery available?', answer: 'Yes, 30-minute delivery via Zomato, Swiggy, or direct order. Minimum order ₹399.' }] })], '#FFFBEB', { top: 50, bottom: 50 }),
    makeSection('CTA', [makeEl('cta', { heading: 'Tuesday BOGO — Buy 1 Get 1 Free!', text: 'Every Tuesday, all day. Dine-in and takeaway only.', cta: { label: 'See Offers', href: '#', variant: 'primary', size: 'lg' }, bgColor: '#DC2626' })], '#DC2626'),
    makeSection('Footer', [makeEl('footer', { logoText: '🍕 Pizzeria Italia', tagline: 'La vera pizza italiana', columns: [{ heading: 'Hours', links: [{ label: 'Mon-Sun: 11am-11pm', href: '#' }] }, { heading: 'Contact', links: [{ label: 'Indiranagar, Bangalore', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 Pizzeria Italia' })], '#7F1D1D'),
  ]),
},

{
  id: 'rest-7', name: 'Rooftop Lounge', category: 'restaurant',
  description: 'Upscale rooftop bar with neon-dark nightlife aesthetic',
  tags: ['bar', 'lounge', 'rooftop', 'nightlife'],
  primaryColor: '#A21CAF', secondaryColor: '#0D0415', accentColor: '#E879F9',
  headingFont: 'Raleway', bodyFont: 'Inter',
  previewBg: '#0D0415', previewAccent: '#A21CAF',
  buildProject: () => makeProject('Rooftop Lounge', {
    primaryColor: '#A21CAF', secondaryColor: '#0D0415', accentColor: '#E879F9',
    headingFont: 'Raleway', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1400, borderRadius: 'xl',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '✦ ALTITUDE', links: [{label:'Drinks',href:'#'},{label:'Food',href:'#'},{label:'Events',href:'#'},{label:'Reserve',href:'#'}], sticky: true, cta: { label: 'Reserve Table', href: '#', variant: 'primary', size: 'sm' } })], '#0D0415'),
    makeSection('Hero', [makeEl('hero', { heading: 'Above the City. Beyond the Ordinary.', subheading: 'Mumbai\'s Most Iconic Rooftop Bar & Lounge', text: 'Handcrafted cocktails, stunning skyline views, and beats that last till dawn.', cta: { label: 'Reserve Your Spot', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'See Events', href: '#', variant: 'outline', size: 'lg' }, overlay: 70, align: 'center', bgImage: '' })], '#0D0415'),
    makeSection('Marquee', [makeEl('marquee', { items: ['🍹 Signature Cocktails', '🎵 Live DJ Every Friday', '🌆 Skyline Views', '🥂 Champagne Brunches', '🎭 Private Events'], speed: 20, direction: 'left', separator: '  ✦  ' })], '#A21CAF'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 32, label: 'Floors Up', suffix: '' }, { value: 80, label: 'Signature Cocktails', suffix: '+' }, { value: 200, label: 'Capacity', suffix: '' }, { value: 9, label: 'Years Open', suffix: '' }] })], '#1A0525', { top: 50, bottom: 50 }),
    makeSection('Pricing', [makeEl('pricing', [{ name: 'Happy Hours', price: '₹599', period: 'per person', features: ['Entry + 2 Drinks', 'Mon-Thu 5pm-8pm', 'Snacks Included'], cta: { label: 'Book Happy Hours', href: '#', variant: 'outline', size: 'md' }, highlighted: false }, { name: 'Friday Night', price: '₹1,999', period: 'per person', features: ['Entry + 3 Cocktails', 'Live DJ', 'Passed Canapes', 'Priority Queue'], cta: { label: 'Book Friday Night', href: '#', variant: 'primary', size: 'md' }, highlighted: true, badge: 'Most Popular' }])], '#0D0415', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '✦ ALTITUDE', tagline: 'Rise above the ordinary', columns: [{ heading: 'Hours', links: [{ label: 'Mon-Sun: 5pm-2am', href: '#' }, { label: 'Brunch: Sat-Sun 12pm', href: '#' }] }, { heading: 'Location', links: [{ label: '32nd Floor, BKC Mumbai', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 Altitude Rooftop Lounge' })], '#0D0415'),
  ]),
},

{
  id: 'rest-8', name: 'Vegan Garden', category: 'restaurant',
  description: 'Fresh plant-based restaurant with earthy green design',
  tags: ['vegan', 'plantbased', 'healthy', 'restaurant'],
  primaryColor: '#4D7C0F', secondaryColor: '#F7FEE7', accentColor: '#FACC15',
  headingFont: 'Nunito', bodyFont: 'Lato',
  previewBg: '#F7FEE7', previewAccent: '#4D7C0F',
  buildProject: () => makeProject('Vegan Garden', {
    primaryColor: '#4D7C0F', secondaryColor: '#F7FEE7', accentColor: '#FACC15',
    headingFont: 'Nunito', bodyFont: 'Lato', baseFontSize: 16, maxWidth: 1200, borderRadius: 'xl',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🌱 VEGAN GARDEN', links: [{label:'Menu',href:'#'},{label:'About',href:'#'},{label:'Blog',href:'#'}], sticky: true })], '#3F6212'),
    makeSection('Hero', [makeEl('hero', { heading: 'Good Food. Good Earth.', subheading: '100% Plant-Based · Zero Waste · Locally Sourced', text: 'Nourish your body and the planet. Every meal here is a celebration of nature.', cta: { label: 'Explore Menu', href: '#', variant: 'primary', size: 'lg' }, overlay: 35, align: 'center', bgImage: '' })], '#ECFCCB'),
    makeSection('Marquee', [makeEl('marquee', { items: ['🥗 Buddha Bowls', '🌮 Jackfruit Tacos', '🍲 Dal Tadka', '🥜 Almond Mylk Latte', '🍰 Raw Cashew Cake', '🍱 Bento Box'], speed: 18, direction: 'left', separator: '  🌿  ' })], '#4D7C0F'),
    makeSection('Progress', [makeEl('progress', { items: [{ label: 'Locally Sourced Ingredients', value: 95 }, { label: 'Zero Plastic Packaging', value: 100 }, { label: 'Carbon Offset Meals', value: 80 }, { label: 'Organic Produce', value: 90 }] })], '#F7FEE7', { top: 50, bottom: 50 }),
    makeSection('Testimonial', [makeEl('testimonial', { name: 'Tanvi Malhotra', role: 'Nutritionist & Blogger', text: 'Finally a vegan restaurant that does not compromise on taste. The jackfruit biryani is INCREDIBLE!', rating: 5 })], '#ECFCCB', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🌱 VEGAN GARDEN', tagline: 'Eat plants. Love the planet.', columns: [{ heading: 'Visit', links: [{ label: 'Jubilee Hills, Hyderabad', href: '#' }, { label: 'Tue-Sun: 9am-10pm', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 Vegan Garden' })], '#3F6212'),
  ]),
},

// ═══════════════════ AGENCY (9-14) ═══════════════════

{
  id: 'agency-1', name: 'Creative Studio', category: 'agency',
  description: 'Purple-pink creative agency with bold typography',
  tags: ['agency', 'creative', 'design', 'studio'],
  primaryColor: '#6C63FF', secondaryColor: '#0A0A0F', accentColor: '#FF6584',
  headingFont: 'Raleway', bodyFont: 'Inter',
  previewBg: '#0A0A0F', previewAccent: '#6C63FF',
  buildProject: () => makeProject('Creative Studio', {
    primaryColor: '#6C63FF', secondaryColor: '#0A0A0F', accentColor: '#FF6584',
    headingFont: 'Raleway', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1400, borderRadius: 'lg',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '⬡ STUDIO', links: [{label:'Work',href:'#'},{label:'Services',href:'#'},{label:'About',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Start Project', href: '#', variant: 'primary', size: 'sm' } })], '#0A0A0F'),
    makeSection('Hero', [makeEl('hero', { heading: 'We Create Digital Magic', subheading: 'Branding · UI/UX · Motion · Web', text: 'Award-winning creative studio crafting experiences that inspire and convert.', cta: { label: 'View Our Work', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: "Let's Talk", href: '#', variant: 'outline', size: 'lg' }, overlay: 50, align: 'center', bgImage: '' })], '#0A0A0F'),
    makeSection('Marquee', [makeEl('marquee', { items: ['Brand Identity', 'UI/UX Design', 'Web Development', 'Motion Graphics', 'App Design', 'Digital Marketing'], speed: 28, direction: 'left', separator: '  ◆  ' })], '#6C63FF'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 150, label: 'Brands Built', suffix: '+' }, { value: 12, label: 'Awards Won', suffix: '' }, { value: 8, label: 'Years in Design', suffix: '' }, { value: 40, label: 'Team Members', suffix: '' }] })], '#12121A', { top: 50, bottom: 50 }),
    makeSection('Testimonial', [makeEl('testimonial', { name: 'Rahul Kapoor', role: 'CEO, TechStartup India', text: 'They transformed our brand completely. The new identity increased our investment rounds by 3X!', rating: 5 })], '#0A0A0F', { top: 60, bottom: 60 }),
    makeSection('Pricing', [makeEl('pricing', [{ name: 'Brand Starter', price: '₹49,999', period: 'one-time', features: ['Logo Design', 'Brand Guidelines', 'Business Cards', '3 Revisions'], cta: { label: 'Get Started', href: '#', variant: 'outline', size: 'md' }, highlighted: false }, { name: 'Full Brand', price: '₹1,49,999', period: 'one-time', features: ['Everything in Starter', 'Website Design', 'Social Media Kit', 'Unlimited Revisions', '6 Months Support'], cta: { label: 'Choose Full Brand', href: '#', variant: 'primary', size: 'md' }, highlighted: true, badge: 'Most Popular' }])], '#12121A', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '⬡ STUDIO', tagline: 'Design. Develop. Deliver.', columns: [{ heading: 'Services', links: [{ label: 'Branding', href: '#' }, { label: 'Web Design', href: '#' }, { label: 'UI/UX', href: '#' }] }, { heading: 'Contact', links: [{ label: 'hello@studio.com', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }, { platform: 'linkedin', url: '#' }], copyright: '2026 Creative Studio' })], '#0A0A0F'),
  ]),
},

{
  id: 'agency-2', name: 'Minimal Agency', category: 'agency',
  description: 'Ultra-minimal black-white agency with gold accents',
  tags: ['agency', 'minimal', 'clean', 'premium'],
  primaryColor: '#C9A227', secondaryColor: '#0D0D0D', accentColor: '#FFFFFF',
  headingFont: 'Inter', bodyFont: 'Inter',
  previewBg: '#0D0D0D', previewAccent: '#C9A227',
  buildProject: () => makeProject('Minimal Agency', {
    primaryColor: '#C9A227', secondaryColor: '#0D0D0D', accentColor: '#FFFFFF',
    headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1280, borderRadius: 'none',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: 'MINIMAL', links: [{label:'Work',href:'#'},{label:'Process',href:'#'},{label:'Clients',href:'#'},{label:'Contact',href:'#'}], sticky: true })], '#0D0D0D'),
    makeSection('Hero', [makeEl('hero', { heading: 'Less is More.', subheading: 'Strategy · Design · Code', text: 'We strip away the unnecessary to reveal what truly matters. Pure, purposeful design.', cta: { label: 'See Our Work →', href: '#', variant: 'primary', size: 'lg' }, overlay: 0, align: 'left', bgImage: '' })], '#0D0D0D'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 200, label: 'Clients Served', suffix: '' }, { value: 15, label: 'Years Experience', suffix: '' }, { value: 50, label: 'Countries Reached', suffix: '' }, { value: 100, label: 'Satisfaction Rate', suffix: '%' }] })], '#111111', { top: 60, bottom: 60 }),
    makeSection('Accordion', [makeEl('accordion', { items: [{ id: '1', question: 'What makes you different?', answer: 'We believe in radical simplicity. Every pixel must earn its place.' }, { id: '2', question: 'What is your process?', answer: 'Discover → Define → Design → Develop → Deploy. Simple and effective.' }, { id: '3', question: 'How long does a project take?', answer: 'Brand projects: 2-3 weeks. Websites: 4-8 weeks. Campaigns: ongoing.' }, { id: '4', question: 'What are your rates?', answer: 'Projects start at ₹75,000. We offer fixed-price and retainer options.' }] })], '#1A1A1A', { top: 50, bottom: 50 }),
    makeSection('CTA', [makeEl('cta', { heading: 'Ready to Create Something Meaningful?', text: 'We take on 3 new clients per month. Apply to work with us.', cta: { label: 'Apply Now', href: '#', variant: 'primary', size: 'lg' }, bgColor: '#C9A227' })], '#C9A227'),
    makeSection('Footer', [makeEl('footer', { logoText: 'MINIMAL', tagline: 'Clarity through design.', columns: [{ heading: 'Work', links: [{ label: 'Portfolio', href: '#' }, { label: 'Case Studies', href: '#' }] }], socials: [{ platform: 'twitter', url: '#' }, { platform: 'linkedin', url: '#' }], copyright: '2026 Minimal Agency' })], '#0D0D0D'),
  ]),
},

{
  id: 'agency-3', name: 'Digital Marketing', category: 'agency',
  description: 'Energetic orange digital marketing agency',
  tags: ['marketing', 'seo', 'ads', 'growth'],
  primaryColor: '#EA580C', secondaryColor: '#0F0700', accentColor: '#FDE68A',
  headingFont: 'Poppins', bodyFont: 'Roboto',
  previewBg: '#0F0700', previewAccent: '#EA580C',
  buildProject: () => makeProject('Digital Marketing Agency', {
    primaryColor: '#EA580C', secondaryColor: '#0F0700', accentColor: '#FDE68A',
    headingFont: 'Poppins', bodyFont: 'Roboto', baseFontSize: 16, maxWidth: 1280, borderRadius: 'md',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🚀 GrowthX', links: [{label:'Services',href:'#'},{label:'Results',href:'#'},{label:'Pricing',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Free Audit', href: '#', variant: 'primary', size: 'sm' } })], '#0F0700'),
    makeSection('Hero', [makeEl('hero', { heading: '10X Your Business Growth', subheading: 'SEO · Paid Ads · Social Media · Content', text: 'Data-driven digital marketing that delivers measurable ROI. Average client sees 3X growth in 6 months.', cta: { label: 'Get Free Audit', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'See Results', href: '#', variant: 'outline', size: 'lg' }, overlay: 65, align: 'left', bgImage: '' })], '#0F0700'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 300, label: 'Brands Scaled', suffix: '+' }, { value: 500, label: 'Cr Revenue Generated', suffix: '+' }, { value: 95, label: 'Client Retention', suffix: '%' }, { value: 4.9, label: 'Google Rating', suffix: '★' }] })], '#1C0E00', { top: 50, bottom: 50 }),
    makeSection('Pricing', [makeEl('pricing', [{ name: 'Starter', price: '₹15,000', period: '/month', features: ['Google Ads Management', 'SEO (10 Keywords)', 'Monthly Report', 'Email Support'], cta: { label: 'Start Growing', href: '#', variant: 'outline', size: 'md' }, highlighted: false }, { name: 'Growth', price: '₹35,000', period: '/month', features: ['Google + Meta Ads', 'SEO (30 Keywords)', 'Social Media (3 platforms)', 'Weekly Reports', 'Dedicated Manager'], cta: { label: 'Choose Growth', href: '#', variant: 'primary', size: 'md' }, highlighted: true, badge: '🔥 Best ROI' }, { name: 'Enterprise', price: '₹75,000', period: '/month', features: ['Full Digital Suite', 'Unlimited Keywords', 'All Platforms', 'Daily Reports', 'CMO as a Service'], cta: { label: 'Contact Us', href: '#', variant: 'outline', size: 'md' }, highlighted: false }])], '#0F0700', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🚀 GrowthX', tagline: 'Growth is not optional.', columns: [{ heading: 'Services', links: [{ label: 'Google Ads', href: '#' }, { label: 'SEO', href: '#' }, { label: 'Social Media', href: '#' }] }], socials: [{ platform: 'linkedin', url: '#' }, { platform: 'instagram', url: '#' }], copyright: '2026 GrowthX Digital' })], '#0F0700'),
  ]),
},

{
  id: 'agency-4', name: 'PR & Communications', category: 'agency',
  description: 'Sophisticated teal PR agency with editorial look',
  tags: ['pr', 'communications', 'media', 'agency'],
  primaryColor: '#0D9488', secondaryColor: '#F0FDFA', accentColor: '#F59E0B',
  headingFont: 'Playfair Display', bodyFont: 'Inter',
  previewBg: '#F0FDFA', previewAccent: '#0D9488',
  buildProject: () => makeProject('PR Agency', {
    primaryColor: '#0D9488', secondaryColor: '#F0FDFA', accentColor: '#F59E0B',
    headingFont: 'Playfair Display', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1280, borderRadius: 'sm',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: 'PRESSCORP', links: [{label:'Services',href:'#'},{label:'Clients',href:'#'},{label:'Media',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Get in Touch', href: '#', variant: 'primary', size: 'sm' } })], '#115E59'),
    makeSection('Hero', [makeEl('hero', { heading: 'Your Story, Told Powerfully', subheading: 'PR · Crisis Comms · Media Relations · Brand Reputation', text: 'India\'s leading public relations firm with 200+ media relationships across print, digital, and broadcast.', cta: { label: 'Discuss Your Brand', href: '#', variant: 'primary', size: 'lg' }, overlay: 55, align: 'left', bgImage: '' })], '#134E4A'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 500, label: 'Stories Published', suffix: '+' }, { value: 200, label: 'Media Relationships', suffix: '+' }, { value: 18, label: 'Years in PR', suffix: '' }, { value: 100, label: 'Brand Clients', suffix: '+' }] })], '#0D9488', { top: 40, bottom: 40 }),
    makeSection('Tabs', [makeEl('tabs', { items: [{ id: 't1', label: 'Media Relations', content: 'Editorial placements, press releases, journalist outreach, exclusive features in top publications.' }, { id: 't2', label: 'Crisis Management', content: '24/7 crisis response team. Reputation repair, media monitoring, narrative control.' }, { id: 't3', label: 'Brand Reputation', content: 'Thought leadership, CEO profiling, awards nominations, industry recognition programmes.' }] })], '#F0FDFA', { top: 50, bottom: 50 }),
    makeSection('Footer', [makeEl('footer', { logoText: 'PRESSCORP', tagline: 'Reputation is everything.', columns: [{ heading: 'Services', links: [{ label: 'Media Relations', href: '#' }, { label: 'Crisis PR', href: '#' }, { label: 'Brand Reputation', href: '#' }] }], socials: [{ platform: 'linkedin', url: '#' }, { platform: 'twitter', url: '#' }], copyright: '2026 PressCorp PR Agency' })], '#115E59'),
  ]),
},

{
  id: 'agency-5', name: 'Architecture Firm', category: 'agency',
  description: 'Sleek architecture studio with concrete-grey minimal design',
  tags: ['architecture', 'design', 'interior', 'studio'],
  primaryColor: '#374151', secondaryColor: '#F9FAFB', accentColor: '#F59E0B',
  headingFont: 'Montserrat', bodyFont: 'Open Sans',
  previewBg: '#F9FAFB', previewAccent: '#374151',
  buildProject: () => makeProject('Architecture Firm', {
    primaryColor: '#374151', secondaryColor: '#F9FAFB', accentColor: '#F59E0B',
    headingFont: 'Montserrat', bodyFont: 'Open Sans', baseFontSize: 16, maxWidth: 1400, borderRadius: 'none',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: 'FORM STUDIO', links: [{label:'Projects',href:'#'},{label:'Services',href:'#'},{label:'Team',href:'#'},{label:'Contact',href:'#'}], sticky: true })], '#1F2937'),
    makeSection('Hero', [makeEl('hero', { heading: 'Spaces That Inspire Living', subheading: 'Architecture · Interior Design · Urban Planning', text: 'We design spaces that balance aesthetics, function, and sustainability. 20 years of award-winning work.', cta: { label: 'View Projects', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Contact Us', href: '#', variant: 'outline', size: 'lg' }, overlay: 60, align: 'left', bgImage: '' })], '#1F2937'),
    makeSection('Gallery', [makeEl('gallery', { images: [{ src: '/photos/hospital.jpg', alt: 'Residential', fit: 'cover' }, { src: '/photos/school.jpg', alt: 'Commercial', fit: 'cover' }, { src: '/photos/restaurant.jpg', alt: 'Interior', fit: 'cover' }, { src: '/photos/hospital.jpg', alt: 'Urban', fit: 'cover' }], columns: 4, gap: 4, style: 'grid' })], '#F9FAFB', { top: 20, bottom: 20 }),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 120, label: 'Projects Completed', suffix: '' }, { value: 20, label: 'Awards Won', suffix: '' }, { value: 25, label: 'Cities', suffix: '' }, { value: 20, label: 'Years Experience', suffix: '' }] })], '#374151', { top: 50, bottom: 50 }),
    makeSection('Footer', [makeEl('footer', { logoText: 'FORM STUDIO', tagline: 'Architecture with purpose.', columns: [{ heading: 'Services', links: [{ label: 'Residential', href: '#' }, { label: 'Commercial', href: '#' }, { label: 'Interior Design', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 Form Studio Architecture' })], '#1F2937'),
  ]),
},

{
  id: 'agency-6', name: 'Recruitment Agency', category: 'agency',
  description: 'Professional blue recruitment firm with clean corporate look',
  tags: ['recruitment', 'hr', 'jobs', 'staffing'],
  primaryColor: '#1D4ED8', secondaryColor: '#EFF6FF', accentColor: '#10B981',
  headingFont: 'Poppins', bodyFont: 'Roboto',
  previewBg: '#EFF6FF', previewAccent: '#1D4ED8',
  buildProject: () => makeProject('Recruitment Agency', {
    primaryColor: '#1D4ED8', secondaryColor: '#EFF6FF', accentColor: '#10B981',
    headingFont: 'Poppins', bodyFont: 'Roboto', baseFontSize: 16, maxWidth: 1280, borderRadius: 'md',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '👔 TalentFirst', links: [{label:'Find Jobs',href:'#'},{label:'Hire Talent',href:'#'},{label:'Industries',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Post a Job', href: '#', variant: 'primary', size: 'sm' } })], '#1E3A8A'),
    makeSection('Hero', [makeEl('hero', { heading: 'The Right People for the Right Roles', subheading: 'Executive Search · Mass Recruitment · RPO', text: 'We connect India\'s top talent with leading companies. 15 years of placing professionals across 20+ industries.', cta: { label: 'Find Talent', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Find Jobs', href: '#', variant: 'outline', size: 'lg' }, overlay: 60, align: 'center', bgImage: '' })], '#1E3A8A'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 50000, label: 'Placements Made', suffix: '+' }, { value: 500, label: 'Corporate Clients', suffix: '+' }, { value: 20, label: 'Industries', suffix: '+' }, { value: 15, label: 'Years Experience', suffix: '' }] })], '#1D4ED8', { top: 40, bottom: 40 }),
    makeSection('Tabs', [makeEl('tabs', { items: [{ id: 't1', label: 'For Companies', content: 'Executive search, bulk hiring, RPO, campus recruitment, diversity hiring. Pan-India and international.' }, { id: 't2', label: 'For Candidates', content: 'Resume building, interview coaching, job matching, salary negotiation. Free for candidates.' }, { id: 't3', label: 'Industries', content: 'IT, BFSI, Healthcare, Manufacturing, Retail, FMCG, Logistics, Startups, and more.' }] })], '#EFF6FF', { top: 50, bottom: 50 }),
    makeSection('Footer', [makeEl('footer', { logoText: '👔 TalentFirst', tagline: 'Building teams that build futures.', columns: [{ heading: 'Services', links: [{ label: 'Executive Search', href: '#' }, { label: 'Mass Recruitment', href: '#' }, { label: 'RPO', href: '#' }] }, { heading: 'Offices', links: [{ label: 'Mumbai | Delhi | Bangalore', href: '#' }] }], socials: [{ platform: 'linkedin', url: '#' }], copyright: '2026 TalentFirst Recruitment' })], '#1E3A8A'),
  ]),
},

// ═══════════════════ HEALTHCARE (15-20) ═══════════════════

{
  id: 'health-1', name: 'City Clinic', category: 'healthcare',
  description: 'Clean sky-blue medical clinic with trust-building design',
  tags: ['clinic', 'medical', 'doctor', 'health'],
  primaryColor: '#0EA5E9', secondaryColor: '#F0F9FF', accentColor: '#10B981',
  headingFont: 'Poppins', bodyFont: 'Open Sans',
  previewBg: '#F0F9FF', previewAccent: '#0EA5E9',
  buildProject: () => makeProject('City Clinic', {
    primaryColor: '#0EA5E9', secondaryColor: '#F0F9FF', accentColor: '#10B981',
    headingFont: 'Poppins', bodyFont: 'Open Sans', baseFontSize: 16, maxWidth: 1280, borderRadius: 'md',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🏥 City Clinic', links: [{label:'Departments',href:'#'},{label:'Doctors',href:'#'},{label:'Services',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Book Appointment', href: '#', variant: 'primary', size: 'sm' } })], '#0C4A6E'),
    makeSection('Hero', [makeEl('hero', { heading: 'Your Health, Our Priority', subheading: 'Comprehensive Care for the Whole Family', text: 'Expert doctors, advanced diagnostics, and compassionate care — all under one roof.', cta: { label: 'Book Appointment', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Our Doctors', href: '#', variant: 'outline', size: 'lg' }, overlay: 55, align: 'center', bgImage: '' })], '#0C4A6E'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 25, label: 'Specialist Doctors', suffix: '+' }, { value: 15000, label: 'Patients Treated', suffix: '+' }, { value: 20, label: 'Years Serving', suffix: '+' }, { value: 4.9, label: 'Patient Rating', suffix: '★' }] })], '#0EA5E9', { top: 40, bottom: 40 }),
    makeSection('Services', [makeEl('accordion', { items: [{ id: '1', question: '🫀 Cardiology', answer: 'Complete heart care with ECG, Echo, stress tests, and consultation with senior cardiologists.' }, { id: '2', question: '🦷 Dental Care', answer: 'Full dental services: cleaning, fillings, root canal, orthodontics, and cosmetic dentistry.' }, { id: '3', question: '👶 Pediatrics', answer: 'Specialized care for children from newborn to 18 years. Vaccinations and growth monitoring.' }, { id: '4', question: '🧬 Pathology Lab', answer: 'On-site lab with 500+ tests. Home sample collection available. Results in 24 hours.' }] })], '#F0F9FF', { top: 50, bottom: 50 }),
    makeSection('Progress', [makeEl('progress', { items: [{ label: 'Patient Recovery Rate', value: 96 }, { label: 'Appointment Availability', value: 88 }, { label: 'Diagnostic Accuracy', value: 99 }, { label: 'Patient Satisfaction', value: 97 }] })], '#E0F2FE', { top: 50, bottom: 50 }),
    makeSection('Contact', [makeEl('form', { fields: [{ id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your name', required: true }, { id: 'phone', type: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', required: true }, { id: 'dept', type: 'select', label: 'Department', required: true, options: ['Cardiology', 'Dental', 'Pediatrics', 'Orthopedics', 'General Medicine'] }, { id: 'date', type: 'text', label: 'Preferred Date', placeholder: 'DD/MM/YYYY', required: true }], submitLabel: 'Book Appointment', successMessage: 'Appointment request received! We will call you within 2 hours.' })], '#0C4A6E', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🏥 City Clinic', tagline: 'Care that comes from the heart', columns: [{ heading: 'Timings', links: [{ label: 'Mon-Sat: 8am-9pm', href: '#' }, { label: 'Sun: 10am-4pm', href: '#' }, { label: 'Emergency: 24/7', href: '#' }] }, { heading: 'Quick Links', links: [{ label: 'Book Appointment', href: '#' }, { label: 'Find a Doctor', href: '#' }] }], socials: [{ platform: 'facebook', url: '#' }], copyright: '2026 City Clinic. NABH Accredited.' })], '#0C4A6E'),
  ]),
},

{
  id: 'health-2', name: 'Wellness Retreat', category: 'healthcare',
  description: 'Serene green wellness and yoga center',
  tags: ['wellness', 'yoga', 'spa', 'holistic'],
  primaryColor: '#059669', secondaryColor: '#F0FDF4', accentColor: '#FCD34D',
  headingFont: 'Lora', bodyFont: 'Lato',
  previewBg: '#F0FDF4', previewAccent: '#059669',
  buildProject: () => makeProject('Wellness Retreat', {
    primaryColor: '#059669', secondaryColor: '#F0FDF4', accentColor: '#FCD34D',
    headingFont: 'Lora', bodyFont: 'Lato', baseFontSize: 17, maxWidth: 1200, borderRadius: 'xl',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🌿 Serene Wellness', links: [{label:'Classes',href:'#'},{label:'Treatments',href:'#'},{label:'Retreats',href:'#'},{label:'Book',href:'#'}], sticky: true })], '#059669'),
    makeSection('Hero', [makeEl('hero', { heading: 'Find Your Inner Stillness', subheading: 'Yoga · Meditation · Ayurveda · Spa', text: 'A sanctuary for mind, body, and soul. Begin your wellness journey with us today.', cta: { label: 'Book a Class', href: '#', variant: 'primary', size: 'lg' }, overlay: 40, align: 'center', bgImage: '' })], '#064E3B'),
    makeSection('Marquee', [makeEl('marquee', { items: ['🧘 Morning Yoga', '🌸 Aromatherapy', '🌿 Ayurvedic Massage', '🏊 Hydrotherapy', '🍵 Detox Retreat', '🧘‍♀️ Meditation'], speed: 20, direction: 'left', separator: '  ·  ' })], '#FCD34D'),
    makeSection('Tabs', [makeEl('tabs', { items: [{ id: 't1', label: '🧘 Yoga', content: 'Hatha, Vinyasa, Yin Yoga, Power Yoga. All levels welcome. Morning and evening batches.' }, { id: 't2', label: '💆 Spa', content: 'Swedish massage, Deep tissue, Hot stone therapy, Facial treatments. Book 60-90 min sessions.' }, { id: 't3', label: '🌿 Ayurveda', content: 'Panchakarma, Abhyanga, Shirodhara, Nasya. Personalized treatments by certified Ayurvedic doctors.' }, { id: 't4', label: '🏕️ Retreats', content: 'Weekend and 7-day retreats in Rishikesh. Digital detox, meditation, nature immersion.' }] })], '#F0FDF4', { top: 60, bottom: 60 }),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 500, label: 'Happy Members', suffix: '+' }, { value: 20, label: 'Expert Instructors', suffix: '' }, { value: 50, label: 'Classes/Week', suffix: '' }, { value: 10, label: 'Years of Wellness', suffix: '+' }] })], '#059669', { top: 50, bottom: 50 }),
    makeSection('Testimonial', [makeEl('testimonial', { name: 'Sunita Verma', role: 'Member since 2020', company: 'Delhi', text: 'The morning yoga sessions have completely transformed my life. I sleep better, feel stronger, and am much calmer now.', rating: 5 })], '#F0FDF4', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🌿 Serene Wellness', tagline: 'Nurture your whole self', columns: [{ heading: 'Visit Us', links: [{ label: 'Hauz Khas, Delhi', href: '#' }, { label: 'Mon-Sun: 6am-9pm', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }, { platform: 'youtube', url: '#' }], copyright: '2026 Serene Wellness' })], '#064E3B'),
  ]),
},

{
  id: 'health-3', name: 'Dental Clinic', category: 'healthcare',
  description: 'Modern dental practice with bright mint-white design',
  tags: ['dental', 'teeth', 'clinic', 'smile'],
  primaryColor: '#0891B2', secondaryColor: '#ECFEFF', accentColor: '#A3E635',
  headingFont: 'Nunito', bodyFont: 'Open Sans',
  previewBg: '#ECFEFF', previewAccent: '#0891B2',
  buildProject: () => makeProject('Dental Clinic', {
    primaryColor: '#0891B2', secondaryColor: '#ECFEFF', accentColor: '#A3E635',
    headingFont: 'Nunito', bodyFont: 'Open Sans', baseFontSize: 16, maxWidth: 1200, borderRadius: 'xl',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🦷 SmileCare Dental', links: [{label:'Services',href:'#'},{label:'Doctors',href:'#'},{label:'Gallery',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Book Appointment', href: '#', variant: 'primary', size: 'sm' } })], '#0E7490'),
    makeSection('Hero', [makeEl('hero', { heading: 'Your Perfect Smile Awaits', subheading: 'Painless Dental Care · Latest Technology · Certified Experts', text: 'We use advanced laser dentistry and sedation techniques for a completely comfortable experience.', cta: { label: 'Book Free Checkup', href: '#', variant: 'primary', size: 'lg' }, overlay: 45, align: 'center', bgImage: '' })], '#164E63'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 10000, label: 'Smiles Transformed', suffix: '+' }, { value: 5, label: 'Expert Dentists', suffix: '' }, { value: 15, label: 'Years Experience', suffix: '' }, { value: 98, label: 'Pain-Free Rate', suffix: '%' }] })], '#0891B2', { top: 40, bottom: 40 }),
    makeSection('Pricing', [makeEl('pricing', [{ name: 'Basic Care', price: '₹999', period: 'per visit', features: ['Consultation', 'X-Ray', 'Cleaning', 'Basic Filling'], cta: { label: 'Book Now', href: '#', variant: 'outline', size: 'md' }, highlighted: false }, { name: 'Smile Makeover', price: '₹25,000', period: 'package', features: ['Full Mouth Assessment', 'Teeth Whitening', 'Composite Bonding', 'Retainers Included', '6-Month Follow-up'], cta: { label: 'Get Your Smile', href: '#', variant: 'primary', size: 'md' }, highlighted: true, badge: '😁 Most Popular' }])], '#ECFEFF', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🦷 SmileCare Dental', tagline: 'Smile with confidence', columns: [{ heading: 'Services', links: [{ label: 'Teeth Whitening', href: '#' }, { label: 'Braces & Aligners', href: '#' }, { label: 'Root Canal', href: '#' }, { label: 'Implants', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 SmileCare Dental Clinic' })], '#0E7490'),
  ]),
},

{
  id: 'health-4', name: 'Gym & Fitness', category: 'healthcare',
  description: 'High-energy gym with dark red-black power aesthetic',
  tags: ['gym', 'fitness', 'workout', 'bodybuilding'],
  primaryColor: '#DC2626', secondaryColor: '#0A0A0A', accentColor: '#FACC15',
  headingFont: 'Montserrat', bodyFont: 'Roboto',
  previewBg: '#0A0A0A', previewAccent: '#DC2626',
  buildProject: () => makeProject('Gym & Fitness', {
    primaryColor: '#DC2626', secondaryColor: '#0A0A0A', accentColor: '#FACC15',
    headingFont: 'Montserrat', bodyFont: 'Roboto', baseFontSize: 16, maxWidth: 1280, borderRadius: 'sm',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '💪 POWER GYM', links: [{label:'Programs',href:'#'},{label:'Trainers',href:'#'},{label:'Membership',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Free Trial', href: '#', variant: 'primary', size: 'sm' } })], '#0A0A0A'),
    makeSection('Hero', [makeEl('hero', { heading: 'No Limits. Just Results.', subheading: '24/7 Open · Personal Training · Nutrition Plans', text: 'State-of-the-art equipment, expert trainers, and a community that pushes you to achieve your best.', cta: { label: 'Start Free Trial', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'See Membership', href: '#', variant: 'outline', size: 'lg' }, overlay: 70, align: 'left', bgImage: '' })], '#0A0A0A'),
    makeSection('Marquee', [makeEl('marquee', { items: ['💪 Weight Training', '🏃 Cardio Zone', '🧘 Yoga Studio', '🥊 Boxing Ring', '🏊 Swimming Pool', '🍎 Nutrition Coaching'], speed: 22, direction: 'left', separator: '  ⚡  ' })], '#DC2626'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 2000, label: 'Active Members', suffix: '+' }, { value: 20, label: 'Expert Trainers', suffix: '' }, { value: 10000, label: 'Sq Ft Facility', suffix: '' }, { value: 24, label: 'Hours Open', suffix: '/7' }] })], '#111111', { top: 50, bottom: 50 }),
    makeSection('Pricing', [makeEl('pricing', [{ name: 'Basic', price: '₹1,499', period: '/month', features: ['Gym Access', 'Locker Room', 'Group Classes'], cta: { label: 'Join Basic', href: '#', variant: 'outline', size: 'md' }, highlighted: false }, { name: 'Pro', price: '₹2,999', period: '/month', features: ['Everything in Basic', 'Personal Trainer (4/month)', 'Nutrition Plan', 'Body Composition Analysis', 'Pool Access'], cta: { label: 'Join Pro', href: '#', variant: 'primary', size: 'md' }, highlighted: true, badge: '🔥 Most Popular' }])], '#0A0A0A', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '💪 POWER GYM', tagline: 'Train hard. Live strong.', columns: [{ heading: 'Hours', links: [{ label: 'Open 24/7', href: '#' }] }, { heading: 'Location', links: [{ label: 'Andheri West, Mumbai', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }, { platform: 'youtube', url: '#' }], copyright: '2026 Power Gym' })], '#0A0A0A'),
  ]),
},

{
  id: 'health-5', name: 'Mental Health', category: 'healthcare',
  description: 'Calming lavender mental health and therapy practice',
  tags: ['therapy', 'mental health', 'counseling', 'psychology'],
  primaryColor: '#7C3AED', secondaryColor: '#FAF5FF', accentColor: '#6EE7B7',
  headingFont: 'Lora', bodyFont: 'Lato',
  previewBg: '#FAF5FF', previewAccent: '#7C3AED',
  buildProject: () => makeProject('Mental Health Clinic', {
    primaryColor: '#7C3AED', secondaryColor: '#FAF5FF', accentColor: '#6EE7B7',
    headingFont: 'Lora', bodyFont: 'Lato', baseFontSize: 17, maxWidth: 1100, borderRadius: 'xl',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🌸 MindSpace', links: [{label:'Services',href:'#'},{label:'Therapists',href:'#'},{label:'Blog',href:'#'},{label:'Book',href:'#'}], sticky: true, cta: { label: 'Book Session', href: '#', variant: 'primary', size: 'sm' } })], '#6D28D9'),
    makeSection('Hero', [makeEl('hero', { heading: 'Your Mental Health Matters', subheading: 'Therapy · Counselling · Psychiatry · Online Sessions', text: 'A safe, confidential space to heal, grow, and thrive. Our licensed therapists are here for you.', cta: { label: 'Book Free Consultation', href: '#', variant: 'primary', size: 'lg' }, overlay: 40, align: 'center', bgImage: '' })], '#4C1D95'),
    makeSection('Accordion', [makeEl('accordion', { items: [{ id: '1', question: 'Is therapy confidential?', answer: 'Absolutely. All sessions are strictly confidential under professional ethical guidelines.' }, { id: '2', question: 'Do you offer online sessions?', answer: 'Yes, all our therapists offer secure video sessions via our platform. Same quality, anywhere.' }, { id: '3', question: 'How do I choose a therapist?', answer: 'Take our 5-minute assessment and we will match you with the most suitable therapist for your needs.' }, { id: '4', question: 'What does a session cost?', answer: 'Sessions start at ₹1,500. We also offer sliding-scale fees for those in financial need.' }] })], '#FAF5FF', { top: 50, bottom: 50 }),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 5000, label: 'Lives Supported', suffix: '+' }, { value: 30, label: 'Licensed Therapists', suffix: '' }, { value: 98, label: 'Client Satisfaction', suffix: '%' }, { value: 10, label: 'Languages Supported', suffix: '' }] })], '#6D28D9', { top: 50, bottom: 50 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🌸 MindSpace', tagline: 'Healing begins here.', columns: [{ heading: 'Services', links: [{ label: 'Individual Therapy', href: '#' }, { label: 'Couples Counselling', href: '#' }, { label: 'Child Psychology', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 MindSpace Therapy Centre' })], '#4C1D95'),
  ]),
},

{
  id: 'health-6', name: 'Pharmacy', category: 'healthcare',
  description: 'Trusted pharmacy chain with green-white clean design',
  tags: ['pharmacy', 'medicine', 'healthcare', 'drugstore'],
  primaryColor: '#16A34A', secondaryColor: '#F0FDF4', accentColor: '#0EA5E9',
  headingFont: 'Inter', bodyFont: 'Inter',
  previewBg: '#F0FDF4', previewAccent: '#16A34A',
  buildProject: () => makeProject('MedPlus Pharmacy', {
    primaryColor: '#16A34A', secondaryColor: '#F0FDF4', accentColor: '#0EA5E9',
    headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1280, borderRadius: 'md',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '💊 MedPlus', links: [{label:'Products',href:'#'},{label:'Brands',href:'#'},{label:'Lab Tests',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Order Medicines', href: '#', variant: 'primary', size: 'sm' } })], '#14532D'),
    makeSection('Hero', [makeEl('hero', { heading: 'Medicines Delivered in 2 Hours', subheading: 'Genuine · Affordable · Reliable', text: '50,000+ medicines in stock. Certified pharmacists. Home delivery available pan-India.', cta: { label: 'Order Now', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Upload Prescription', href: '#', variant: 'outline', size: 'lg' }, overlay: 50, align: 'center', bgImage: '' })], '#14532D'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 50000, label: 'Products Available', suffix: '+' }, { value: 100, label: 'Store Locations', suffix: '+' }, { value: 2, label: 'Hour Delivery', suffix: 'h' }, { value: 20, label: 'Discount on Generics', suffix: '%' }] })], '#16A34A', { top: 40, bottom: 40 }),
    makeSection('Marquee', [makeEl('marquee', { items: ['💊 20% Off on Generics', '🧪 Home Lab Tests', '🩺 Doctor Consultation', '🚚 2-Hour Delivery', '📋 Easy Prescription Upload'], speed: 18, direction: 'left', separator: '  |  ' })], '#0EA5E9'),
    makeSection('Footer', [makeEl('footer', { logoText: '💊 MedPlus', tagline: 'Your health, our commitment', columns: [{ heading: 'Services', links: [{ label: 'Order Medicines', href: '#' }, { label: 'Lab Tests', href: '#' }, { label: 'Doctor Consult', href: '#' }] }], socials: [{ platform: 'facebook', url: '#' }], copyright: '2026 MedPlus Pharmacy. Lic. No. 20B/21B.' })], '#14532D'),
  ]),
},

// ═══════════════════ EDUCATION (21-26) ═══════════════════

{
  id: 'edu-1', name: 'Smart School', category: 'education',
  description: 'Modern school with blue-amber dynamic design',
  tags: ['school', 'education', 'kids', 'academic'],
  primaryColor: '#1D4ED8', secondaryColor: '#EFF6FF', accentColor: '#F59E0B',
  headingFont: 'Poppins', bodyFont: 'Roboto',
  previewBg: '#EFF6FF', previewAccent: '#1D4ED8',
  buildProject: () => makeProject('Smart School', {
    primaryColor: '#1D4ED8', secondaryColor: '#EFF6FF', accentColor: '#F59E0B',
    headingFont: 'Poppins', bodyFont: 'Roboto', baseFontSize: 16, maxWidth: 1280, borderRadius: 'md',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🎓 Smart School', links: [{label:'About',href:'#'},{label:'Academics',href:'#'},{label:'Admissions',href:'#'},{label:'Gallery',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Apply Now', href: '#', variant: 'primary', size: 'sm' } })], '#1E3A8A'),
    makeSection('Hero', [makeEl('hero', { heading: "Shaping Tomorrow's Leaders", subheading: 'Excellence in Education Since 1985', text: 'CBSE affiliated. Smart classrooms, expert faculty, and holistic development for every child.', cta: { label: 'Apply for Admission', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Virtual Tour', href: '#', variant: 'outline', size: 'lg' }, overlay: 60, align: 'left', bgImage: '' })], '#1E3A8A'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 3500, label: 'Students Enrolled', suffix: '' }, { value: 150, label: 'Expert Teachers', suffix: '+' }, { value: 40, label: 'Years of Excellence', suffix: '' }, { value: 98, label: 'Board Results', suffix: '%' }] })], '#1D4ED8', { top: 40, bottom: 40 }),
    makeSection('Gallery', [makeEl('gallery', { images: [{ src: '/photos/school.jpg', alt: 'Classroom', fit: 'cover' }, { src: '/photos/school.jpg', alt: 'Library', fit: 'cover' }, { src: '/photos/school.jpg', alt: 'Sports', fit: 'cover' }, { src: '/photos/school.jpg', alt: 'Lab', fit: 'cover' }], columns: 4, gap: 12, style: 'grid' })], '#EFF6FF', { top: 40, bottom: 40 }),
    makeSection('Accordion', [makeEl('accordion', { items: [{ id: '1', question: 'What curriculum do you follow?', answer: 'We follow the CBSE curriculum with a strong focus on competitive exam preparation and extracurricular excellence.' }, { id: '2', question: 'What is the admission process?', answer: 'Online application → Entrance test → Interview → Document verification → Fee payment. Process takes 2-3 weeks.' }, { id: '3', question: 'What facilities do you offer?', answer: 'Smart classrooms, science labs, computer labs, library, sports ground, swimming pool, auditorium, and canteen.' }] })], '#DBEAFE', { top: 50, bottom: 50 }),
    makeSection('CTA', [makeEl('cta', { heading: 'Admissions Open for 2026-27', text: 'Limited seats available. Apply before 31st March to secure early bird discount.', cta: { label: 'Apply Now', href: '#', variant: 'primary', size: 'lg' }, bgColor: '#F59E0B' })], '#F59E0B'),
    makeSection('Footer', [makeEl('footer', { logoText: '🎓 Smart School', tagline: 'Nurturing Minds, Building Futures', columns: [{ heading: 'Academics', links: [{ label: 'Pre-Primary', href: '#' }, { label: 'Primary (I-V)', href: '#' }, { label: 'Middle (VI-VIII)', href: '#' }, { label: 'Senior (IX-XII)', href: '#' }] }, { heading: 'Contact', links: [{ label: 'Noida, UP', href: '#' }, { label: '+91 98765 43210', href: '#' }] }], socials: [{ platform: 'facebook', url: '#' }, { platform: 'youtube', url: '#' }], copyright: '2026 Smart School. CBSE Affiliated.' })], '#1E3A8A'),
  ]),
},

{
  id: 'edu-2', name: 'Online Academy', category: 'education',
  description: 'E-learning platform with teal-green futuristic design',
  tags: ['online', 'elearning', 'courses', 'academy'],
  primaryColor: '#0891B2', secondaryColor: '#0C4A6E', accentColor: '#A3E635',
  headingFont: 'Inter', bodyFont: 'Inter',
  previewBg: '#0C4A6E', previewAccent: '#0891B2',
  buildProject: () => makeProject('Online Academy', {
    primaryColor: '#0891B2', secondaryColor: '#0C4A6E', accentColor: '#A3E635',
    headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1280, borderRadius: 'md',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '⚡ LearnPro', links: [{label:'Courses',href:'#'},{label:'Instructors',href:'#'},{label:'Pricing',href:'#'},{label:'Blog',href:'#'}], sticky: true, cta: { label: 'Start Free', href: '#', variant: 'primary', size: 'sm' } })], '#0C4A6E'),
    makeSection('Hero', [makeEl('hero', { heading: 'Learn Anytime. Grow Everywhere.', subheading: '500+ Courses by Industry Experts', text: 'Upskill with live classes, recorded videos, and 1-on-1 mentorship. Certificate upon completion.', cta: { label: 'Browse Courses', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Free Trial', href: '#', variant: 'outline', size: 'lg' }, overlay: 60, align: 'center', bgImage: '' })], '#0C4A6E'),
    makeSection('Marquee', [makeEl('marquee', { items: ['Python', 'Data Science', 'Web Dev', 'AI/ML', 'Digital Marketing', 'React', 'Node.js', 'AWS', 'Cybersecurity', 'UI/UX Design'], speed: 20, direction: 'left', separator: '  →  ' })], '#0891B2'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 50000, label: 'Students Enrolled', suffix: '+' }, { value: 500, label: 'Courses Available', suffix: '+' }, { value: 200, label: 'Expert Instructors', suffix: '' }, { value: 95, label: 'Job Placement Rate', suffix: '%' }] })], '#164E63', { top: 50, bottom: 50 }),
    makeSection('Pricing', [makeEl('pricing', [{ name: 'Basic', price: '₹999', period: '/month', features: ['Access to 100 Courses', 'Video Lessons', 'Community Forum', 'Certificate'], cta: { label: 'Start Basic', href: '#', variant: 'outline', size: 'md' }, highlighted: false }, { name: 'Pro', price: '₹1,999', period: '/month', features: ['All 500+ Courses', 'Live Classes', '1-on-1 Mentorship', 'Job Assistance', 'Priority Support'], cta: { label: 'Go Pro', href: '#', variant: 'primary', size: 'md' }, highlighted: true, badge: 'Best Value' }, { name: 'Enterprise', price: '₹4,999', period: '/month', features: ['Everything in Pro', 'Team Access (5 seats)', 'Custom Learning Path', 'Dedicated Manager'], cta: { label: 'Contact Sales', href: '#', variant: 'outline', size: 'md' }, highlighted: false }])], '#0C4A6E', { top: 60, bottom: 60 }),
    makeSection('Testimonial', [makeEl('testimonial', { name: 'Kavya Reddy', role: 'Software Engineer at Infosys', text: 'LearnPro helped me transition from a non-tech background to a full-stack developer in 6 months. Best investment ever!', rating: 5 })], '#164E63', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '⚡ LearnPro', tagline: 'Skills for the digital economy', columns: [{ heading: 'Categories', links: [{ label: 'Technology', href: '#' }, { label: 'Business', href: '#' }, { label: 'Design', href: '#' }, { label: 'Marketing', href: '#' }] }, { heading: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Careers', href: '#' }, { label: 'Blog', href: '#' }] }], socials: [{ platform: 'youtube', url: '#' }, { platform: 'twitter', url: '#' }, { platform: 'linkedin', url: '#' }], copyright: '2026 LearnPro Academy' })], '#0C4A6E'),
  ]),
},

{
  id: 'edu-3', name: 'Music Academy', category: 'education',
  description: 'Vibrant music school with purple-orange creative palette',
  tags: ['music', 'guitar', 'piano', 'academy'],
  primaryColor: '#9333EA', secondaryColor: '#1A0030', accentColor: '#FB923C',
  headingFont: 'Raleway', bodyFont: 'Lato',
  previewBg: '#1A0030', previewAccent: '#9333EA',
  buildProject: () => makeProject('Music Academy', {
    primaryColor: '#9333EA', secondaryColor: '#1A0030', accentColor: '#FB923C',
    headingFont: 'Raleway', bodyFont: 'Lato', baseFontSize: 16, maxWidth: 1200, borderRadius: 'lg',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🎵 NOTA Music Academy', links: [{label:'Courses',href:'#'},{label:'Faculty',href:'#'},{label:'Events',href:'#'},{label:'Enroll',href:'#'}], sticky: true, cta: { label: 'Free Trial Class', href: '#', variant: 'primary', size: 'sm' } })], '#1A0030'),
    makeSection('Hero', [makeEl('hero', { heading: 'Learn Music. Live the Rhythm.', subheading: 'Guitar · Piano · Vocals · Tabla · Violin', text: 'Professional music training for all ages, from beginners to advanced. Affiliated with Trinity College London.', cta: { label: 'Book Free Trial', href: '#', variant: 'primary', size: 'lg' }, overlay: 60, align: 'center', bgImage: '' })], '#2E0060'),
    makeSection('Marquee', [makeEl('marquee', { items: ['🎸 Guitar', '🎹 Piano', '🎤 Vocals', '🥁 Drums', '🎻 Violin', '🪗 Tabla', '🎺 Trumpet', '🎙️ Recording'], speed: 20, direction: 'left', separator: '  ♪  ' })], '#9333EA'),
    makeSection('Tabs', [makeEl('tabs', { items: [{ id: 't1', label: 'Western', content: 'Guitar (acoustic/electric), Piano, Keyboard, Violin, Drums, Vocals. Trinity and ABRSM exams.' }, { id: 't2', label: 'Hindustani', content: 'Tabla, Sitar, Harmonium, Classical Vocals, Flute. Prayag Sangeet Samiti exams.' }, { id: 't3', label: 'Production', content: 'Music production, DAW, mixing, mastering, songwriting for ages 14+.' }] })], '#1A0030', { top: 50, bottom: 50 }),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 1000, label: 'Students Learning', suffix: '+' }, { value: 15, label: 'Instruments Taught', suffix: '' }, { value: 20, label: 'Qualified Faculty', suffix: '' }, { value: 12, label: 'Years in Music Education', suffix: '' }] })], '#2E0060', { top: 50, bottom: 50 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🎵 NOTA Music Academy', tagline: 'Where music meets passion', columns: [{ heading: 'Courses', links: [{ label: 'Guitar', href: '#' }, { label: 'Piano', href: '#' }, { label: 'Vocals', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }, { platform: 'youtube', url: '#' }], copyright: '2026 NOTA Music Academy' })], '#1A0030'),
  ]),
},

{
  id: 'edu-4', name: 'Coaching Institute', category: 'education',
  description: 'Competitive exam coaching with bold red-white academic look',
  tags: ['coaching', 'iit', 'neet', 'upsc', 'competitive'],
  primaryColor: '#B91C1C', secondaryColor: '#FFF5F5', accentColor: '#1D4ED8',
  headingFont: 'Poppins', bodyFont: 'Inter',
  previewBg: '#FFF5F5', previewAccent: '#B91C1C',
  buildProject: () => makeProject('Success Coaching Institute', {
    primaryColor: '#B91C1C', secondaryColor: '#FFF5F5', accentColor: '#1D4ED8',
    headingFont: 'Poppins', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1280, borderRadius: 'md',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '📚 SUCCESS IIT-NEET', links: [{label:'Courses',href:'#'},{label:'Results',href:'#'},{label:'Faculty',href:'#'},{label:'Enroll',href:'#'}], sticky: true, cta: { label: 'Free Demo Class', href: '#', variant: 'primary', size: 'sm' } })], '#991B1B'),
    makeSection('Hero', [makeEl('hero', { heading: '500+ IIT Selections in 2025', subheading: 'IIT-JEE · NEET · UPSC · CAT · Banking', text: 'India\'s most trusted coaching institute. Small batches, personal attention, and a proven methodology.', cta: { label: 'Enroll Now', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'View Results', href: '#', variant: 'outline', size: 'lg' }, overlay: 65, align: 'left', bgImage: '' })], '#7F1D1D'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 500, label: 'IIT Selections 2025', suffix: '+' }, { value: 1200, label: 'NEET Qualifiers', suffix: '+' }, { value: 25, label: 'Years of Excellence', suffix: '' }, { value: 50, label: 'Expert Faculty', suffix: '+' }] })], '#B91C1C', { top: 40, bottom: 40 }),
    makeSection('Testimonial', [makeEl('testimonial', { name: 'Aryan Singh', role: 'IIT Delhi — AIR 47', text: 'The problem-solving approach at Success Institute is unlike anywhere else. My doubt sessions were key to my success.', rating: 5 })], '#FFF5F5', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '📚 SUCCESS IIT-NEET', tagline: 'Your success is our mission', columns: [{ heading: 'Courses', links: [{ label: 'IIT-JEE (Mains & Advanced)', href: '#' }, { label: 'NEET-UG', href: '#' }, { label: 'UPSC (IAS/IPS)', href: '#' }] }], socials: [{ platform: 'youtube', url: '#' }], copyright: '2026 Success Coaching Institute' })], '#7F1D1D'),
  ]),
},

{
  id: 'edu-5', name: 'Kindergarten', category: 'education',
  description: 'Playful and colorful early childhood education center',
  tags: ['kindergarten', 'playschool', 'kids', 'preschool'],
  primaryColor: '#F97316', secondaryColor: '#FFF7ED', accentColor: '#8B5CF6',
  headingFont: 'Nunito', bodyFont: 'Nunito',
  previewBg: '#FFF7ED', previewAccent: '#F97316',
  buildProject: () => makeProject('Little Stars Kindergarten', {
    primaryColor: '#F97316', secondaryColor: '#FFF7ED', accentColor: '#8B5CF6',
    headingFont: 'Nunito', bodyFont: 'Nunito', baseFontSize: 17, maxWidth: 1200, borderRadius: 'xl',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '⭐ Little Stars', links: [{label:'About',href:'#'},{label:'Programs',href:'#'},{label:'Gallery',href:'#'},{label:'Admissions',href:'#'}], sticky: true, cta: { label: 'Enroll Now', href: '#', variant: 'primary', size: 'sm' } })], '#EA580C'),
    makeSection('Hero', [makeEl('hero', { heading: 'Where Every Child Shines!', subheading: 'Playschool · Nursery · LKG · UKG · Daycare', text: 'A nurturing environment where children learn through play, creativity, and exploration. Ages 1.5 to 6 years.', cta: { label: 'Enroll Your Child', href: '#', variant: 'primary', size: 'lg' }, overlay: 40, align: 'center', bgImage: '' })], '#FFEDD5'),
    makeSection('Marquee', [makeEl('marquee', { items: ['🎨 Art & Craft', '📚 Story Time', '🎵 Music & Dance', '🌱 Nature Play', '🧩 Puzzles & Games', '🏃 Outdoor Activities'], speed: 18, direction: 'left', separator: '  ⭐  ' })], '#F97316'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 200, label: 'Happy Kids', suffix: '' }, { value: 15, label: 'Trained Teachers', suffix: '' }, { value: 10, label: 'Years of Nurturing', suffix: '' }, { value: 1.5, label: 'Acres Green Campus', suffix: '' }] })], '#FFF7ED', { top: 40, bottom: 40 }),
    makeSection('Footer', [makeEl('footer', { logoText: '⭐ Little Stars', tagline: 'Every child is a star!', columns: [{ heading: 'Programs', links: [{ label: 'Playgroup (1.5-2.5 yrs)', href: '#' }, { label: 'Nursery (2.5-3.5 yrs)', href: '#' }, { label: 'LKG/UKG (3.5-6 yrs)', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }, { platform: 'facebook', url: '#' }], copyright: '2026 Little Stars Kindergarten' })], '#EA580C'),
  ]),
},

{
  id: 'edu-6', name: 'Language School', category: 'education',
  description: 'Global language institute with world-map inspired teal design',
  tags: ['language', 'english', 'french', 'ielts'],
  primaryColor: '#0F766E', secondaryColor: '#F0FDFA', accentColor: '#FCD34D',
  headingFont: 'Montserrat', bodyFont: 'Open Sans',
  previewBg: '#F0FDFA', previewAccent: '#0F766E',
  buildProject: () => makeProject('Lingua Language School', {
    primaryColor: '#0F766E', secondaryColor: '#F0FDFA', accentColor: '#FCD34D',
    headingFont: 'Montserrat', bodyFont: 'Open Sans', baseFontSize: 16, maxWidth: 1280, borderRadius: 'lg',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🌍 LINGUA', links: [{label:'Languages',href:'#'},{label:'Exams',href:'#'},{label:'Online',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Free Demo', href: '#', variant: 'primary', size: 'sm' } })], '#134E4A'),
    makeSection('Hero', [makeEl('hero', { heading: 'Speak the World\'s Languages', subheading: 'English · French · German · Spanish · Mandarin · Japanese', text: 'Native speakers and certified CELTA teachers. IELTS, TOEFL, DELF, GOETHE exam preparation.', cta: { label: 'Book Free Demo', href: '#', variant: 'primary', size: 'lg' }, overlay: 50, align: 'left', bgImage: '' })], '#134E4A'),
    makeSection('Tabs', [makeEl('tabs', { items: [{ id: 't1', label: '🇬🇧 English', content: 'Spoken English, Business English, IELTS (Band 7+), TOEFL, PTE. Morning/Evening batches.' }, { id: 't2', label: '🇫🇷 French', content: 'A1 to C2 levels. DELF/DALF exam prep. Native French instructors. Weekend batches.' }, { id: 't3', label: '🇩🇪 German', content: 'A1 to B2. Goethe-Institut exam preparation. Study abroad Germany pathway.' }, { id: 't4', label: '🇯🇵 Japanese', content: 'N5 to N2 JLPT. Business Japanese. Japan work visa coaching.' }] })], '#F0FDFA', { top: 50, bottom: 50 }),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 8, label: 'Languages Taught', suffix: '' }, { value: 5000, label: 'Students Trained', suffix: '+' }, { value: 15, label: 'Years Experience', suffix: '' }, { value: 95, label: 'Exam Pass Rate', suffix: '%' }] })], '#0F766E', { top: 50, bottom: 50 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🌍 LINGUA', tagline: 'Language opens every door', columns: [{ heading: 'Languages', links: [{ label: 'English', href: '#' }, { label: 'French', href: '#' }, { label: 'German', href: '#' }, { label: 'Japanese', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 Lingua Language School' })], '#134E4A'),
  ]),
},

// ═══════════════════ REAL ESTATE (27-31) ═══════════════════

{
  id: 're-1', name: 'Luxury Properties', category: 'realestate',
  description: 'Premium real estate with gold-navy luxury branding',
  tags: ['realestate', 'luxury', 'premium', 'property'],
  primaryColor: '#C9A227', secondaryColor: '#0B1437', accentColor: '#E5D5A3',
  headingFont: 'Playfair Display', bodyFont: 'Inter',
  previewBg: '#0B1437', previewAccent: '#C9A227',
  buildProject: () => makeProject('Luxury Properties', {
    primaryColor: '#C9A227', secondaryColor: '#0B1437', accentColor: '#E5D5A3',
    headingFont: 'Playfair Display', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1400, borderRadius: 'sm',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '◆ PRESTIGE HOMES', links: [{label:'Properties',href:'#'},{label:'Projects',href:'#'},{label:'About',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Schedule Visit', href: '#', variant: 'primary', size: 'sm' } })], '#0B1437'),
    makeSection('Hero', [makeEl('hero', { heading: 'Live in Unparalleled Luxury', subheading: "Premium Residences Across India's Prime Locations", text: 'Handcrafted homes that redefine elegance. Where every detail is perfection.', cta: { label: 'View Properties', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Download Brochure', href: '#', variant: 'outline', size: 'lg' }, overlay: 65, align: 'left', bgImage: '' })], '#0B1437'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 500, label: 'Properties Delivered', suffix: '+' }, { value: 2000, label: 'Happy Families', suffix: '+' }, { value: 15, label: 'Premium Projects', suffix: '' }, { value: 25, label: 'Cities Across India', suffix: '' }] })], '#C9A227', { top: 40, bottom: 40 }),
    makeSection('Gallery', [makeEl('gallery', { images: [{ src: '/photos/hospital.jpg', alt: 'Penthouse', fit: 'cover' }, { src: '/photos/hospital.jpg', alt: 'Villa', fit: 'cover' }, { src: '/photos/hospital.jpg', alt: 'Apartment', fit: 'cover' }], columns: 3, gap: 16, style: 'grid' })], '#0F1E4A', { top: 50, bottom: 50 }),
    makeSection('Testimonial', [makeEl('testimonial', { name: 'Arjun Malhotra', role: 'Property Owner, Mumbai', text: 'Prestige delivered a penthouse that exceeded every expectation. The quality, location, and service are truly world-class.', rating: 5 })], '#0B1437', { top: 60, bottom: 60 }),
    makeSection('CTA', [makeEl('cta', { heading: 'Ready to Find Your Dream Home?', text: 'Schedule a private viewing with our luxury property consultants.', cta: { label: 'Schedule Viewing', href: '#', variant: 'primary', size: 'lg' }, bgColor: '#C9A227' })], '#C9A227'),
    makeSection('Footer', [makeEl('footer', { logoText: '◆ PRESTIGE HOMES', tagline: 'Where luxury meets livability', columns: [{ heading: 'Locations', links: [{ label: 'Mumbai', href: '#' }, { label: 'Delhi NCR', href: '#' }, { label: 'Bangalore', href: '#' }, { label: 'Hyderabad', href: '#' }] }, { heading: 'Services', links: [{ label: 'Buy Property', href: '#' }, { label: 'Sell Property', href: '#' }, { label: 'Home Loans', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }, { platform: 'facebook', url: '#' }], copyright: '2026 Prestige Homes. RERA Registered.' })], '#070E2A'),
  ]),
},

{
  id: 're-2', name: 'Budget Housing', category: 'realestate',
  description: 'Affordable housing developer with orange-white approachable design',
  tags: ['realestate', 'affordable', 'housing', 'flats'],
  primaryColor: '#EA580C', secondaryColor: '#FFF7ED', accentColor: '#1D4ED8',
  headingFont: 'Poppins', bodyFont: 'Roboto',
  previewBg: '#FFF7ED', previewAccent: '#EA580C',
  buildProject: () => makeProject('Budget Housing', {
    primaryColor: '#EA580C', secondaryColor: '#FFF7ED', accentColor: '#1D4ED8',
    headingFont: 'Poppins', bodyFont: 'Roboto', baseFontSize: 16, maxWidth: 1280, borderRadius: 'md',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🏠 HomeFirst', links: [{label:'Projects',href:'#'},{label:'EMI Calculator',href:'#'},{label:'About',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Enquire Now', href: '#', variant: 'primary', size: 'sm' } })], '#C2410C'),
    makeSection('Hero', [makeEl('hero', { heading: 'Your First Home Starts Here', subheading: 'Affordable 1BHK, 2BHK & 3BHK Flats', text: 'PMAY eligible properties starting ₹18 lakhs. Home loans arranged. No hidden charges.', cta: { label: 'View Projects', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'EMI Calculator', href: '#', variant: 'outline', size: 'lg' }, overlay: 55, align: 'left', bgImage: '' })], '#9A3412'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 5000, label: 'Families Housed', suffix: '+' }, { value: 25, label: 'Projects Delivered', suffix: '' }, { value: 10, label: 'Cities', suffix: '' }, { value: 18, label: 'Lakh Starting Price', suffix: 'L+' }] })], '#EA580C', { top: 40, bottom: 40 }),
    makeSection('Accordion', [makeEl('accordion', { items: [{ id: '1', question: 'Am I eligible for PMAY subsidy?', answer: 'If this is your first home and your annual income is below ₹18 lakhs, you likely qualify for up to ₹2.67 lakh subsidy.' }, { id: '2', question: 'What documents do I need?', answer: 'Aadhar card, PAN card, income proof (salary slip/ITR), bank statements, and address proof.' }, { id: '3', question: 'How long for possession?', answer: 'Ready-to-move units available. Under construction projects: 18-24 months. RERA timeline guaranteed.' }] })], '#FFF7ED', { top: 50, bottom: 50 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🏠 HomeFirst', tagline: "Your dream home, at your budget", columns: [{ heading: 'Projects', links: [{ label: 'Pune', href: '#' }, { label: 'Nashik', href: '#' }, { label: 'Aurangabad', href: '#' }] }], socials: [{ platform: 'facebook', url: '#' }], copyright: '2026 HomeFirst Developers. RERA Reg.' })], '#9A3412'),
  ]),
},

{
  id: 're-3', name: 'Commercial Real Estate', category: 'realestate',
  description: 'Corporate commercial property with slate-blue professional design',
  tags: ['commercial', 'office', 'coworking', 'property'],
  primaryColor: '#334155', secondaryColor: '#F8FAFC', accentColor: '#0EA5E9',
  headingFont: 'Inter', bodyFont: 'Inter',
  previewBg: '#F8FAFC', previewAccent: '#334155',
  buildProject: () => makeProject('Commercial Real Estate', {
    primaryColor: '#334155', secondaryColor: '#F8FAFC', accentColor: '#0EA5E9',
    headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1280, borderRadius: 'sm',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: 'NEXUS COMMERCIAL', links: [{label:'Office Spaces',href:'#'},{label:'Warehouses',href:'#'},{label:'Retail',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Get Quote', href: '#', variant: 'primary', size: 'sm' } })], '#1E293B'),
    makeSection('Hero', [makeEl('hero', { heading: 'Premium Commercial Spaces', subheading: 'Office · Retail · Warehouse · Co-working', text: 'Grade-A commercial properties in business districts across Mumbai, Delhi, Bangalore, and Hyderabad.', cta: { label: 'View Listings', href: '#', variant: 'primary', size: 'lg' }, overlay: 60, align: 'left', bgImage: '' })], '#1E293B'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 2000000, label: 'Sq Ft Managed', suffix: '' }, { value: 200, label: 'Corporate Clients', suffix: '+' }, { value: 50, label: 'Premium Buildings', suffix: '' }, { value: 20, label: 'Years in Commercial RE', suffix: '' }] })], '#334155', { top: 40, bottom: 40 }),
    makeSection('Tabs', [makeEl('tabs', { items: [{ id: 't1', label: 'Office Spaces', content: 'From 500 to 50,000 sq ft. Fully furnished and bare shell options. Business park and CBD locations.' }, { id: 't2', label: 'Warehouses', content: 'Industrial grade warehouses from 5,000 sq ft. Cold storage, temperature-controlled, and standard units.' }, { id: 't3', label: 'Retail', content: 'High-street retail, mall spaces, and showrooms in prime locations with high footfall.' }] })], '#F8FAFC', { top: 50, bottom: 50 }),
    makeSection('Footer', [makeEl('footer', { logoText: 'NEXUS COMMERCIAL', tagline: 'Space for your ambition.', columns: [{ heading: 'Cities', links: [{ label: 'Mumbai', href: '#' }, { label: 'Delhi NCR', href: '#' }, { label: 'Bangalore', href: '#' }] }], socials: [{ platform: 'linkedin', url: '#' }], copyright: '2026 Nexus Commercial Properties' })], '#1E293B'),
  ]),
},

{
  id: 're-4', name: 'Interior Design', category: 'realestate',
  description: 'Elegant interior design studio with dusty rose and gold palette',
  tags: ['interior', 'design', 'decor', 'renovation'],
  primaryColor: '#BE185D', secondaryColor: '#FFF1F2', accentColor: '#D97706',
  headingFont: 'Playfair Display', bodyFont: 'Lato',
  previewBg: '#FFF1F2', previewAccent: '#BE185D',
  buildProject: () => makeProject('Interior Design Studio', {
    primaryColor: '#BE185D', secondaryColor: '#FFF1F2', accentColor: '#D97706',
    headingFont: 'Playfair Display', bodyFont: 'Lato', baseFontSize: 16, maxWidth: 1300, borderRadius: 'lg',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '✦ Elara Interiors', links: [{label:'Portfolio',href:'#'},{label:'Services',href:'#'},{label:'3D Walkthrough',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Get Free Quote', href: '#', variant: 'primary', size: 'sm' } })], '#881337'),
    makeSection('Hero', [makeEl('hero', { heading: 'Spaces That Tell Your Story', subheading: 'Residential · Commercial · Turnkey Interior Design', text: 'Award-winning interior designers creating beautiful, functional spaces across India.', cta: { label: 'View Portfolio', href: '#', variant: 'primary', size: 'lg' }, overlay: 45, align: 'center', bgImage: '' })], '#4C0519'),
    makeSection('Gallery', [makeEl('gallery', { images: [{ src: '/photos/hospital.jpg', alt: 'Living Room', fit: 'cover' }, { src: '/photos/school.jpg', alt: 'Bedroom', fit: 'cover' }, { src: '/photos/restaurant.jpg', alt: 'Kitchen', fit: 'cover' }, { src: '/photos/hospital.jpg', alt: 'Office', fit: 'cover' }], columns: 4, gap: 6, style: 'grid' })], '#FFF1F2', { top: 30, bottom: 30 }),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 300, label: 'Projects Delivered', suffix: '' }, { value: 10, label: 'Years Experience', suffix: '' }, { value: 15, label: 'Design Awards', suffix: '' }, { value: 48, label: 'Day Project Handover', suffix: '' }] })], '#BE185D', { top: 50, bottom: 50 }),
    makeSection('Pricing', [makeEl('pricing', [{ name: 'Starter Package', price: '₹999', period: '/sq ft', features: ['Basic Modular Kitchen', 'Wardrobe', 'False Ceiling', 'Paint'], cta: { label: 'Get Quote', href: '#', variant: 'outline', size: 'md' }, highlighted: false }, { name: 'Premium Package', price: '₹1,799', period: '/sq ft', features: ['Italian Modular Kitchen', 'Luxury Wardrobes', 'Designer Ceiling', 'Premium Flooring', 'Smart Home Basics', '10-Year Warranty'], cta: { label: 'Choose Premium', href: '#', variant: 'primary', size: 'md' }, highlighted: true, badge: 'Best Selling' }])], '#FFF1F2', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '✦ Elara Interiors', tagline: 'Beauty meets function', columns: [{ heading: 'Services', links: [{ label: 'Residential Design', href: '#' }, { label: 'Office Interiors', href: '#' }, { label: '3D Visualization', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 Elara Interior Design' })], '#4C0519'),
  ]),
},

{
  id: 're-5', name: 'Property Management', category: 'realestate',
  description: 'Reliable property management with cool grey-green trust palette',
  tags: ['property', 'rental', 'management', 'landlord'],
  primaryColor: '#15803D', secondaryColor: '#F0FDF4', accentColor: '#6366F1',
  headingFont: 'Inter', bodyFont: 'Open Sans',
  previewBg: '#F0FDF4', previewAccent: '#15803D',
  buildProject: () => makeProject('Property Management', {
    primaryColor: '#15803D', secondaryColor: '#F0FDF4', accentColor: '#6366F1',
    headingFont: 'Inter', bodyFont: 'Open Sans', baseFontSize: 16, maxWidth: 1280, borderRadius: 'md',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🔑 PropCare', links: [{label:'Services',href:'#'},{label:'Listings',href:'#'},{label:'Landlords',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'List Property', href: '#', variant: 'primary', size: 'sm' } })], '#14532D'),
    makeSection('Hero', [makeEl('hero', { heading: 'Hassle-Free Property Management', subheading: 'Tenant Finding · Rent Collection · Maintenance · Legal', text: 'We manage your property so you can sit back and earn. Full-service management from ₹499/month.', cta: { label: 'List Your Property', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Browse Rentals', href: '#', variant: 'outline', size: 'lg' }, overlay: 55, align: 'center', bgImage: '' })], '#14532D'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 2000, label: 'Properties Managed', suffix: '+' }, { value: 98, label: 'Rent Collection Rate', suffix: '%' }, { value: 15, label: 'Day Tenant Finding', suffix: '' }, { value: 5, label: 'Years Operating', suffix: '' }] })], '#15803D', { top: 40, bottom: 40 }),
    makeSection('Accordion', [makeEl('accordion', { items: [{ id: '1', question: 'What does property management include?', answer: 'Tenant screening, rent collection, maintenance coordination, legal documentation, and regular property inspections.' }, { id: '2', question: 'What is your fee?', answer: 'We charge 8% of monthly rent. Full-service management with no hidden fees.' }, { id: '3', question: 'How do you find tenants?', answer: 'We list on 10+ platforms, verify tenants with background checks, and find quality tenants in 15 days on average.' }] })], '#F0FDF4', { top: 50, bottom: 50 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🔑 PropCare', tagline: 'Your property, our responsibility', columns: [{ heading: 'Services', links: [{ label: 'Tenant Finding', href: '#' }, { label: 'Rent Collection', href: '#' }, { label: 'Maintenance', href: '#' }] }], socials: [{ platform: 'facebook', url: '#' }], copyright: '2026 PropCare Property Management' })], '#14532D'),
  ]),
},

// ═══════════════════ TECHNOLOGY (32-36) ═══════════════════

{
  id: 'tech-1', name: 'SaaS Platform', category: 'technology',
  description: 'Deep indigo SaaS product with futuristic UI',
  tags: ['saas', 'software', 'cloud', 'b2b'],
  primaryColor: '#4F46E5', secondaryColor: '#0F172A', accentColor: '#818CF8',
  headingFont: 'Inter', bodyFont: 'Inter',
  previewBg: '#0F172A', previewAccent: '#4F46E5',
  buildProject: () => makeProject('SaaS Platform', {
    primaryColor: '#4F46E5', secondaryColor: '#0F172A', accentColor: '#818CF8',
    headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1280, borderRadius: 'lg',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '⬡ CloudSync', links: [{label:'Features',href:'#'},{label:'Pricing',href:'#'},{label:'Docs',href:'#'},{label:'Blog',href:'#'}], sticky: true, cta: { label: 'Start Free Trial', href: '#', variant: 'primary', size: 'sm' } })], '#0F172A'),
    makeSection('Hero', [makeEl('hero', { heading: 'The Platform That Scales With You', subheading: 'All-in-one business management powered by AI', text: 'From startup to enterprise — CloudSync adapts to your needs. 14-day free trial, no credit card required.', cta: { label: '🚀 Start Free Trial', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Watch Demo', href: '#', variant: 'outline', size: 'lg' }, overlay: 50, align: 'center', bgImage: '' })], '#0F172A'),
    makeSection('Marquee', [makeEl('marquee', { items: ['CRM', 'Project Management', 'Invoicing', 'Analytics', 'Team Chat', 'Automation', 'API Access', 'White Label'], speed: 25, direction: 'left', separator: '  ◆  ' })], '#4F46E5'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 10000, label: 'Active Teams', suffix: '+' }, { value: 99.9, label: 'Uptime SLA', suffix: '%' }, { value: 50, label: 'Integrations', suffix: '+' }, { value: 4.9, label: 'App Store Rating', suffix: '★' }] })], '#1E1B4B', { top: 50, bottom: 50 }),
    makeSection('Pricing', [makeEl('pricing', [{ name: 'Starter', price: '₹0', period: '/month', features: ['Up to 3 users', '5 Projects', '1GB Storage', 'Basic Analytics'], cta: { label: 'Start Free', href: '#', variant: 'outline', size: 'md' }, highlighted: false }, { name: 'Growth', price: '₹2,999', period: '/month', features: ['Up to 20 users', 'Unlimited Projects', '50GB Storage', 'Advanced Analytics', 'Automation', 'Priority Support'], cta: { label: 'Start Growth', href: '#', variant: 'primary', size: 'md' }, highlighted: true, badge: '🔥 Most Popular' }, { name: 'Enterprise', price: 'Custom', period: 'pricing', features: ['Unlimited Users', 'Custom Integrations', 'Dedicated Server', 'SLA Agreement', 'Custom Training'], cta: { label: 'Contact Sales', href: '#', variant: 'outline', size: 'md' }, highlighted: false }])], '#0F172A', { top: 60, bottom: 60 }),
    makeSection('Testimonial', [makeEl('testimonial', { name: 'Vikash Gupta', role: 'CTO, Growthify Inc.', text: 'CloudSync replaced 5 different tools for us. Our team productivity went up by 40% in the first month.', rating: 5 })], '#1E1B4B', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '⬡ CloudSync', tagline: 'Work smarter, grow faster', columns: [{ heading: 'Product', links: [{ label: 'Features', href: '#' }, { label: 'Pricing', href: '#' }, { label: 'Changelog', href: '#' }, { label: 'Roadmap', href: '#' }] }, { heading: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Careers', href: '#' }] }, { heading: 'Legal', links: [{ label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }] }], socials: [{ platform: 'twitter', url: '#' }, { platform: 'linkedin', url: '#' }], copyright: '2026 CloudSync Technologies Pvt Ltd.' })], '#070D1F'),
  ]),
},

{
  id: 'tech-2', name: 'AI Product', category: 'technology',
  description: 'Purple AI startup with gradient modern aesthetic',
  tags: ['ai', 'ml', 'automation', 'startup'],
  primaryColor: '#7C3AED', secondaryColor: '#1E1B4B', accentColor: '#C4B5FD',
  headingFont: 'Poppins', bodyFont: 'Inter',
  previewBg: '#1E1B4B', previewAccent: '#7C3AED',
  buildProject: () => makeProject('AI Product', {
    primaryColor: '#7C3AED', secondaryColor: '#1E1B4B', accentColor: '#C4B5FD',
    headingFont: 'Poppins', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1280, borderRadius: 'xl',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🤖 NeuralAI', links: [{label:'Product',href:'#'},{label:'Use Cases',href:'#'},{label:'Pricing',href:'#'},{label:'Docs',href:'#'}], sticky: true, cta: { label: 'Try for Free', href: '#', variant: 'primary', size: 'sm' } })], '#1E1B4B'),
    makeSection('Hero', [makeEl('hero', { heading: 'Powered by Artificial Intelligence', subheading: 'Automate. Analyze. Accelerate.', text: 'NeuralAI processes your business data to deliver actionable insights, automate workflows, and predict outcomes.', cta: { label: 'Start Free Trial', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'See Demo', href: '#', variant: 'outline', size: 'lg' }, overlay: 50, align: 'center', bgImage: '' })], '#1E1B4B'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 1000000, label: 'Decisions Made Daily', suffix: '' }, { value: 95, label: 'Accuracy Rate', suffix: '%' }, { value: 500, label: 'Enterprise Clients', suffix: '+' }, { value: 10, label: 'X Faster Than Manual', suffix: '' }] })], '#2D1B69', { top: 50, bottom: 50 }),
    makeSection('Accordion', [makeEl('accordion', { items: [{ id: '1', question: 'What can NeuralAI automate?', answer: 'Customer support, data analysis, report generation, lead scoring, inventory management, and much more.' }, { id: '2', question: 'Is my data secure?', answer: 'Yes. We are SOC 2 Type II certified and use end-to-end encryption. Your data never trains our models.' }, { id: '3', question: 'How long to set up?', answer: 'Most customers are live within 48 hours. Our onboarding team handles the full setup.' }, { id: '4', question: 'Do you offer an API?', answer: 'Yes, full REST API with comprehensive documentation. Webhooks and SDKs also available.' }] })], '#1E1B4B', { top: 50, bottom: 50 }),
    makeSection('CTA', [makeEl('cta', { heading: 'Ready to Automate Your Business?', text: 'Join 500+ companies already saving 20+ hours per week with NeuralAI.', cta: { label: 'Start Free Trial', href: '#', variant: 'primary', size: 'lg' }, bgColor: '#7C3AED' })], '#7C3AED'),
    makeSection('Footer', [makeEl('footer', { logoText: '🤖 NeuralAI', tagline: 'Intelligence, amplified', columns: [{ heading: 'Product', links: [{ label: 'Features', href: '#' }, { label: 'Integrations', href: '#' }, { label: 'API Docs', href: '#' }] }], socials: [{ platform: 'twitter', url: '#' }, { platform: 'linkedin', url: '#' }], copyright: '2026 NeuralAI Inc.' })], '#12102E'),
  ]),
},

{
  id: 'tech-3', name: 'Mobile App', category: 'technology',
  description: 'Vibrant mobile app landing page with cyan-dark design',
  tags: ['app', 'mobile', 'ios', 'android'],
  primaryColor: '#06B6D4', secondaryColor: '#0C1A2E', accentColor: '#F472B6',
  headingFont: 'Poppins', bodyFont: 'Inter',
  previewBg: '#0C1A2E', previewAccent: '#06B6D4',
  buildProject: () => makeProject('Mobile App', {
    primaryColor: '#06B6D4', secondaryColor: '#0C1A2E', accentColor: '#F472B6',
    headingFont: 'Poppins', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1280, borderRadius: 'xl',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '📱 AppName', links: [{label:'Features',href:'#'},{label:'Pricing',href:'#'},{label:'Blog',href:'#'}], sticky: true, cta: { label: 'Download App', href: '#', variant: 'primary', size: 'sm' } })], '#0C1A2E'),
    makeSection('Hero', [makeEl('hero', { heading: 'The App That Changes Everything', subheading: 'Available on iOS and Android', text: 'Join 2 million users who have simplified their life with AppName. Free to download.', cta: { label: '📱 Download Free', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Watch Demo', href: '#', variant: 'outline', size: 'lg' }, overlay: 55, align: 'center', bgImage: '' })], '#0C1A2E'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 2000000, label: 'Downloads', suffix: '+' }, { value: 4.8, label: 'App Store Rating', suffix: '★' }, { value: 150, label: 'Countries', suffix: '' }, { value: 99, label: 'Uptime', suffix: '%' }] })], '#0E4155', { top: 50, bottom: 50 }),
    makeSection('Pricing', [makeEl('pricing', [{ name: 'Free', price: '₹0', period: 'forever', features: ['Core Features', '5GB Storage', 'Standard Support'], cta: { label: 'Download Free', href: '#', variant: 'outline', size: 'md' }, highlighted: false }, { name: 'Premium', price: '₹399', period: '/month', features: ['All Features', 'Unlimited Storage', 'Priority Support', 'No Ads', 'Offline Mode'], cta: { label: 'Go Premium', href: '#', variant: 'primary', size: 'md' }, highlighted: true, badge: '✨ Best Experience' }])], '#0C1A2E', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '📱 AppName', tagline: 'Simplify your life', columns: [{ heading: 'Download', links: [{ label: 'App Store', href: '#' }, { label: 'Google Play', href: '#' }] }, { heading: 'Support', links: [{ label: 'Help Center', href: '#' }, { label: 'Contact Us', href: '#' }] }], socials: [{ platform: 'twitter', url: '#' }, { platform: 'instagram', url: '#' }], copyright: '2026 AppName Technologies' })], '#0C1A2E'),
  ]),
},

{
  id: 'tech-4', name: 'Cybersecurity', category: 'technology',
  description: 'Dark green hacker-aesthetic cybersecurity firm',
  tags: ['cybersecurity', 'infosec', 'consulting', 'security'],
  primaryColor: '#16A34A', secondaryColor: '#020C02', accentColor: '#4ADE80',
  headingFont: 'Roboto Mono', bodyFont: 'Roboto',
  previewBg: '#020C02', previewAccent: '#16A34A',
  buildProject: () => makeProject('Cybersecurity Firm', {
    primaryColor: '#16A34A', secondaryColor: '#020C02', accentColor: '#4ADE80',
    headingFont: 'Inter', bodyFont: 'Roboto', baseFontSize: 16, maxWidth: 1280, borderRadius: 'sm',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🔒 SHIELDNET', links: [{label:'Services',href:'#'},{label:'Solutions',href:'#'},{label:'Certifications',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Free Security Audit', href: '#', variant: 'primary', size: 'sm' } })], '#020C02'),
    makeSection('Hero', [makeEl('hero', { heading: 'Your Business. Fortress Protected.', subheading: 'Penetration Testing · VAPT · SOC · Compliance', text: 'ISO 27001, GDPR, PCI-DSS certified cybersecurity experts protecting 500+ enterprises nationwide.', cta: { label: 'Get Free Security Audit', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Our Services', href: '#', variant: 'outline', size: 'lg' }, overlay: 70, align: 'left', bgImage: '' })], '#020C02'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 500, label: 'Enterprises Protected', suffix: '+' }, { value: 10000, label: 'Threats Neutralized', suffix: '+' }, { value: 0, label: 'Data Breaches for Clients', suffix: '' }, { value: 15, label: 'Years in Security', suffix: '' }] })], '#082008', { top: 50, bottom: 50 }),
    makeSection('Accordion', [makeEl('accordion', { items: [{ id: '1', question: 'What is a VAPT assessment?', answer: 'Vulnerability Assessment and Penetration Testing — we find your security weaknesses before hackers do.' }, { id: '2', question: 'How long does an audit take?', answer: 'Basic audit: 3-5 days. Full enterprise audit: 2-4 weeks. Emergency response: same day.' }, { id: '3', question: 'Do you offer compliance help?', answer: 'Yes. We help achieve ISO 27001, SOC 2, GDPR, PCI-DSS, and RBI cybersecurity compliance.' }] })], '#020C02', { top: 50, bottom: 50 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🔒 SHIELDNET', tagline: 'Protect. Detect. Respond.', columns: [{ heading: 'Services', links: [{ label: 'Penetration Testing', href: '#' }, { label: 'SOC Services', href: '#' }, { label: 'Compliance', href: '#' }] }], socials: [{ platform: 'linkedin', url: '#' }], copyright: '2026 ShieldNet Cybersecurity' })], '#020C02'),
  ]),
},

{
  id: 'tech-5', name: 'Web Development', category: 'technology',
  description: 'Bold web development agency with electric blue-black',
  tags: ['webdev', 'development', 'react', 'nextjs'],
  primaryColor: '#2563EB', secondaryColor: '#050A14', accentColor: '#38BDF8',
  headingFont: 'Space Grotesk', bodyFont: 'Inter',
  previewBg: '#050A14', previewAccent: '#2563EB',
  buildProject: () => makeProject('Web Development Agency', {
    primaryColor: '#2563EB', secondaryColor: '#050A14', accentColor: '#38BDF8',
    headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1280, borderRadius: 'md',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '</> DEVCRAFT', links: [{label:'Services',href:'#'},{label:'Portfolio',href:'#'},{label:'Technologies',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Start Project', href: '#', variant: 'primary', size: 'sm' } })], '#050A14'),
    makeSection('Hero', [makeEl('hero', { heading: 'We Build Web Products That Scale', subheading: 'React · Next.js · Node.js · Cloud · API', text: 'Full-stack web development for startups and enterprises. From MVP to production-ready in weeks.', cta: { label: 'Start Your Project', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'View Portfolio', href: '#', variant: 'outline', size: 'lg' }, overlay: 60, align: 'left', bgImage: '' })], '#050A14'),
    makeSection('Marquee', [makeEl('marquee', { items: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'GraphQL'], speed: 20, direction: 'left', separator: '  //  ' })], '#2563EB'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 80, label: 'Projects Shipped', suffix: '+' }, { value: 60, label: 'Happy Clients', suffix: '' }, { value: 5, label: 'Years of Excellence', suffix: '' }, { value: 100, label: 'On-Time Delivery', suffix: '%' }] })], '#0A1628', { top: 50, bottom: 50 }),
    makeSection('Pricing', [makeEl('pricing', [{ name: 'MVP', price: '₹75,000', period: 'one-time', features: ['Landing Page + 5 pages', 'Mobile Responsive', 'CMS Integration', 'Basic SEO', '2-week delivery'], cta: { label: 'Build MVP', href: '#', variant: 'outline', size: 'md' }, highlighted: false }, { name: 'Full Product', price: '₹3,00,000', period: 'one-time', features: ['Custom Web App', 'API Development', 'Authentication', 'Dashboard & Analytics', '3-Month Support', 'AWS Deployment'], cta: { label: 'Build Product', href: '#', variant: 'primary', size: 'md' }, highlighted: true, badge: '🚀 Most Chosen' }])], '#050A14', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '</> DEVCRAFT', tagline: 'Code that delivers.', columns: [{ heading: 'Services', links: [{ label: 'Web Development', href: '#' }, { label: 'API Development', href: '#' }, { label: 'Cloud Setup', href: '#' }] }], socials: [{ platform: 'github', url: '#' }, { platform: 'linkedin', url: '#' }], copyright: '2026 DevCraft Technologies' })], '#050A14'),
  ]),
},

// ═══════════════════ CORPORATE (37-40) ═══════════════════

{
  id: 'corp-1', name: 'Finance & Banking', category: 'corporate',
  description: 'Trustworthy financial services with navy-gold authority',
  tags: ['finance', 'banking', 'investment', 'corporate'],
  primaryColor: '#1E40AF', secondaryColor: '#EFF6FF', accentColor: '#C9A227',
  headingFont: 'Raleway', bodyFont: 'Roboto',
  previewBg: '#EFF6FF', previewAccent: '#1E40AF',
  buildProject: () => makeProject('Finance & Banking', {
    primaryColor: '#1E40AF', secondaryColor: '#EFF6FF', accentColor: '#C9A227',
    headingFont: 'Raleway', bodyFont: 'Roboto', baseFontSize: 16, maxWidth: 1280, borderRadius: 'sm',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '⬡ TrustCapital', links: [{label:'Services',href:'#'},{label:'Products',href:'#'},{label:'About',href:'#'},{label:'Investors',href:'#'}], sticky: true, cta: { label: 'Open Account', href: '#', variant: 'primary', size: 'sm' } })], '#1E3A8A'),
    makeSection('Hero', [makeEl('hero', { heading: 'Your Financial Future, Secured', subheading: 'Banking · Investments · Insurance · Loans', text: 'RBI regulated financial services trusted by over 2 lakh customers across India.', cta: { label: 'Open Free Account', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Calculate Returns', href: '#', variant: 'outline', size: 'lg' }, overlay: 60, align: 'left', bgImage: '' })], '#1E3A8A'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 200000, label: 'Customers Served', suffix: '+' }, { value: 5000, label: 'Crore Assets Managed', suffix: '+ Cr' }, { value: 25, label: 'Years in Finance', suffix: '' }, { value: 4.8, label: 'Customer Trust Score', suffix: '/5' }] })], '#1E40AF', { top: 40, bottom: 40 }),
    makeSection('Services', [makeEl('accordion', { items: [{ id: '1', question: '💰 Fixed Deposits', answer: 'Earn up to 8.5% p.a. on fixed deposits. Flexible tenures from 7 days to 10 years. Senior citizen special rates available.' }, { id: '2', question: '📈 Mutual Funds', answer: 'Invest in 1000+ mutual funds across equity, debt, and hybrid categories. SIP starting ₹500/month.' }, { id: '3', question: '🏠 Home Loans', answer: 'Home loans at 8.25% p.a. Up to 90% financing. Quick approval in 48 hours. No prepayment penalty.' }, { id: '4', question: '🛡️ Insurance', answer: 'Term life, health, vehicle, and business insurance. Claim settlement ratio of 98%.' }] })], '#EFF6FF', { top: 50, bottom: 50 }),
    makeSection('Progress', [makeEl('progress', { items: [{ label: 'Loan Approval Rate', value: 92 }, { label: 'Customer Retention', value: 96 }, { label: 'Digital Transactions', value: 85 }, { label: 'Customer Satisfaction', value: 94 }] })], '#DBEAFE', { top: 50, bottom: 50 }),
    makeSection('Footer', [makeEl('footer', { logoText: '⬡ TrustCapital', tagline: 'Your financial partner for life', columns: [{ heading: 'Services', links: [{ label: 'Fixed Deposits', href: '#' }, { label: 'Mutual Funds', href: '#' }, { label: 'Home Loans', href: '#' }, { label: 'Insurance', href: '#' }] }, { heading: 'Information', links: [{ label: 'About Us', href: '#' }, { label: 'Annual Report', href: '#' }, { label: 'RBI Guidelines', href: '#' }] }], socials: [{ platform: 'linkedin', url: '#' }, { platform: 'twitter', url: '#' }], copyright: '2026 TrustCapital Finance Ltd. NBFC Registered with RBI.' })], '#1E3A8A'),
  ]),
},

{
  id: 'corp-2', name: 'Law Firm', category: 'corporate',
  description: 'Prestigious law firm with charcoal-gold gravitas',
  tags: ['legal', 'law', 'attorney', 'firm'],
  primaryColor: '#C9A227', secondaryColor: '#1C1917', accentColor: '#E5D5A3',
  headingFont: 'Playfair Display', bodyFont: 'Roboto',
  previewBg: '#1C1917', previewAccent: '#C9A227',
  buildProject: () => makeProject('Law Firm', {
    primaryColor: '#C9A227', secondaryColor: '#1C1917', accentColor: '#E5D5A3',
    headingFont: 'Playfair Display', bodyFont: 'Roboto', baseFontSize: 16, maxWidth: 1280, borderRadius: 'none',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: 'SHARMA & ASSOCIATES', links: [{label:'Practice Areas',href:'#'},{label:'Our Team',href:'#'},{label:'Case Results',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Free Consultation', href: '#', variant: 'primary', size: 'sm' } })], '#1C1917'),
    makeSection('Hero', [makeEl('hero', { heading: 'Justice Through Excellence', subheading: 'Trusted Legal Counsel for 30+ Years', text: 'Experienced advocates specializing in corporate law, civil litigation, and criminal defence across all Indian courts.', cta: { label: 'Free Legal Consultation', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Our Achievements', href: '#', variant: 'outline', size: 'lg' }, overlay: 65, align: 'left', bgImage: '' })], '#1C1917'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 5000, label: 'Cases Won', suffix: '+' }, { value: 30, label: 'Years Experience', suffix: '' }, { value: 15, label: 'Senior Advocates', suffix: '' }, { value: 98, label: 'Client Satisfaction', suffix: '%' }] })], '#C9A227', { top: 40, bottom: 40 }),
    makeSection('Services', [makeEl('accordion', { items: [{ id: '1', question: 'Corporate & Commercial Law', answer: 'Business incorporation, M&A, contracts, IP protection, and compliance advisory for corporations of all sizes.' }, { id: '2', question: 'Civil Litigation', answer: 'Property disputes, contract enforcement, family law, consumer protection cases at District, High Court and Supreme Court.' }, { id: '3', question: 'Criminal Defence', answer: 'Bail applications, trial representation, appeals. Strong track record across High Courts nationwide.' }, { id: '4', question: 'Arbitration & Mediation', answer: 'Alternative dispute resolution for faster, cost-effective settlements. Domestic and international arbitration.' }] })], '#292524', { top: 50, bottom: 50 }),
    makeSection('Testimonial', [makeEl('testimonial', { name: 'Ravi Shankar Enterprises', role: 'Corporate Client', text: 'Sharma & Associates resolved a complex merger dispute in 6 months that had been dragging for 3 years. Exceptional expertise.', rating: 5 })], '#1C1917', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: 'SHARMA & ASSOCIATES', tagline: 'Your rights. Our mission.', columns: [{ heading: 'Practice Areas', links: [{ label: 'Corporate Law', href: '#' }, { label: 'Civil Litigation', href: '#' }, { label: 'Criminal Defence', href: '#' }, { label: 'Arbitration', href: '#' }] }, { heading: 'Offices', links: [{ label: 'New Delhi (Head Office)', href: '#' }, { label: 'Mumbai', href: '#' }, { label: 'Bangalore', href: '#' }] }], socials: [{ platform: 'linkedin', url: '#' }], copyright: '2026 Sharma & Associates. Bar Council Registered.' })], '#111110'),
  ]),
},

{
  id: 'corp-3', name: 'Manufacturing', category: 'corporate',
  description: 'Industrial manufacturing company with steel-blue heavy industry look',
  tags: ['manufacturing', 'industrial', 'b2b', 'factory'],
  primaryColor: '#0369A1', secondaryColor: '#F0F4F8', accentColor: '#F97316',
  headingFont: 'Raleway', bodyFont: 'Open Sans',
  previewBg: '#F0F4F8', previewAccent: '#0369A1',
  buildProject: () => makeProject('Manufacturing Company', {
    primaryColor: '#0369A1', secondaryColor: '#F0F4F8', accentColor: '#F97316',
    headingFont: 'Raleway', bodyFont: 'Open Sans', baseFontSize: 16, maxWidth: 1280, borderRadius: 'none',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '⚙️ STEELFORCE IND.', links: [{label:'Products',href:'#'},{label:'Capabilities',href:'#'},{label:'Quality',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Get Quote', href: '#', variant: 'primary', size: 'sm' } })], '#0C4A6E'),
    makeSection('Hero', [makeEl('hero', { heading: 'Precision Engineering. Global Standards.', subheading: 'ISO 9001:2015 Certified · 40 Years of Excellence', text: 'Manufacturer of precision components for automotive, aerospace, and industrial sectors. Exports to 30+ countries.', cta: { label: 'View Products', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Get Quote', href: '#', variant: 'outline', size: 'lg' }, overlay: 65, align: 'left', bgImage: '' })], '#0C4A6E'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 500, label: 'Product Variants', suffix: '+' }, { value: 30, label: 'Export Countries', suffix: '' }, { value: 40, label: 'Years Experience', suffix: '' }, { value: 99.8, label: 'Quality Rate', suffix: '%' }] })], '#0369A1', { top: 40, bottom: 40 }),
    makeSection('Progress', [makeEl('progress', { items: [{ label: 'On-Time Delivery', value: 98 }, { label: 'Quality Acceptance Rate', value: 99 }, { label: 'Client Repeat Order Rate', value: 92 }, { label: 'Export Revenue Share', value: 60 }] })], '#F0F4F8', { top: 50, bottom: 50 }),
    makeSection('Footer', [makeEl('footer', { logoText: '⚙️ STEELFORCE IND.', tagline: 'Built to last. Built for the world.', columns: [{ heading: 'Products', links: [{ label: 'Automotive Parts', href: '#' }, { label: 'Aerospace Components', href: '#' }, { label: 'Industrial Equipment', href: '#' }] }, { heading: 'Certifications', links: [{ label: 'ISO 9001:2015', href: '#' }, { label: 'IATF 16949', href: '#' }] }], socials: [{ platform: 'linkedin', url: '#' }], copyright: '2026 Steelforce Industries Pvt Ltd.' })], '#0C4A6E'),
  ]),
},

{
  id: 'corp-4', name: 'Consulting Firm', category: 'corporate',
  description: 'Premium management consulting with sharp navy-white authority',
  tags: ['consulting', 'strategy', 'management', 'advisory'],
  primaryColor: '#1E3A5F', secondaryColor: '#F8FAFF', accentColor: '#C9A227',
  headingFont: 'Inter', bodyFont: 'Inter',
  previewBg: '#F8FAFF', previewAccent: '#1E3A5F',
  buildProject: () => makeProject('Consulting Firm', {
    primaryColor: '#1E3A5F', secondaryColor: '#F8FAFF', accentColor: '#C9A227',
    headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1280, borderRadius: 'sm',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: 'APEX CONSULTING', links: [{label:'Services',href:'#'},{label:'Industries',href:'#'},{label:'Insights',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Talk to Expert', href: '#', variant: 'primary', size: 'sm' } })], '#0F2040'),
    makeSection('Hero', [makeEl('hero', { heading: 'Transforming Businesses, Creating Value', subheading: 'Strategy · Operations · Digital · M&A Advisory', text: 'Partner with India\'s leading management consultancy to unlock your organization\'s true potential.', cta: { label: 'Schedule Free Consultation', href: '#', variant: 'primary', size: 'lg' }, overlay: 65, align: 'left', bgImage: '' })], '#0F2040'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 200, label: 'Engagements Delivered', suffix: '+' }, { value: 50, label: 'Fortune 500 Clients', suffix: '' }, { value: 20, label: 'Years of Impact', suffix: '' }, { value: 5000, label: 'Cr Revenue Impact Created', suffix: '+' }] })], '#1E3A5F', { top: 50, bottom: 50 }),
    makeSection('Tabs', [makeEl('tabs', { items: [{ id: 't1', label: 'Strategy', content: 'Market entry, competitive strategy, growth roadmaps, diversification, M&A due diligence.' }, { id: 't2', label: 'Operations', content: 'Process improvement, supply chain optimization, cost reduction, lean transformation, ERP.' }, { id: 't3', label: 'Digital', content: 'Digital transformation strategy, technology selection, IT modernization, data analytics.' }] })], '#F8FAFF', { top: 50, bottom: 50 }),
    makeSection('Footer', [makeEl('footer', { logoText: 'APEX CONSULTING', tagline: 'Clarity in complexity.', columns: [{ heading: 'Services', links: [{ label: 'Strategy', href: '#' }, { label: 'Operations', href: '#' }, { label: 'Digital Transformation', href: '#' }] }], socials: [{ platform: 'linkedin', url: '#' }], copyright: '2026 Apex Management Consulting' })], '#0F2040'),
  ]),
},

// ═══════════════════ EVENTS (41-44) ═══════════════════

{
  id: 'event-1', name: 'Wedding Planner', category: 'events',
  description: 'Romantic rose-gold wedding planning with elegant design',
  tags: ['wedding', 'events', 'bridal', 'planning'],
  primaryColor: '#BE185D', secondaryColor: '#FFF1F2', accentColor: '#FCA5A5',
  headingFont: 'Playfair Display', bodyFont: 'Lato',
  previewBg: '#FFF1F2', previewAccent: '#BE185D',
  buildProject: () => makeProject('Wedding Planner', {
    primaryColor: '#BE185D', secondaryColor: '#FFF1F2', accentColor: '#FCA5A5',
    headingFont: 'Playfair Display', bodyFont: 'Lato', baseFontSize: 17, maxWidth: 1200, borderRadius: 'xl',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '💍 Eternal Weddings', links: [{label:'Packages',href:'#'},{label:'Gallery',href:'#'},{label:'Vendors',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Get Quote', href: '#', variant: 'primary', size: 'sm' } })], '#BE185D'),
    makeSection('Hero', [makeEl('hero', { heading: 'Your Dream Wedding, Made Real', subheading: 'Crafting Unforgettable Love Stories Since 2008', text: 'From intimate ceremonies to grand celebrations — we plan, coordinate, and execute every detail perfectly.', cta: { label: '💍 Plan My Wedding', href: '#', variant: 'primary', size: 'lg' }, overlay: 45, align: 'center', bgImage: '' })], '#4A0E2D'),
    makeSection('Marquee', [makeEl('marquee', { items: ['💐 Floral Design', '📸 Photography', '🎵 Live Music', '🍽️ Catering', '🕯️ Decor', '💒 Venue Selection', '🎊 Mehendi & Sangeet'], speed: 22, direction: 'left', separator: '  ♥  ' })], '#FCA5A5'),
    makeSection('Pricing', [makeEl('pricing', [{ name: 'Classic', price: '₹2,49,999', period: 'full wedding', features: ['Venue Selection', 'Catering (200 pax)', 'Decor & Flowers', 'Photography', 'Day-of Coordination'], cta: { label: 'Choose Classic', href: '#', variant: 'outline', size: 'md' }, highlighted: false }, { name: 'Royal', price: '₹5,99,999', period: 'full wedding', features: ['Everything in Classic', 'Pre-wedding Shoot', '3-Day Celebration', 'Mehendi & Sangeet', 'Luxury Hotel Rooms', 'Celebrity DJ'], cta: { label: 'Choose Royal', href: '#', variant: 'primary', size: 'md' }, highlighted: true, badge: '👑 Most Popular' }])], '#FFF1F2', { top: 60, bottom: 60 }),
    makeSection('Testimonial', [makeEl('testimonial', { name: 'Shreya & Arjun Mehta', role: 'Married February 2025', text: 'Eternal Weddings made our dream wedding come true. Not a single thing went wrong. Every moment was magical!', rating: 5 })], '#BE185D', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '💍 Eternal Weddings', tagline: 'Love deserves perfection', columns: [{ heading: 'Services', links: [{ label: 'Wedding Planning', href: '#' }, { label: 'Engagement Party', href: '#' }, { label: 'Mehendi Night', href: '#' }] }, { heading: 'Contact', links: [{ label: 'Delhi & NCR', href: '#' }, { label: '+91 98765 43210', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }, { platform: 'youtube', url: '#' }], copyright: '2026 Eternal Weddings' })], '#4A0E2D'),
  ]),
},

{
  id: 'event-2', name: 'Photography Studio', category: 'events',
  description: 'Dark luxury photography portfolio with warm gold tones',
  tags: ['photography', 'studio', 'portfolio', 'creative'],
  primaryColor: '#C9A227', secondaryColor: '#0D0D0D', accentColor: '#FDE68A',
  headingFont: 'Montserrat', bodyFont: 'Inter',
  previewBg: '#0D0D0D', previewAccent: '#C9A227',
  buildProject: () => makeProject('Photography Studio', {
    primaryColor: '#C9A227', secondaryColor: '#0D0D0D', accentColor: '#FDE68A',
    headingFont: 'Montserrat', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1400, borderRadius: 'none',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '📸 LENS & LIGHT', links: [{label:'Portfolio',href:'#'},{label:'Services',href:'#'},{label:'Prints',href:'#'},{label:'Book',href:'#'}], sticky: true })], '#0D0D0D'),
    makeSection('Hero', [makeEl('hero', { heading: 'Every Moment. Captured Forever.', subheading: 'Wedding · Commercial · Portrait · Events', text: 'Award-winning photographer based in Mumbai with 10 years of creating timeless memories.', cta: { label: 'View Portfolio', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Book Session', href: '#', variant: 'outline', size: 'lg' }, overlay: 60, align: 'left', bgImage: '' })], '#0D0D0D'),
    makeSection('Gallery', [makeEl('gallery', { images: [{ src: '/photos/restaurant.jpg', alt: 'Wedding', fit: 'cover' }, { src: '/photos/hospital.jpg', alt: 'Portrait', fit: 'cover' }, { src: '/photos/school.jpg', alt: 'Commercial', fit: 'cover' }, { src: '/photos/restaurant.jpg', alt: 'Events', fit: 'cover' }, { src: '/photos/hospital.jpg', alt: 'Nature', fit: 'cover' }, { src: '/photos/school.jpg', alt: 'Product', fit: 'cover' }], columns: 3, gap: 4, style: 'grid' })], '#111111', { top: 20, bottom: 20 }),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 500, label: 'Weddings Shot', suffix: '+' }, { value: 2000, label: 'Photo Sessions', suffix: '+' }, { value: 50, label: 'Brand Clients', suffix: '+' }, { value: 10, label: 'Years Experience', suffix: '' }] })], '#1A1600', { top: 50, bottom: 50 }),
    makeSection('Pricing', [makeEl('pricing', [{ name: 'Portrait Session', price: '₹8,999', period: '2 hours', features: ['2-hour shoot', '50 edited photos', 'Online gallery', 'Print releases'], cta: { label: 'Book Session', href: '#', variant: 'outline', size: 'md' }, highlighted: false }, { name: 'Wedding Full Day', price: '₹79,999', period: 'full day', features: ['12-hour coverage', '500+ edited photos', '2 photographers', 'Same-day preview', 'USB + online gallery', 'Pre-wedding shoot'], cta: { label: 'Book Wedding', href: '#', variant: 'primary', size: 'md' }, highlighted: true, badge: 'Full Package' }])], '#0D0D0D', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '📸 LENS & LIGHT', tagline: 'Light. Moment. Memory.', columns: [{ heading: 'Services', links: [{ label: 'Wedding Photography', href: '#' }, { label: 'Portraits', href: '#' }, { label: 'Commercial', href: '#' }] }, { heading: 'Contact', links: [{ label: 'Mumbai, Maharashtra', href: '#' }, { label: 'photo@lenslight.in', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }, { platform: 'youtube', url: '#' }], copyright: '2026 Lens & Light Photography' })], '#0D0D0D'),
  ]),
},

{
  id: 'event-3', name: 'Event Management', category: 'events',
  description: 'Corporate event management with electric green-black energy',
  tags: ['events', 'corporate', 'conference', 'management'],
  primaryColor: '#16A34A', secondaryColor: '#030E06', accentColor: '#86EFAC',
  headingFont: 'Poppins', bodyFont: 'Roboto',
  previewBg: '#030E06', previewAccent: '#16A34A',
  buildProject: () => makeProject('Event Management', {
    primaryColor: '#16A34A', secondaryColor: '#030E06', accentColor: '#86EFAC',
    headingFont: 'Poppins', bodyFont: 'Roboto', baseFontSize: 16, maxWidth: 1280, borderRadius: 'md',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🎪 EVENTPRO', links: [{label:'Services',href:'#'},{label:'Past Events',href:'#'},{label:'Clients',href:'#'},{label:'Contact',href:'#'}], sticky: true, cta: { label: 'Plan My Event', href: '#', variant: 'primary', size: 'sm' } })], '#030E06'),
    makeSection('Hero', [makeEl('hero', { heading: 'Events That Leave Lasting Impressions', subheading: 'Corporate · Conferences · Product Launches · Galas', text: 'End-to-end event management for brands that expect excellence. 1000+ events delivered across India.', cta: { label: 'Plan My Event', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'View Portfolio', href: '#', variant: 'outline', size: 'lg' }, overlay: 70, align: 'center', bgImage: '' })], '#030E06'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 1000, label: 'Events Delivered', suffix: '+' }, { value: 200, label: 'Corporate Clients', suffix: '' }, { value: 50000, label: 'Guests Managed', suffix: '+' }, { value: 15, label: 'Years in Events', suffix: '' }] })], '#14532D', { top: 50, bottom: 50 }),
    makeSection('Tabs', [makeEl('tabs', { items: [{ id: 't1', label: 'Corporate', content: 'Annual conferences, town halls, team outings, award nights, product launches, trade shows.' }, { id: 't2', label: 'Weddings', content: 'Destination weddings, sangeet nights, reception parties. Full vendor management.' }, { id: 't3', label: 'Social', content: 'Birthday galas, anniversary parties, graduation ceremonies, charity events.' }] })], '#030E06', { top: 50, bottom: 50 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🎪 EVENTPRO', tagline: 'Where moments become memories', columns: [{ heading: 'Services', links: [{ label: 'Corporate Events', href: '#' }, { label: 'Weddings', href: '#' }, { label: 'Social Events', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 EventPro Management' })], '#030E06'),
  ]),
},

{
  id: 'event-4', name: 'Concert & Music', category: 'events',
  description: 'Concert booking platform with neon-dark live music vibe',
  tags: ['concert', 'music', 'tickets', 'live'],
  primaryColor: '#EC4899', secondaryColor: '#0D0017', accentColor: '#A78BFA',
  headingFont: 'Montserrat', bodyFont: 'Inter',
  previewBg: '#0D0017', previewAccent: '#EC4899',
  buildProject: () => makeProject('Concert & Music Events', {
    primaryColor: '#EC4899', secondaryColor: '#0D0017', accentColor: '#A78BFA',
    headingFont: 'Montserrat', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1280, borderRadius: 'lg',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🎵 VIVID EVENTS', links: [{label:'Upcoming',href:'#'},{label:'Artists',href:'#'},{label:'Venues',href:'#'},{label:'Tickets',href:'#'}], sticky: true, cta: { label: 'Get Tickets', href: '#', variant: 'primary', size: 'sm' } })], '#0D0017'),
    makeSection('Hero', [makeEl('hero', { heading: 'Experience Live Music Like Never Before', subheading: 'Concerts · Festivals · Club Nights · Stand-up Comedy', text: "India's biggest live entertainment platform. 500+ events every month across 20 cities.", cta: { label: '🎫 Browse Events', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Sell Tickets', href: '#', variant: 'outline', size: 'lg' }, overlay: 70, align: 'center', bgImage: '' })], '#0D0017'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 500, label: 'Events Monthly', suffix: '+' }, { value: 20, label: 'Cities', suffix: '' }, { value: 1000000, label: 'Tickets Sold', suffix: '+' }, { value: 500, label: 'Artists', suffix: '+' }] })], '#1A0035', { top: 50, bottom: 50 }),
    makeSection('Marquee', [makeEl('marquee', { items: ['🎸 Rock Nights', '🎤 EDM Festivals', '🎭 Stand-Up Comedy', '🎻 Classical Concerts', '🥁 Jazz & Blues', '🎺 Indie Music'], speed: 20, direction: 'left', separator: '  🎵  ' })], '#EC4899'),
    makeSection('Footer', [makeEl('footer', { logoText: '🎵 VIVID EVENTS', tagline: 'Life is better with live music', columns: [{ heading: 'Explore', links: [{ label: 'Concerts', href: '#' }, { label: 'Festivals', href: '#' }, { label: 'Comedy', href: '#' }] }, { heading: 'Cities', links: [{ label: 'Mumbai', href: '#' }, { label: 'Delhi', href: '#' }, { label: 'Bangalore', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }, { platform: 'youtube', url: '#' }], copyright: '2026 Vivid Events Pvt Ltd' })], '#0D0017'),
  ]),
},

// ═══════════════════ E-COMMERCE (45-47) ═══════════════════

{
  id: 'shop-1', name: 'Fashion Store', category: 'ecommerce',
  description: 'Bold fashion brand with crimson-black luxury e-commerce',
  tags: ['fashion', 'clothing', 'ecommerce', 'style'],
  primaryColor: '#BE123C', secondaryColor: '#1C0A12', accentColor: '#FB7185',
  headingFont: 'Montserrat', bodyFont: 'Inter',
  previewBg: '#1C0A12', previewAccent: '#BE123C',
  buildProject: () => makeProject('Fashion Store', {
    primaryColor: '#BE123C', secondaryColor: '#1C0A12', accentColor: '#FB7185',
    headingFont: 'Montserrat', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1400, borderRadius: 'sm',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: 'VOGUE INDIA', links: [{label:'Women',href:'#'},{label:'Men',href:'#'},{label:'Sale',href:'#'},{label:'New Arrivals',href:'#'}], sticky: true, cta: { label: 'Shop Now', href: '#', variant: 'primary', size: 'sm' } })], '#1C0A12'),
    makeSection('Hero', [makeEl('hero', { heading: 'Style That Speaks for Itself', subheading: 'New Collection — Autumn Winter 2026', text: 'Curated fashion for the bold and the beautiful. Premium fabrics, thoughtful design.', cta: { label: 'Shop New Arrivals', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Sale Up to 50% Off', href: '#', variant: 'outline', size: 'lg' }, overlay: 65, align: 'left', bgImage: '' })], '#1C0A12'),
    makeSection('Marquee', [makeEl('marquee', { items: ['🆓 Free Shipping above ₹999', '↩️ 30-Day Easy Returns', '✅ COD Available', '💳 No Cost EMI', '🎁 Gift Wrapping Available'], speed: 18, direction: 'left', separator: '  ·  ' })], '#BE123C'),
    makeSection('Gallery', [makeEl('gallery', { images: [{ src: '/photos/restaurant.jpg', alt: 'Collection 1', fit: 'cover' }, { src: '/photos/hospital.jpg', alt: 'Collection 2', fit: 'cover' }, { src: '/photos/school.jpg', alt: 'Collection 3', fit: 'cover' }, { src: '/photos/restaurant.jpg', alt: 'Collection 4', fit: 'cover' }], columns: 4, gap: 8, style: 'grid' })], '#2C1020', { top: 30, bottom: 30 }),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 50000, label: 'Happy Customers', suffix: '+' }, { value: 2000, label: 'Products', suffix: '+' }, { value: 50, label: 'Premium Brands', suffix: '+' }, { value: 99, label: 'Return Rate', suffix: '%' }] })], '#1C0A12', { top: 40, bottom: 40 }),
    makeSection('CTA', [makeEl('cta', { heading: '🎉 Season End Sale — Up to 70% Off', text: 'Limited stock. Use code SEASON70 at checkout.', cta: { label: 'Shop the Sale', href: '#', variant: 'primary', size: 'lg' }, bgColor: '#BE123C' })], '#BE123C'),
    makeSection('Footer', [makeEl('footer', { logoText: 'VOGUE INDIA', tagline: 'Fashion for every story', columns: [{ heading: 'Shop', links: [{ label: 'Women', href: '#' }, { label: 'Men', href: '#' }, { label: 'Sale', href: '#' }] }, { heading: 'Help', links: [{ label: 'Track Order', href: '#' }, { label: 'Returns', href: '#' }, { label: 'Size Guide', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }, { platform: 'youtube', url: '#' }], copyright: '2026 Vogue India Fashion' })], '#100208'),
  ]),
},

{
  id: 'shop-2', name: 'Electronics Store', category: 'ecommerce',
  description: 'Modern electronics retail with blue-dark tech aesthetic',
  tags: ['electronics', 'gadgets', 'phones', 'ecommerce'],
  primaryColor: '#2563EB', secondaryColor: '#0A0E1A', accentColor: '#F59E0B',
  headingFont: 'Inter', bodyFont: 'Roboto',
  previewBg: '#0A0E1A', previewAccent: '#2563EB',
  buildProject: () => makeProject('Electronics Store', {
    primaryColor: '#2563EB', secondaryColor: '#0A0E1A', accentColor: '#F59E0B',
    headingFont: 'Inter', bodyFont: 'Roboto', baseFontSize: 16, maxWidth: 1400, borderRadius: 'md',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '⚡ TechZone', links: [{label:'Mobiles',href:'#'},{label:'Laptops',href:'#'},{label:'Audio',href:'#'},{label:'Deals',href:'#'}], sticky: true, cta: { label: 'Shop Now', href: '#', variant: 'primary', size: 'sm' } })], '#0A0E1A'),
    makeSection('Hero', [makeEl('hero', { heading: 'Best Deals on Top Brands', subheading: 'Apple · Samsung · Sony · Boat · OnePlus · Dell', text: 'Genuine products, unbeatable prices, and 5-day delivery across India.', cta: { label: 'Shop All Deals', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Today\'s Offers', href: '#', variant: 'outline', size: 'lg' }, overlay: 65, align: 'center', bgImage: '' })], '#0A0E1A'),
    makeSection('Marquee', [makeEl('marquee', { items: ['📱 iPhone 16 from ₹79,999', '💻 MacBook Air from ₹89,999', '🎧 AirPods Pro ₹19,999', '📺 65" OLED TV ₹79,999', '⌚ Apple Watch Series 10 ₹39,999'], speed: 18, direction: 'left', separator: '  |  ' })], '#F59E0B'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 100000, label: 'Products', suffix: '+' }, { value: 500, label: 'Brands', suffix: '+' }, { value: 2000000, label: 'Happy Customers', suffix: '+' }, { value: 5, label: 'Day Delivery', suffix: 'D' }] })], '#111827', { top: 40, bottom: 40 }),
    makeSection('CTA', [makeEl('cta', { heading: '⚡ Flash Sale — Today Only!', text: 'Up to 40% off on top electronics. Ends midnight.', cta: { label: 'Shop Flash Sale', href: '#', variant: 'primary', size: 'lg' }, bgColor: '#2563EB' })], '#2563EB'),
    makeSection('Footer', [makeEl('footer', { logoText: '⚡ TechZone', tagline: 'Tech at your fingertips', columns: [{ heading: 'Categories', links: [{ label: 'Mobiles', href: '#' }, { label: 'Laptops', href: '#' }, { label: 'Audio', href: '#' }] }, { heading: 'Support', links: [{ label: 'Track Order', href: '#' }, { label: 'Returns', href: '#' }, { label: 'Warranty', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 TechZone Electronics' })], '#0A0E1A'),
  ]),
},

{
  id: 'shop-3', name: 'Organic Store', category: 'ecommerce',
  description: 'Natural organic products with earthy green-cream palette',
  tags: ['organic', 'natural', 'health', 'groceries'],
  primaryColor: '#4D7C0F', secondaryColor: '#FEFCE8', accentColor: '#D97706',
  headingFont: 'Lora', bodyFont: 'Open Sans',
  previewBg: '#FEFCE8', previewAccent: '#4D7C0F',
  buildProject: () => makeProject('Organic Store', {
    primaryColor: '#4D7C0F', secondaryColor: '#FEFCE8', accentColor: '#D97706',
    headingFont: 'Lora', bodyFont: 'Open Sans', baseFontSize: 16, maxWidth: 1280, borderRadius: 'xl',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🌾 PureRoot', links: [{label:'Groceries',href:'#'},{label:'Wellness',href:'#'},{label:'Farm Fresh',href:'#'},{label:'Subscribe',href:'#'}], sticky: true, cta: { label: 'Shop Now', href: '#', variant: 'primary', size: 'sm' } })], '#3F6212'),
    makeSection('Hero', [makeEl('hero', { heading: 'Pure. Natural. Delivered.', subheading: 'Certified Organic Products Direct from Farms', text: 'No pesticides, no preservatives, no compromise. 100% certified organic products delivered to your door.', cta: { label: 'Shop Organic', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Farm Stories', href: '#', variant: 'outline', size: 'lg' }, overlay: 35, align: 'center', bgImage: '' })], '#ECFCCB'),
    makeSection('Marquee', [makeEl('marquee', { items: ['🌾 Cold-Pressed Oils', '🍯 Raw Honey', '🥦 Fresh Veggies', '🥛 A2 Desi Ghee', '🌱 Herbal Teas', '🫙 Pickles & Preserves'], speed: 18, direction: 'left', separator: '  🌿  ' })], '#4D7C0F'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 500, label: 'Organic Products', suffix: '+' }, { value: 100, label: 'Partner Farms', suffix: '' }, { value: 50000, label: 'Happy Families', suffix: '+' }, { value: 100, label: 'Certified Organic', suffix: '%' }] })], '#FEFCE8', { top: 40, bottom: 40 }),
    makeSection('Testimonial', [makeEl('testimonial', { name: 'Priya Nair', role: 'Nutritionist & Customer', text: 'PureRoot changed the way my family eats. The quality is absolutely consistent and I love knowing where my food comes from.', rating: 5 })], '#ECFCCB', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🌾 PureRoot', tagline: 'From farm to your family', columns: [{ heading: 'Products', links: [{ label: 'Groceries', href: '#' }, { label: 'Dairy', href: '#' }, { label: 'Oils & Ghee', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 PureRoot Organics' })], '#3F6212'),
  ]),
},

// ═══════════════════ PERSONAL (48-50) ═══════════════════

{
  id: 'per-1', name: 'Developer Portfolio', category: 'personal',
  description: 'Dark sleek developer/designer portfolio',
  tags: ['portfolio', 'developer', 'designer', 'freelancer'],
  primaryColor: '#38BDF8', secondaryColor: '#0F172A', accentColor: '#818CF8',
  headingFont: 'Poppins', bodyFont: 'Inter',
  previewBg: '#0F172A', previewAccent: '#38BDF8',
  buildProject: () => makeProject('My Portfolio', {
    primaryColor: '#38BDF8', secondaryColor: '#0F172A', accentColor: '#818CF8',
    headingFont: 'Poppins', bodyFont: 'Inter', baseFontSize: 16, maxWidth: 1200, borderRadius: 'lg',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: 'John.dev', links: [{label:'About',href:'#'},{label:'Work',href:'#'},{label:'Skills',href:'#'},{label:'Contact',href:'#'}], sticky: true })], '#0F172A'),
    makeSection('Hero', [makeEl('hero', { heading: "Hi, I'm a Full-Stack Developer 👋", subheading: 'Building beautiful digital experiences since 2016', text: 'I craft fast, scalable, and delightful web applications. Available for freelance projects.', cta: { label: 'View My Work', href: '#', variant: 'primary', size: 'lg' }, secondaryCta: { label: 'Download CV', href: '#', variant: 'outline', size: 'lg' }, overlay: 40, align: 'left', bgImage: '' })], '#0F172A'),
    makeSection('Marquee', [makeEl('marquee', { items: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'AWS', 'Docker', 'GraphQL'], speed: 22, direction: 'left', separator: '  ·  ' })], '#38BDF8'),
    makeSection('Progress', [makeEl('progress', { items: [{ label: 'React / Next.js', value: 95 }, { label: 'Node.js / Express', value: 90 }, { label: 'TypeScript', value: 88 }, { label: 'UI/UX Design', value: 80 }, { label: 'DevOps / AWS', value: 75 }] })], '#1E293B', { top: 50, bottom: 50 }),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 50, label: 'Projects Completed', suffix: '+' }, { value: 30, label: 'Happy Clients', suffix: '' }, { value: 8, label: 'Years Experience', suffix: '' }, { value: 5, label: 'Open Source Repos', suffix: 'K+ Stars' }] })], '#0F172A', { top: 50, bottom: 50 }),
    makeSection('Contact', [makeEl('form', { fields: [{ id: 'name', type: 'text', label: 'Your Name', placeholder: 'Jane Smith', required: true }, { id: 'email', type: 'email', label: 'Email', placeholder: 'jane@company.com', required: true }, { id: 'budget', type: 'select', label: 'Project Budget', required: false, options: ['Under ₹50,000', '₹50,000 - ₹2,00,000', '₹2,00,000+', "Let's discuss"] }, { id: 'message', type: 'textarea', label: 'Project Details', placeholder: 'Tell me about your project...', required: true }], submitLabel: 'Send Message', successMessage: "Thanks! I'll get back to you within 24 hours." })], '#1E293B', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: 'John.dev', tagline: 'Code with passion', columns: [{ heading: 'Links', links: [{ label: 'GitHub', href: '#' }, { label: 'LinkedIn', href: '#' }, { label: 'Blog', href: '#' }] }], socials: [{ platform: 'twitter', url: '#' }, { platform: 'linkedin', url: '#' }], copyright: '2026 John Developer. All rights reserved.' })], '#0F172A'),
  ]),
},

{
  id: 'per-2', name: 'Restaurant Minimal', category: 'restaurant',
  description: 'Ultra-clean white restaurant with pastel green accents',
  tags: ['restaurant', 'minimal', 'clean', 'modern'],
  primaryColor: '#10B981', secondaryColor: '#FFFFFF', accentColor: '#F59E0B',
  headingFont: 'Raleway', bodyFont: 'Open Sans',
  previewBg: '#FFFFFF', previewAccent: '#10B981',
  buildProject: () => makeProject('The Green Kitchen', {
    primaryColor: '#10B981', secondaryColor: '#FFFFFF', accentColor: '#F59E0B',
    headingFont: 'Raleway', bodyFont: 'Open Sans', baseFontSize: 16, maxWidth: 1280, borderRadius: 'xl',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '🌿 THE GREEN KITCHEN', links: [{label:'Menu',href:'#'},{label:'Catering',href:'#'},{label:'Reserve',href:'#'}], sticky: true, cta: { label: 'Book Table', href: '#', variant: 'primary', size: 'sm' } })], '#064E3B'),
    makeSection('Hero', [makeEl('hero', { heading: 'Fresh. Local. Seasonal.', subheading: 'Farm-to-Table Dining at its Finest', text: 'We work with 30+ local farms to bring you the freshest seasonal ingredients, prepared with love.', cta: { label: "View Today's Menu", href: '#', variant: 'primary', size: 'lg' }, overlay: 35, align: 'center', bgImage: '' })], '#ECFDF5'),
    makeSection('Tabs', [makeEl('tabs', { items: [{ id: 't1', label: 'Breakfast', content: 'Fresh fruit bowls, avocado toast, organic eggs, granola, smoothie bowls (8am-12pm)' }, { id: 't2', label: 'Lunch', content: 'Salads, grain bowls, wraps, soups, daily specials (12pm-4pm)' }, { id: 't3', label: 'Dinner', content: 'Main courses, seasonal pasta, grilled specials, desserts (6pm-10pm)' }] })], '#FFFFFF', { top: 50, bottom: 50 }),
    makeSection('Countdown', [makeEl('countdown', { targetDate: '2026-12-31T23:59:59', label: 'New Year Special Menu Launch In' })], '#064E3B', { top: 50, bottom: 50 }),
    makeSection('Testimonial', [makeEl('testimonial', { name: 'Meera Patel', role: 'Food Writer', company: 'Times of India', text: "The Green Kitchen is a breath of fresh air in Mumbai's dining scene. Sustainable, delicious, and beautiful.", rating: 5 })], '#F0FDF4', { top: 60, bottom: 60 }),
    makeSection('Contact', [makeEl('form', { fields: [{ id: 'name', type: 'text', label: 'Name', placeholder: 'Your name', required: true }, { id: 'guests', type: 'select', label: 'Number of Guests', required: true, options: ['1-2', '3-4', '5-8', '9-12', '13+'] }, { id: 'date', type: 'text', label: 'Preferred Date', placeholder: 'DD/MM/YYYY', required: true }, { id: 'time', type: 'select', label: 'Time Slot', required: true, options: ['12pm-2pm (Lunch)', '2pm-4pm (Tea)', '7pm-9pm (Dinner)', '9pm-11pm (Late Dinner)'] }], submitLabel: 'Reserve Table', successMessage: 'Reservation request received! We will confirm via WhatsApp.' })], '#064E3B', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '🌿 THE GREEN KITCHEN', tagline: 'Eat fresh. Live well.', columns: [{ heading: 'Visit', links: [{ label: 'Bandra West, Mumbai', href: '#' }, { label: 'Tue-Sun: 8am-11pm', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }], copyright: '2026 The Green Kitchen' })], '#064E3B'),
  ]),
},

{
  id: 'per-3', name: 'Travel Blog', category: 'personal',
  description: 'Wanderlust travel blog with turquoise-sunset color palette',
  tags: ['travel', 'blog', 'adventure', 'personal'],
  primaryColor: '#0891B2', secondaryColor: '#ECFEFF', accentColor: '#F97316',
  headingFont: 'Lora', bodyFont: 'Lato',
  previewBg: '#ECFEFF', previewAccent: '#0891B2',
  buildProject: () => makeProject('Travel Blog', {
    primaryColor: '#0891B2', secondaryColor: '#ECFEFF', accentColor: '#F97316',
    headingFont: 'Lora', bodyFont: 'Lato', baseFontSize: 17, maxWidth: 1100, borderRadius: 'xl',
  }, [
    makeSection('Nav', [makeEl('navbar', { logoText: '✈️ WANDER & WONDER', links: [{label:'Destinations',href:'#'},{label:'Travel Tips',href:'#'},{label:'Gear',href:'#'},{label:'About',href:'#'}], sticky: true })], '#0E7490'),
    makeSection('Hero', [makeEl('hero', { heading: 'The World is Waiting for You', subheading: 'Travel Stories · Destination Guides · Photography', text: 'Solo traveler documenting adventures across 50+ countries. Real stories, honest tips, beautiful photos.', cta: { label: 'Read Latest Post', href: '#', variant: 'primary', size: 'lg' }, overlay: 45, align: 'center', bgImage: '' })], '#164E63'),
    makeSection('Marquee', [makeEl('marquee', { items: ['🇮🇳 India', '🇮🇩 Bali', '🇳🇵 Nepal', '🇮🇹 Italy', '🇯🇵 Japan', '🇵🇹 Portugal', '🇹🇿 Tanzania', '🇮🇸 Iceland', '🇲🇽 Mexico'], speed: 18, direction: 'left', separator: '  ✈️  ' })], '#F97316'),
    makeSection('Counter', [makeEl('counter', { items: [{ value: 50, label: 'Countries Visited', suffix: '+' }, { value: 200, label: 'Blog Posts', suffix: '+' }, { value: 100000, label: 'Monthly Readers', suffix: '+' }, { value: 8, label: 'Years Traveling', suffix: '' }] })], '#ECFEFF', { top: 50, bottom: 50 }),
    makeSection('Testimonial', [makeEl('testimonial', { name: 'Ramesh Iyer', role: 'Reader from Chennai', text: "Your Spiti Valley guide was absolutely perfect. Followed every tip and had the trip of my lifetime!", rating: 5 })], '#164E63', { top: 60, bottom: 60 }),
    makeSection('Footer', [makeEl('footer', { logoText: '✈️ WANDER & WONDER', tagline: 'See more. Fear less. Live more.', columns: [{ heading: 'Destinations', links: [{ label: 'India', href: '#' }, { label: 'Southeast Asia', href: '#' }, { label: 'Europe', href: '#' }] }, { heading: 'Follow', links: [{ label: 'Instagram', href: '#' }, { label: 'YouTube', href: '#' }] }], socials: [{ platform: 'instagram', url: '#' }, { platform: 'youtube', url: '#' }], copyright: '2026 Wander & Wonder Blog' })], '#0E7490'),
  ]),
},

];

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All (50)' },
  { id: 'restaurant', label: '🍽️ Restaurant' },
  { id: 'agency', label: '🎨 Agency' },
  { id: 'healthcare', label: '🏥 Healthcare' },
  { id: 'education', label: '🎓 Education' },
  { id: 'realestate', label: '🏠 Real Estate' },
  { id: 'ecommerce', label: '🛍️ E-Commerce' },
  { id: 'corporate', label: '💼 Corporate' },
  { id: 'technology', label: '💻 Technology' },
  { id: 'events', label: '🎉 Events' },
  { id: 'personal', label: '👤 Personal' },
] as const;

export function getTemplateById(id: string): WebsiteTemplate | undefined {
  return WEBSITE_TEMPLATES.find(t => t.id === id);
}
