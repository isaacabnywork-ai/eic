import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/Home';
import { ArticlesArchivePage } from '@/pages/ArticlesArchive';
import { ArticleSinglePage } from '@/pages/ArticleSingle';
import { VideosArchivePage } from '@/pages/VideosArchive';
import { VideoSinglePage } from '@/pages/VideoSingle';
import { SermonsArchivePage } from '@/pages/SermonsArchive';
import { SermonSinglePage } from '@/pages/SermonSingle';
import { SeriesArchivePage } from '@/pages/SeriesArchive';
import { SeriesSinglePage } from '@/pages/SeriesSingle';
import { BookReviewsArchivePage } from '@/pages/BookReviewsArchive';
import { BookReviewSinglePage } from '@/pages/BookReviewSingle';
import { GalleryArchivePage } from '@/pages/GalleryArchive';
import { GallerySinglePage } from '@/pages/GallerySingle';
import { EventsArchivePage } from '@/pages/EventsArchive';
import { AuthorsArchivePage } from '@/pages/AuthorsArchive';
import { AuthorSinglePage } from '@/pages/AuthorSingle';
import { SearchPage } from '@/pages/SearchPage';
import { ChurchesArchivePage } from '@/pages/ChurchesArchive';
import { LibraryPage } from '@/pages/LibraryPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      // Articles
      { path: 'articles', element: <ArticlesArchivePage /> },
      { path: 'articles/:slug', element: <ArticleSinglePage /> },
      // Videos
      { path: 'videos', element: <VideosArchivePage /> },
      { path: 'videos/:slug', element: <VideoSinglePage /> },
      // Sermons
      { path: 'sermons', element: <SermonsArchivePage /> },
      { path: 'sermons/:slug', element: <SermonSinglePage /> },
      // Series
      { path: 'series', element: <SeriesArchivePage /> },
      { path: 'series/:slug', element: <SeriesSinglePage /> },
      // Book Reviews
      { path: 'book-reviews', element: <BookReviewsArchivePage /> },
      { path: 'book-reviews/:slug', element: <BookReviewSinglePage /> },
      // Gallery
      { path: 'gallery', element: <GalleryArchivePage /> },
      { path: 'gallery/:slug', element: <GallerySinglePage /> },
      // Events
      { path: 'events', element: <EventsArchivePage /> },
      // Authors
      { path: 'authors', element: <AuthorsArchivePage /> },
      { path: 'authors/:id', element: <AuthorSinglePage /> },
      // Search
      { path: 'search', element: <SearchPage /> },
      // Library (Bookmarks & Newsletter)
      { path: 'library', element: <LibraryPage /> },
      // Churches (directory)
      { path: 'churches', element: <ChurchesArchivePage /> },
      // 404
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
