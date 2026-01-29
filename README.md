# 🛠️ Portfolio Dashboard & Admin Panel

<!-- START_PORTFOLIO -->
<!-- END_PORTFOLIO -->

Quick access guide for managing the portfolio automations and external services.

---

## 🔐 Internal Admin Tools
Direct links to manage content on your local or production site:

-   **🔥 [LeetCode Admin](admin-leetcode.html)**: Post new algorithm resolutions and manage streaks.
-   **🎈 [Balloon Preview](balloons-preview.html)**: Test and visualize the floating notification system.

---

## 🌐 External Management
Control the "brains" of your portfolio:

-   **💎 [Supabase Console](https://supabase.com/dashboard/projects)**: Manage your PostgreSQL database and check `leetcode_challenges` data.
-   **🚀 [Vercel Dashboard](https://vercel.com/dashboard)**: Check deployment logs and environment variables.
-   **📦 [GitHub Repo](https://github.com/GabrielBaiano/A-new-type-portifolio)**: Manage source code and actions.

---

## 🤖 Automations & Manual Triggers

### 1. GitHub Activity Sync
The site syncs GitHub stars/followers automatically every 6 hours via Vercel Cron.
-   **Manual Sync URL**: 
    `https://your-domain.com/api/update-github-cache?username=YOUR_USERNAME`
-   **Local Sync Command**:
    ```bash
    curl http://localhost:3000/api/update-github-cache?username=GabrielBaiano
    ```

### 2. LeetCode Heatmap
-   The heatmap updates based on entries in the **Supabase** `leetcode_challenges` table.
-   Postings done via the **[LeetCode Admin](admin-leetcode.html)** panel are reflected instantly on the site.

---

## ⚡ Quick Development Tips
-   **Run Locally**: `vercel dev` (requires Vercel CLI).
-   **Update Styles**: Modify `css/style.css` and increment the `?v=X` version in `index.html` to bypass cache.
-   **Add Icons**: Use [FontAwesome 6](https://fontawesome.com/search?o=r&m=free) for any new UI elements.
