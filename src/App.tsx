import { createBrowserRouter, RouterProvider, Navigate, useParams } from 'react-router-dom';
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
import { EventsArchivePage } from '@/pages/EventsArchive';
import { EventSinglePage } from '@/pages/EventSingle';
import { AuthorsArchivePage } from '@/pages/AuthorsArchive';
import { AuthorSinglePage } from '@/pages/AuthorSingle';
import { SearchPage } from '@/pages/SearchPage';
import { ChurchesArchivePage } from '@/pages/ChurchesArchive';
import { SeminariesArchivePage } from '@/pages/SeminariesArchive';
import { SeminarySinglePage } from '@/pages/SeminarySingle';
import { BookstoresArchivePage } from '@/pages/BookstoresArchive';
import { BookstoreSinglePage } from '@/pages/BookstoreSingle';
import { LibraryPage } from '@/pages/LibraryPage';
import { AboutPage } from '@/pages/AboutPage';
import { StatementOfFaithPage } from '@/pages/StatementOfFaithPage';
import { ContactPage } from '@/pages/ContactPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Custom Admin Panel Components & Layout
import { AdminLayout } from '@/admin/layout/AdminLayout';
import { AdminProtectedRoute } from '@/admin/components/AdminProtectedRoute';
import { AdminLoginPage } from '@/admin/pages/AdminLoginPage';
import { AdminDashboardPage } from '@/admin/pages/AdminDashboardPage';
import { AdminEventsListPage } from '@/admin/pages/AdminEventsListPage';
import { AdminMediaPage } from '@/admin/pages/AdminMediaPage';
import { AdminHeaderMenuPage } from '@/admin/pages/AdminHeaderMenuPage';
import { AdminFooterMenuPage } from '@/admin/pages/AdminFooterMenuPage';
import { AdminSettingsPage } from '@/admin/pages/AdminSettingsPage';
import { AdminUsersPage } from '@/admin/pages/AdminUsersPage';
import { AdminActivityLogPage } from '@/admin/pages/AdminActivityLogPage';

function AdminEventEditRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/admin/events?tab=editor&id=${id}` : '/admin/events?tab=editor'} replace />;
}

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
      // Unified Events Hub — All event listings and adding items housed in one place
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
        element: <Navigate to="/admin/events?tab=editor" replace />,
      },
      {
        path: 'events/:id/edit',
        element: <AdminEventEditRedirect />,
      },
      {
        path: 'categories',
        element: <Navigate to="/admin/events?tab=categories" replace />,
      },
      {
        path: 'speakers',
        element: <Navigate to="/admin/events?tab=speakers" replace />,
      },
      {
        path: 'organizers',
        element: <Navigate to="/admin/events?tab=organizers" replace />,
      },
      {
        path: 'venues',
        element: <Navigate to="/admin/events?tab=venues" replace />,
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
      // Gallery (Private / Hidden for now)
      { path: 'gallery', element: <Navigate to="/events" replace /> },
      { path: 'gallery/:slug', element: <Navigate to="/events" replace /> },
      // Events
      { path: 'events', element: <EventsArchivePage /> },
      { path: 'events/:slug', element: <EventSinglePage /> },
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
      // Ministry & Doctrine Pages (Integrated natively in Next.js)
      { path: 'about', element: <AboutPage /> },
      { path: 'what-is-eic', element: <AboutPage /> },
      { path: 'statement-of-faith', element: <StatementOfFaithPage /> },
      { path: 'what-we-believe', element: <StatementOfFaithPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'contact-us', element: <Navigate to="/contact" replace /> },
      // 404
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
