import { Helmet } from 'react-helmet-async';
import { env } from '@/config/env';
import { site } from '@/config/site';
import { absoluteUrl } from '@/lib/routes';

interface SeoProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'video.other' | 'book';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
}

export function SeoHead({
  title,
  description = site.description,
  path = '',
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  noindex = false,
}: SeoProps) {
  const fullTitle = title ? `${title} • ${site.name}` : `${site.name} • ${site.tagline}`;
  const canonical = path ? absoluteUrl(path) : env.siteUrl;
  const ogImage = image || site.defaultOgImage || (env.siteUrl ? `${env.siteUrl}/og-image.png` : undefined);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph */}
      <meta property="og:site_name" content={site.name} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonical && <meta property="og:url" content={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Article specific metadata */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
    </Helmet>
  );
}
