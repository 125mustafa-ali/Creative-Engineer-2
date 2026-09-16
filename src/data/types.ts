export interface NavLink {
  label: string;
  href: string;
}

export interface StudioNotice {
  status: string;
  location: string;
  coordinates: string;
  year?: string;
}

export interface ContactDetails {
  email: string;
  phone?: string;
  studioPhone?: string;
  location?: string;
  social?: { name: string; url: string }[];
}

export interface HeroVideoConfig {
  url: string;
  aspectRatio?: '9:16' | '16:9' | 'auto';
}

export interface SiteConfig {
  siteTitle: string;
  siteSubtitle?: string;
  heroVideoUrl?: string;
  heroVideo?: HeroVideoConfig;
  navLinks: NavLink[];
  heroStatement: string;
  heroSubtext: string;
  studioNotice: StudioNotice;
  contactTopics: string[];
  contactDetails: ContactDetails;
  footerNote: string;
}

export interface Capability {
  category: string;
  title: string;
  description: string;
  tags: string[];
}

export type CapabilityItem = Capability;

export interface GallerySpot {
  title: string;
  videoUrl?: string;
  tag?: string;
  badge?: string;
  aspectRatio?: string; // e.g. "16:9" | "9:16"
  duration?: string;
  markdownContext: string;
  heroReelUrl?: string;
  fullVideoUrl?: string;
  prompts?: string[];
}

export type AnthologySpot = GallerySpot;

export interface PortfolioItem {
  id: number | string;
  title: string;
  client: string;
  videoUrl?: string;
  thumbnailVideo?: string;
  size?: 'large' | 'small' | string;
  year: string;
  discipline: string;
  markdownContext: string;
  isAnthology?: boolean;
  gallery?: GallerySpot[];
  anthologySpots?: GallerySpot[];
  spots?: GallerySpot[];
  aspectRatio?: string;
  duration?: string;
  summary?: string;
  role?: string;
  techStack?: string[];
}

export type Project = PortfolioItem;

export interface HeroData {
  _id?: string;
  heading?: string;
  subheading?: string;
  backgroundVideoUrl?: string;
}
