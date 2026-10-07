/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WP_URL: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_USE_MOCK?: string;
  readonly VITE_ENABLE_CHURCH_DIRECTORY?: string;
  readonly VITE_NEWSLETTER_ACTION_URL?: string;
  readonly VITE_NEWSLETTER_EMAIL_FIELD?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_SOCIAL_YOUTUBE?: string;
  readonly VITE_SOCIAL_FACEBOOK?: string;
  readonly VITE_SOCIAL_INSTAGRAM?: string;
  readonly VITE_SOCIAL_X?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
