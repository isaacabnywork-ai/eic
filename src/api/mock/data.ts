/**
 * Offline demo data, shaped exactly like WordPress REST responses (so the real
 * normalisers/UI run unchanged). Only loaded when VITE_USE_MOCK=true.
 * Nothing in here is imported by the production code path.
 */
import type { WpRaw } from '../types';

export interface TermRow {
  id: number;
  name: string;
  slug: string;
  parent: number;
  taxonomy: string;
  restBase: string;
  description: string;
}

const DAY = 86_400_000;
const NOW = Date.now();
const iso = (daysAgo: number) => new Date(NOW - daysAgo * DAY).toISOString().slice(0, 19);

/** A calm gradient placeholder, as a data URI (works offline). */
export function svgImage(label: string, hue: number, w = 1200, h = 800): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue},45%,28%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},55%,48%)"/></linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<circle cx="${w * 0.8}" cy="${h * 0.2}" r="${h * 0.25}" fill="rgba(255,255,255,.08)"/>
<text x="50%" y="52%" text-anchor="middle" font-family="Georgia,serif" font-size="${Math.round(w / 18)}" fill="rgba(255,255,255,.85)">${label.replace(/&/g, '&amp;').slice(0, 28)}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function mediaObj(id: number, label: string, hue: number, w: number, h: number, parent = 0): WpRaw {
  const url = svgImage(label, hue, w, h);
  const size = (width: number) => ({ source_url: url, width, height: Math.round((width * h) / w) });
  return {
    id,
    source_url: url,
    alt_text: label,
    caption: { rendered: '' },
    media_type: 'image',
    mime_type: 'image/svg+xml',
    post: parent,
    media_details: {
      width: w,
      height: h,
      sizes: { medium: size(300), medium_large: size(768), large: size(1024), full: size(w) },
    },
  };
}

const people = [
  ['Samuel Joseph', 'Pastor and author serving in Chennai.'],
  ['Priya Thomas', 'Writes on discipleship and women in ministry.'],
  ['Daniel Rao', 'Church planter and Bible teacher.'],
  ['Mercy Kumar', 'Mission mobiliser and children’s ministry trainer.'],
  ['Abraham Verghese', ''],
  ['Esther Das', 'Seminary lecturer in Old Testament.'],
] as const;

const users: WpRaw[] = people.map(([name, description], i) => ({
  id: i + 1,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  description,
  link: '#',
  avatar_urls: {},
}));

/* ---- taxonomies ------------------------------------------------------ */
let tid = 100;
const mk = (taxonomy: string, restBase: string, name: string, parent = 0): TermRow => ({
  id: ++tid,
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  parent,
  taxonomy,
  restBase,
  description: '',
});

const categories = ['Blog Articles', 'AIPC', 'EIC Monthly'].map((n) => mk('category', 'categories', n));
const tags = ['Events', 'Featured'].map((n) => mk('post_tag', 'tags', n));
const series = [
  'The Gospel',
  'Prayer',
  'Spiritual Disciplines of a Pastor',
  'Ancient Words Ever True',
  'Suffering',
  'The Church',
].map((n) => mk('series', 'series', n));
const topics = ['Worship', 'Pastoring', 'Evangelism', 'Marriage', 'Missions', 'Parenting', 'Prayer', 'Christmas'].map(
  (n) => mk('topics', 'topics', n),
);
const aipc = mk('video-category', 'video-category', 'AIPC');
const regional = mk('video-category', 'video-category', 'Regional Conferences');
const videoCategories = [
  aipc,
  mk('video-category', 'video-category', 'AIPC 2023', aipc.id),
  mk('video-category', 'video-category', 'AIPC 2024', aipc.id),
  regional,
  mk('video-category', 'video-category', 'Kochi 2024', regional.id),
  mk('video-category', 'video-category', 'Monthly Meetings'),
  mk('video-category', 'video-category', 'Answers to EIC'),
  mk('video-category', 'video-category', 'Sermon Clips'),
];

export const termRows: TermRow[] = [...categories, ...tags, ...series, ...topics, ...videoCategories];
const by = (rows: TermRow[], i: number) => rows[i % rows.length].id;

/* ---- content --------------------------------------------------------- */
const lorem = [
  'The Scriptures call every church to be built up in the truth, and to walk together in love. In this study we slow down to read the text carefully and ask what it asks of us today.',
  'Pastors across India carry heavy loads: long distances, small budgets and great needs. What sustains them is not technique but a settled confidence in the sufficiency of Christ.',
  'It is easy to speak about prayer and hard to pray. Yet the pattern of the apostles shows a church that devoted itself to the word and to prayer, again and again.',
  'When the gospel takes root in a community, it changes homes, work and worship. We should expect the ordinary means of grace to produce extraordinary fruit over time.',
];
const body = (t: string) =>
  `<p>${lorem[t.length % 4]}</p><h2>Reading the text</h2><p>${lorem[(t.length + 1) % 4]}</p><blockquote><p>${lorem[(t.length + 2) % 4]}</p></blockquote><h3>Questions for reflection</h3><ul><li>What does this passage reveal about God?</li><li>How should our church respond?</li><li>Who can we encourage this week?</li></ul><p>${lorem[(t.length + 3) % 4]}</p>`;

const articleTitles = [
  'Cultivating Joy in the Lord: A Study of Psalm 16',
  'Why Every Pastor Needs a Praying Wife',
  'Preaching Christ from the Old Testament',
  'A Star Sign for Jesus?',
  'Premarital Discipleship in the Local Church',
  'Christ’s Blessed Exit from Egypt',
  'Shepherding Through Suffering',
  'The Ordinary Means of Grace',
  'Money, Generosity and the Gospel',
  'Praying the Psalms Together',
  'Raising Children in a Pluralistic Society',
  'Planting Churches with Patience',
  'Evangelism Without Pressure',
  'The Church Gathered and Scattered',
  'Remembering the Cross at Good Friday',
  'Worship That Pleases God',
  'Leading a Small Church Well',
  'Reading the Bible Slowly',
  'What Is the Gospel, Really?',
  'Marriage as a Picture of Christ and the Church',
  'Advent Reflections for Indian Households',
  'Mission Beyond Our Borders',
  'Finishing Well in Ministry',
  'Upcoming Regional Pastors’ Conference',
  'Monthly Prayer Gathering — Open to All',
  'AIPC Planning Meeting',
];

const authorOf = (i: number) => users[i % users.length].id;

const media: WpRaw[] = [];
let mid = 5000;
const addMedia = (label: string, hue: number, w = 1200, h = 800, parent = 0) => {
  const m = mediaObj(++mid, label, hue, w, h, parent);
  media.push(m);
  return m.id as number;
};

export const posts: WpRaw[] = articleTitles.map((title, i) => {
  const isEvent = i >= articleTitles.length - 3;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    id: 1000 + i,
    date: isEvent ? iso(-(7 + i * 5)) : iso(i * 4 + 1),
    modified: iso(i * 4),
    slug,
    status: 'publish',
    type: 'post',
    title: { rendered: title },
    content: { rendered: body(title) },
    excerpt: { rendered: `<p>${lorem[i % 4].slice(0, 150)} [&hellip;]</p>` },
    author: authorOf(i),
    featured_media: addMedia(title, (i * 37) % 360, 1200, 800),
    sticky: i === 0,
    meta: {},
    categories: [by(categories, i)],
    tags: isEvent ? [tags[0].id] : i === 3 ? [tags[1].id] : [],
    series: i % 3 === 2 ? [] : [by(series, i)],
    topics: [by(topics, i), by(topics, i + 3)],
  };
});

const sermonTitles = [
  'Stay Vigilant and Be Ready',
  'Be Zealous and Committed',
  'The Fruit of the Spirit in the Church',
  'Grace That Trains Us',
  'A Pastor’s Heart for the Lost',
  'Gathering Around the Word',
  'Faith Under Pressure',
  'The Seven Sayings from the Cross',
  'Walking in Newness of Life',
  'Hope for the Weary',
  'Answers to Your Questions on Baptism',
  'Does God Still Heal?',
  'Short Clip: Why We Pray Together',
  'Short Clip: Leading with Humility',
  'Christ, Our Righteousness',
  'Worship in Spirit and Truth',
  'Serving the Poor with Dignity',
  'Marriage and Ministry',
];
const videoCatFor = (i: number) => {
  if (i < 6) return videoCategories[1 + (i % 2)].id; // AIPC 2023/2024 (sermons)
  if (i < 9) return videoCategories[4].id; // Kochi (sermon)
  if (i < 11) return videoCategories[5].id; // Monthly meetings (sermon)
  if (i < 14) return videoCategories[6].id; // Answers (video)
  return videoCategories[7].id; // Clips (video)
};

export const sermons: WpRaw[] = sermonTitles.map((title, i) => ({
  id: 2000 + i,
  date: iso(i * 6 + 2),
  modified: iso(i * 6),
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  status: 'publish',
  type: 'sermon',
  title: { rendered: title },
  content: { rendered: i % 5 === 4 ? '' : `<p>${lorem[i % 4]}</p>` },
  author: authorOf(i + 1),
  meta: {
    video_paste_url: i === 7 ? '' : 'https://youtu.be/M7lc1UVf-VE?list=PLdemo',
    audio_paste_url: '',
  },
  topics: [by(topics, i)],
  'video-category': [videoCatFor(i)],
}));

const books = [
  ['The Unfolding Mystery by Edmund Clowney', 4.5],
  ['The Pastor’s Heart by Alexander Strauch', 5],
  ['Called to Be Saints by Gordon Smith', 4],
  ['Gospel Fluency by Jeff Vanderstelt', 4],
  ['Expositional Preaching by David Helm', 5],
  ['The Cross of Christ by John Stott', 5],
  ['Spiritual Disciplines for the Christian Life by Don Whitney', 4.5],
  ['Counterfeit Gods by Timothy Keller', 4],
] as const;

export const bookReviews: WpRaw[] = books.map(([title, rating], i) => ({
  id: 3000 + i,
  date: iso(i * 9 + 3),
  modified: iso(i * 9),
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  status: 'publish',
  type: 'book-review',
  title: { rendered: title },
  content: { rendered: body(title) },
  excerpt: { rendered: '' },
  author: authorOf(i + 2),
  featured_media: addMedia(title.split(' by ')[0], (i * 53 + 200) % 360, 600, 900),
  meta: { book_author: title.split(' by ')[1], rating, buy_url: '' },
}));

const albums = ['AIPC 2023', 'AIPC 2022', 'Manipur 2022', 'Mumbai 2022', 'Kochi 2024'];
export const gallery: WpRaw[] = albums.map((title, i) => {
  const id = 4000 + i;
  const count = 8 + i * 2;
  for (let k = 0; k < count; k++) {
    const portrait = k % 3 === 1;
    addMedia(`${title} · ${k + 1}`, (i * 71 + k * 19) % 360, portrait ? 800 : 1200, portrait ? 1100 : 800, id);
  }
  return {
    id,
    date: iso(i * 60 + 10),
    modified: iso(i * 60),
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    status: 'publish',
    type: 'gallery',
    title: { rendered: title },
    content: { rendered: '' },
    featured_media: addMedia(`${title} cover`, (i * 71) % 360, 1200, 800),
  };
});

export const mediaItems = media;
export const userRows = users;
export const taxonomyDefs = Object.values(
  Object.fromEntries(termRows.map((t) => [t.taxonomy, { slug: t.taxonomy, rest_base: t.restBase }])),
);
