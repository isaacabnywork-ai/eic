export interface RecommendationItem {
  id: string;
  slug: string;
  title: string;
  category: 'seminary' | 'bookstore';
  categoryLabel: string;
  subtitle: string;
  description: string;
  website: string;
  location?: string;
  established?: string;
  focusAreas?: string[];
  contactEmail?: string;
  phone?: string;
  image?: string;
}

export const seminariesData: RecommendationItem[] = [
  {
    id: 'calvary-baptist-bible-college',
    slug: 'calvary-baptist-bible-college',
    title: 'Calvary Baptist Bible College',
    category: 'seminary',
    categoryLabel: 'Theological Seminary',
    subtitle: 'Biblical Training & Pastoral Preparation',
    description:
      'Calvary Baptist Bible College & Seminary exists to train and prepare faithful men and women for Christian service, pastoral leadership, and biblical exposition across the Indian subcontinent.',
    website: 'https://calvaryindia.com/',
    location: 'Bangalore, Karnataka, India',
    established: '1976',
    focusAreas: ['Expository Preaching', 'Biblical Languages', 'Pastoral Theology', 'Missions & Church Planting'],
  },
  {
    id: 'evangelical-theological-seminary',
    slug: 'evangelical-theological-seminary',
    title: 'Evangelical Theological Seminary',
    category: 'seminary',
    categoryLabel: 'Theological Seminary',
    subtitle: 'Reformed Theology & Ministry Training',
    description:
      'Evangelical Theological Seminary is committed to providing rigorous biblical exposition, confessional theology, and practical ministry training to equip pastors, church planters, and leaders for the Indian Church.',
    website: 'https://www.ets-india.org/',
    location: 'Hosur, Tamil Nadu, India',
    established: '1984',
    focusAreas: ['Systematic Theology', 'Expository Preaching', 'Church History', 'Pastoral Counseling'],
  },
  {
    id: 'satya-vachan-seminary',
    slug: 'satya-vachan-seminary',
    title: 'Satya Vachan Seminary',
    category: 'seminary',
    categoryLabel: 'Theological Seminary',
    subtitle: 'Hindi & Regional Pastoral Training',
    description:
      'Satya Vachan Seminary equips Hindi-speaking pastors and church leaders in North India with sound biblical doctrine, theological clarity, and practical pastoral competencies for gospel advancement.',
    website: 'https://svsem.org/',
    location: 'Lucknow, Uttar Pradesh, India',
    focusAreas: ['Vernacular Theological Education', 'Expository Preaching in Hindi', 'Biblical Discipleship'],
  },
];

export const bookstoresData: RecommendationItem[] = [
  {
    id: 'for-the-truth',
    slug: 'for-the-truth',
    title: 'For The Truth',
    category: 'bookstore',
    categoryLabel: 'Christian Publishing & Books',
    subtitle: 'Truth-Centered Christian Books',
    description:
      'For The Truth partners with faithful publishers worldwide to print and distribute affordable theological books, pastoral resources, and gospel literature tailored for the church in India.',
    website: 'https://forthetruth.in/',
    location: 'India-wide Distribution',
    focusAreas: ['Pastoral Ministry', 'Biblical Theology', 'Biographies', 'Children & Family Discipleship'],
  },
  {
    id: 'sola-books',
    slug: 'sola-books',
    title: 'Sola Books',
    category: 'bookstore',
    categoryLabel: 'Christian Bookstore',
    subtitle: 'Historic Christian Literature',
    description:
      'Sola Books provides solid, Scripture-grounded resources rooted in the historic Christian faith, offering trusted literature to equip local church members and leaders.',
    website: 'https://solabooks.in/',
    location: 'India-wide Shipping',
    focusAreas: ['Reformed Literature', 'Church History', 'Devotional Classics', 'Evangelistic Books'],
  },
];

export const allRecommendations = [...seminariesData, ...bookstoresData];

export function getRecommendationBySlug(slug: string): RecommendationItem | undefined {
  return allRecommendations.find((item) => item.slug === slug);
}
