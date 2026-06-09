export type ElementType =
  | 'heading' | 'paragraph' | 'richtext' | 'quote' | 'list'
  | 'button' | 'buttongroup'
  | 'image' | 'gallery' | 'slider' | 'video' | 'marquee'
  | 'divider' | 'spacer' | 'icon'
  | 'iconbox' | 'card' | 'counter' | 'countdown' | 'progress'
  | 'testimonial' | 'pricing' | 'accordion' | 'tabs'
  | 'form' | 'map' | 'social'
  | 'navbar' | 'footer' | 'hero' | 'cta';

export interface CSSStyles {
  color?: string; backgroundColor?: string;
  fontSize?: string; fontWeight?: string; fontFamily?: string;
  textAlign?: 'left'|'center'|'right'|'justify';
  lineHeight?: string; letterSpacing?: string;
  padding?: string; margin?: string;
  paddingTop?: string; paddingBottom?: string;
  paddingLeft?: string; paddingRight?: string;
  marginTop?: string; marginBottom?: string;
  borderRadius?: string; border?: string; borderColor?: string;
  boxShadow?: string; opacity?: string;
  width?: string; maxWidth?: string; height?: string;
  display?: string; alignItems?: string; justifyContent?: string;
  gap?: string; flexDirection?: string; background?: string;
  transition?: string; transform?: string;
  [key: string]: string | undefined;
}

export interface ButtonConfig { label: string; href: string; target?: '_blank'|'_self'; variant: 'primary'|'secondary'|'outline'|'ghost'|'link'; size: 'sm'|'md'|'lg'; icon?: string; }
export interface ImageConfig { src: string; alt: string; caption?: string; fit: 'cover'|'contain'|'fill'; }
export interface GalleryConfig { images: ImageConfig[]; columns: 2|3|4; gap: number; style: 'grid'|'masonry'; }
export interface SlideItem { src: string; alt?: string; heading?: string; text?: string; }
export interface SliderConfig { slides: SlideItem[]; autoPlay: boolean; interval: number; arrows: boolean; dots: boolean; effect: 'slide'|'fade'; }
export interface MarqueeConfig { items: string[]; speed: number; direction: 'left'|'right'; separator: string; }
export interface VideoConfig { src: string; poster?: string; autoPlay: boolean; muted: boolean; controls: boolean; loop: boolean; }
export interface IconBoxConfig { icon: string; title: string; description: string; align: 'left'|'center'; iconColor?: string; }
export interface CounterConfig { items: Array<{value: number; label: string; prefix?: string; suffix?: string}>; }
export interface CountdownConfig { targetDate: string; label: string; }
export interface ProgressConfig { items: Array<{label: string; value: number; color?: string}>; }
export interface TestimonialConfig { name: string; role: string; company?: string; text: string; avatar?: string; rating: number; }
export interface PricingPlan { name: string; price: string; period: string; features: string[]; cta: ButtonConfig; highlighted: boolean; badge?: string; }
export interface AccordionItem { id: string; question: string; answer: string; }
export interface TabItem { id: string; label: string; content: string; }
export interface FormField { id: string; type: 'text'|'email'|'phone'|'textarea'|'select'|'checkbox'|'radio'; label: string; placeholder?: string; required: boolean; options?: string[]; }
export interface FormConfig { fields: FormField[]; submitLabel: string; successMessage: string; }
export interface SocialLink { platform: string; url: string; }
export interface NavLink { label: string; href: string; }
export interface NavbarConfig { logo: string; logoText: string; links: NavLink[]; sticky: boolean; transparent: boolean; cta?: ButtonConfig; }
export interface FooterConfig { logo: string; tagline: string; columns: Array<{heading: string; links: NavLink[]}>; socials: SocialLink[]; copyright: string; }
export interface HeroConfig { heading: string; subheading: string; text: string; cta: ButtonConfig; secondaryCta?: ButtonConfig; bgImage?: string; overlay: number; align: 'left'|'center'|'right'; }
export interface CTAConfig { heading: string; text: string; cta: ButtonConfig; secondaryCta?: ButtonConfig; bgColor?: string; }

export type ElementConfig = Record<string, unknown>;

export interface BuilderElement {
  id: string;
  type: ElementType;
  styles: CSSStyles;
  animation?: 'none'|'fadeIn'|'slideUp'|'slideLeft'|'zoom'|'bounce';
  animationDelay?: number;
  hidden?: boolean;
  locked?: boolean;
  label?: string;
  config: ElementConfig;
}

export interface Column { id: string; width: number; elements: BuilderElement[]; styles?: CSSStyles; }

export interface Section {
  id: string; name: string; columns: Column[];
  background: { type: 'color'|'gradient'|'image'; value: string; overlay?: number; };
  padding: { top: number; bottom: number; };
  margin: { top: number; bottom: number; };
  maxWidth: 'full'|'xl'|'lg'|'md';
  hidden?: boolean; locked?: boolean; sticky?: boolean;
}

export interface BuilderPage {
  id: string; name: string; slug: string;
  sections: Section[];
  seo: { title: string; description: string; keywords: string; };
}

export interface GlobalStyles {
  primaryColor: string; secondaryColor: string; accentColor: string;
  headingFont: string; bodyFont: string;
  baseFontSize: number; maxWidth: number; borderRadius: string;
}

export interface WebsiteProject {
  id: string; name: string; domain?: string;
  pages: BuilderPage[];
  globalStyles: GlobalStyles;
  customCSS?: string;
  createdAt: string; updatedAt: string;
}

export interface SelectionState {
  pageId: string | null; sectionId: string | null;
  columnId: string | null; elementId: string | null;
  level: 'page'|'section'|'column'|'element'|null;
}
