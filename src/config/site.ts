/**
 * Branding, navigation, footer links. Nothing here comes from WordPress,
 * so it can be edited freely. Social URLs and contact e-mail are read from env.
 */
import { contentTypes, wpPages } from './content.ts';
import { env } from './env.ts';

export const site = {
  name: 'Equip Indian Churches',
  shortName: 'EIC',
  tagline: 'Equipping the Church, Uniting the Saints.',
  description:
    'Sermons, videos, articles and book reviews that equip pastors and churches across India.',
  mission:
    'Equip Indian Churches exists to strengthen the Church in India through sound, Scripture-centred teaching — freely available to every pastor, leader and believer.',
  /** Official logo image link */
  logoUrl: 'https://equipindianchurches.com/wp-content/uploads/2023/11/eic2-1.png',
  logoFallback: '/logo.png',
  /** Dedicated mobile app icon logo */
  mobileLogoUrl: 'https://equipindianchurches.com/wp-content/uploads/2023/11/eic2-1.png',
  mobileLogoFallback: '/logo.png',
  /** Default social share image (optional, absolute URL or path under /public). */
  defaultOgImage: 'https://equipindianchurches.com/wp-content/uploads/2023/11/eic2-1.png',
};

export const wpLink = (path: string): string => `${env.wpUrl}${path}`;

export interface MegaColumn {
  title: string;
  /** Dynamic lists are filled from the API when the menu opens. */
  source?:
    | { kind: 'terms'; taxonomy: 'category' | 'series' | 'videoCategory' | 'topic'; limit: number; orderby?: 'count' | 'name'; parent?: number }
    | { kind: 'sermonCategories' }
    | { kind: 'videoCategories' };
  links?: { label: string; to: string; external?: boolean }[];
}

export interface NavItem {
  label: string;
  to?: string;
  /** hide when feature flag is off */
  enabled?: boolean;
  mega?: { blurb: string; columns: MegaColumn[]; cta?: { label: string; to: string } };
}

const t = contentTypes;

export const navItems: NavItem[] = [
  {
    label: 'Articles',
    to: `/${t.article.route}`,
    mega: {
      blurb: 'Biblical reflections, pastoral essays, and literature reviews to ground local church believers.',
      columns: [
        {
          title: 'Articles & Essays',
          links: [{ label: 'All Articles & Essays', to: `/${t.article.route}` }],
          source: { kind: 'terms', taxonomy: 'category', limit: 6, orderby: 'count' },
        },
        {
          title: 'Studies & Reviews',
          links: [
            { label: 'Teaching Series', to: '/series' },
            { label: 'Book Reviews', to: `/${t.bookReview.route}` },
          ],
          source: { kind: 'terms', taxonomy: 'series', limit: 5, orderby: 'count' },
        },
        {
          title: 'Theological Topics',
          source: { kind: 'terms', taxonomy: 'topic', limit: 6, orderby: 'count' },
          links: [{ label: 'Explore All Topics →', to: `/${t.article.route}` }],
        },
      ],
      cta: { label: 'Browse all articles & studies', to: `/${t.article.route}` },
    },
  },
  {
    label: 'Sermons & Media',
    to: `/${t.sermon.route}`,
    mega: {
      blurb: 'Expository preaching from national conferences, local pulpits, and video discussions.',
      columns: [
        {
          title: 'Expository Sermons',
          links: [
            { label: 'All Expository Sermons', to: `/${t.sermon.route}` },
            { label: 'Conference Messages', to: `/${t.sermon.route}` },
          ],
          source: { kind: 'sermonCategories' },
        },
        {
          title: 'Videos & Conversations',
          links: [
            { label: 'All Video Teachings', to: `/${t.video.route}` },
            { label: 'Panel Discussions & Q&A', to: `/${t.video.route}` },
          ],
          source: { kind: 'videoCategories' },
        },
        {
          title: 'Media Channels',
          links: [
            { label: 'YouTube Channel', to: 'https://www.youtube.com/@EquipIndianChurches', external: true },
            { label: 'All India Pastors Conference', to: `/${t.sermon.route}` },
            { label: 'Teaching Expositions', to: `/${t.sermon.route}` },
          ],
        },
      ],
      cta: { label: 'Listen to all expository sermons', to: `/${t.sermon.route}` },
    },
  },
  {
    label: 'Events & Gallery',
    to: `/${t.event.route}`,
    mega: {
      blurb: 'National pastor conferences, regional fellowship memories, and contributing leaders.',
      columns: [
        {
          title: 'Conferences & Events',
          links: [
            { label: 'Upcoming Events & Conferences', to: `/${t.event.route}` },
            { label: 'All India Pastors Conference', to: `/${t.event.route}` },
            { label: 'Regional Roundtables', to: `/${t.event.route}` },
          ],
        },
        {
          title: 'Photo Galleries',
          links: [
            { label: 'All Photo Galleries', to: `/${t.gallery.route}` },
            { label: 'AIPC Conference Albums', to: `/${t.gallery.route}` },
            { label: 'Regional Fellowship Photos', to: `/${t.gallery.route}` },
          ],
        },
        {
          title: 'Fellowship & Community',
          links: [
            { label: 'Resource Library Search', to: '/search' },
            ...(t.church.enabled ? [{ label: 'Church Directory', to: `/${t.church.route}` }] : []),
          ],
        },
      ],
      cta: { label: 'View upcoming gatherings & roundtables', to: `/${t.event.route}` },
    },
  },
  {
    label: 'About',
    to: wpLink(wpPages.about),
    mega: {
      blurb: 'Equipping local churches in India through sound, Scripture-centred biblical resources.',
      columns: [
        {
          title: 'Our Movement',
          links: [
            { label: 'About Equip Indian Churches', to: wpLink(wpPages.about), external: true },
            { label: 'What is EIC?', to: wpLink(wpPages.whatIsEic), external: true },
            { label: 'Our Mission & Vision', to: wpLink(wpPages.about), external: true },
          ],
        },
        {
          title: 'Doctrine & Contact',
          links: [
            { label: 'What We Believe (Statement of Faith)', to: wpLink(wpPages.whatWeBelieve), external: true },
            { label: 'Contact & Inquiries', to: wpLink(wpPages.contact), external: true },
            { label: 'Subscribe to Newsletter', to: '/#explore-resources' },
          ],
        },
      ],
      cta: { label: 'Read our statement of faith', to: wpLink(wpPages.whatWeBelieve) },
    },
  },
];

export const footerColumns: { title: string; links: { label: string; to: string; external?: boolean }[] }[] = [
  {
    title: 'Library',
    links: [
      { label: 'Articles', to: `/${t.article.route}` },
      { label: 'Videos', to: `/${t.video.route}` },
      { label: 'Sermons', to: `/${t.sermon.route}` },
      { label: 'Series', to: '/series' },
      { label: 'Book Reviews', to: `/${t.bookReview.route}` },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Gallery', to: `/${t.gallery.route}` },
      { label: 'Events', to: `/${t.event.route}` },
      ...(t.church.enabled ? [{ label: 'Church directory', to: `/${t.church.route}` }] : []),
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'About us', to: wpLink(wpPages.about), external: true },
      { label: 'What we believe', to: wpLink(wpPages.whatWeBelieve), external: true },
      { label: 'Contact', to: wpLink(wpPages.contact), external: true },
      { label: 'Privacy policy', to: wpLink(wpPages.privacy), external: true },
    ],
  },
];

export const socialLinks = (
  [
    { id: 'youtube', label: 'YouTube', url: env.social.youtube },
    { id: 'facebook', label: 'Facebook', url: env.social.facebook },
    { id: 'instagram', label: 'Instagram', url: env.social.instagram },
    { id: 'x', label: 'X (Twitter)', url: env.social.x },
  ] as const
).filter((s) => s.url);
