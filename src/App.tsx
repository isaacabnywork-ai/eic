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
import { SeminariesArchivePage } from '@/pages/SeminariesArchive';
import { SeminarySinglePage } from '@/pages/SeminarySingle';
import { BookstoresArchivePage } from '@/pages/BookstoresArchive';
import { BookstoreSinglePage } from '@/pages/BookstoreSingle';
import { LibraryPage } from '@/pages/LibraryPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Custom Admin Panel Components & Layout
import { AdminLayout } from '@/admin/layout/AdminLayout';
import { AdminProtectedRoute } from '@/admin/components/AdminProtectedRoute';
import { AdminLoginPage } from '@/admin/pages/AdminLoginPage';
import { AdminDashboardPage } from '@/admin/pages/AdminDashboardPage';
import { AdminEventsListPage } from '@/admin/pages/AdminEventsListPage';
import { AdminEventEditorPage } from '@/admin/pages/AdminEventEditorPage';
import { AdminCategoriesPage } from '@/admin/pages/AdminCategoriesPage';
import { AdminSpeakersPage } from '@/admin/pages/AdminSpeakersPage';
import { AdminOrganizersPage } from '@/admin/pages/AdminOrganizersPage';
import { AdminVenuesPage } from '@/admin/pages/AdminVenuesPage';
import { AdminMediaPage } from '@/admin/pages/AdminMediaPage';
import { AdminHeaderMenuPage } from '@/admin/pages/AdminHeaderMenuPage';
import { AdminFooterMenuPage } from '@/admin/pages/AdminFooterMenuPage';
import { AdminSettingsPage } from '@/admin/pages/AdminSettingsPage';
import { AdminUsersPage } from '@/admin/pages/AdminUsersPage';
import { AdminActivityLogPage } from '@/admin/pages/AdminActivityLogPage';

const router = createBrowserRouter([
  // Custom Administration Panel Routes (Completely decoupled from WordPress core)
  {
    path: 'admin',
    element: <AdminLayout />,
    children: [
      { path: 'login', element: <AdminLoginPage /> },
      {
        index: true,
        element: (
          <AdminProtectedRoute>
            <AdminDashboardPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'events',
        element: (
          <AdminProtectedRoute>
            <AdminEventsListPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'events/new',
        element: (
          <AdminProtectedRoute>
            <AdminEventEditorPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'events/:id/edit',
        element: (
          <AdminProtectedRoute>
            <AdminEventEditorPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'categories',
        element: (
          <AdminProtectedRoute>
            <AdminCategoriesPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'speakers',
        element: (
          <AdminProtectedRoute>
            <AdminSpeakersPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'organizers',
        element: (
          <AdminProtectedRoute>
            <AdminOrganizersPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'venues',
        element: (
          <AdminProtectedRoute>
            <AdminVenuesPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'media',
        element: (
          <AdminProtectedRoute>
            <AdminMediaPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'menus/header',
        element: (
          <AdminProtectedRoute>
            <AdminHeaderMenuPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'menus/footer',
        element: (
          <AdminProtectedRoute>
            <AdminFooterMenuPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <AdminProtectedRoute allowedRoles={['super_admin', 'administrator']}>
            <AdminSettingsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <AdminProtectedRoute allowedRoles={['super_admin', 'administrator']}>
            <AdminUsersPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'activity',
        element: (
          <AdminProtectedRoute>
            <AdminActivityLogPage />
          </AdminProtectedRoute>
        ),
      },
    ],
  },

  // Public Website Routes
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
      // Recommendations: Seminaries
      { path: 'seminaries', element: <SeminariesArchivePage /> },
      { path: 'seminaries/:slug', element: <SeminarySinglePage /> },
      // Recommendations: Bookstores
      { path: 'bookstores', element: <BookstoresArchivePage /> },
      { path: 'bookstores/:slug', element: <BookstoreSinglePage /> },
      // 404
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
