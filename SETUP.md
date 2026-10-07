# WordPress Configuration Guide for Headless React

This guide contains step-by-step instructions to configure WordPress and JetEngine on **https://equipindianchurches.com** so that the headless React frontend can access all post types, taxonomies, and custom meta fields smoothly.

---

## 1. Exposing Post Types, Meta Fields, and Taxonomies in REST API

### 1.1 Enable "Show in REST API" on JetEngine Post Types
For each custom post type created in JetEngine:
1. In WordPress Admin, navigate to **JetEngine > Post Types**.
2. Click **Edit** on each of the following post types:
   - **Videos** (Slug: `sermon`)
   - **Book Reviews** (Slug: `book-review`)
   - **Gallery** (Slug: `gallery`)
   - **Church Listing** (Slug: `church-listing` — if enabling the directory)
3. In the **General Settings** panel:
   - Toggle **Show in REST API** to **ON**.
   - Note the **REST API base slug** (e.g., `sermon`, `book-review`, `gallery`).
4. In the **Advanced Settings** panel:
   - Under **Supports**, ensure that **Custom Fields**, **Thumbnail** (Featured Image), and **Author** are checked.
5. Click **Update Post Type**.

---

### 1.2 Enable "Show in REST API" on Custom Meta Fields
When a meta field is created in JetEngine, it does not appear in `/wp-json/wp/v2/...` unless explicitly exposed:
1. Navigate to **JetEngine > Post Types** (or **JetEngine > Meta Boxes** if created as a meta box).
2. Edit the post type / meta box containing the custom fields.
3. Open the **Meta Fields** tab.
4. Expand each field:
   - **Videos / Sermons (`sermon`)**:
     - `video_paste_url` (Video URL) &rarr; Set **Show in REST API** to **ON**.
     - `audio_paste_url` (Audio URL) &rarr; Set **Show in REST API** to **ON**.
     - `speaker` (Speaker Name, if added) &rarr; Set **Show in REST API** to **ON**.
   - **Book Reviews (`book-review`)**:
     - `book_author` (Book Author) &rarr; Set **Show in REST API** to **ON**.
     - `rating` (Rating 1–5) &rarr; Set **Show in REST API** to **ON**.
     - `buy_url` (Purchase Link) &rarr; Set **Show in REST API** to **ON**.
5. Save changes.

> **Note**: Fields will now appear in the `meta` object of the REST response (or in `acf` / `jet` depending on your JetEngine REST configuration). The frontend automatically reads from `meta`, `acf`, or `jet`.

---

### 1.3 Attach "Series" Taxonomy to Videos & Book Reviews
During initial discovery, the custom taxonomy `series` was registered with:
`attached_to: 'videos, book-reviews, post'`
However, in JetEngine, the Videos post type slug is actually `sermon`, and Book Reviews is `book-review`.
To make the "Series" dropdown available when editing Videos and Book Reviews in WP Admin:
1. In WordPress Admin, go to **JetEngine > Taxonomies**.
2. Edit the **Series** taxonomy.
3. In the **Post Types** multi-select field, select:
   - **Posts** (`post`)
   - **Videos** (`sermon`)
   - **Book Reviews** (`book-review`)
4. Ensure **Show in REST API** is toggled **ON**.
5. Click **Update Taxonomy**.

---

## 2. Enabling Cross-Origin Resource Sharing (CORS)

If your React frontend is hosted on a different domain or subdomain (e.g. `https://eic.vercel.app`, `https://app.equipindianchurches.com`, or `http://localhost:5173` during development), WordPress must send CORS headers allowing the frontend to read responses and header data.

### Option A: Using the "Code Snippets" Plugin (Recommended)
1. Install and activate the free plugin **Code Snippets** (or **WPCode**).
2. Go to **Snippets > Add New**.
3. Set Title to: `Allow CORS for Headless React`.
4. Choose **Run snippet everywhere**.
5. Paste the following PHP code:

```php
<?php
add_action('init', function () {
    // List of allowed origins
    $allowed_origins = [
        'http://localhost:5173',
        'http://localhost:4173',
        'https://equipindianchurches.com',
        // Add your production React frontend domain here:
        // 'https://eic-frontend.vercel.app',
        // 'https://new.equipindianchurches.com',
    ];

    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

    if (in_array($origin, $allowed_origins, true) || empty($origin)) {
        header("Access-Control-Allow-Origin: " . ($origin ?: '*'));
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Type, Cache-Control, X-Requested-With");
        // CRITICAL: Expose pagination headers so React Query can calculate total pages!
        header("Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages, Link");
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit;
    }
});
```
6. Click **Save Changes and Activate**.

### Option B: Adding to your Child Theme's `functions.php`
Alternatively, paste the snippet above into `wp-content/themes/<your-active-child-theme>/functions.php`.

---

## 3. Application Passwords (Only for Private Content)

All public content on Equip Indian Churches is accessible **without any API key or credentials** at `/wp-json/wp/v2/...`.

If you ever wish to fetch draft previews, private pages, or submit data (e.g. church listing submissions):
1. In WordPress Admin, navigate to **Users > Profile** (or edit an admin user).
2. Scroll down to **Application Passwords**.
3. Under **New Application Password Name**, type `Headless React App`.
4. Click **Add New Application Password**.
5. Copy the generated password (e.g., `xxxx xxxx xxxx xxxx`).
6. In your React environment or backend proxy:
   ```env
   VITE_WP_APP_USER=your_username
   VITE_WP_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```
7. Send the header:
   ```http
   Authorization: Basic base64(username:password)
   ```

---

## 4. REST API Caching & CDN Optimization

Because headless frontends make frequent requests to `/wp-json/wp/v2/...`, caching these responses reduces server load by up to 90%.

### 4.1 Cloudflare Edge Caching (Already on equipindianchurches.com)
The discovery script verified that your domain is proxied through Cloudflare.
You can configure a Cache Rule in Cloudflare Dashboard:
1. Go to **Cloudflare Dashboard > Caching > Cache Rules**.
2. Click **Create rule**.
3. Rule Name: `Cache WordPress REST API for Public Content`.
4. If incoming requests match:
   - URI Path starts with `/wp-json/wp/v2/`
   - AND Request Method equals `GET`
5. Cache eligibility: **Eligible for cache**.
6. Edge TTL: `4 hours` (or `1 day`).
7. Browser TTL: `10 minutes`.

### 4.2 WordPress Caching Plugin
If you use **WP Super Cache**, **LiteSpeed Cache**, or **WP Rocket**:
- Enable REST API response caching in the plugin settings.
- Ensure the plugin purges cache whenever a post of type `post`, `sermon`, `book-review`, or `gallery` is published or modified.

---

## 5. Verification Checklist

After applying the changes above, verify your endpoints by running the discovery script from your React project folder:

```bash
npm run discover
```

The script will test all endpoints and confirm:
- `posts`: 200 OK (Returns total items and pages)
- `sermon`: 200 OK (Returns `video_paste_url` and `audio_paste_url`)
- `book-review`: 200 OK (Returns `book_author` and `rating`)
- `gallery`: 200 OK (Returns gallery albums)
- `taxonomies`: 200 OK (Shows `series`, `categories`, `tags`, `video-category`, `topics`)
