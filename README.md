# 🛠️ Portfolio Dashboard & Admin Panel

<!-- START_PORTFOLIO -->
## 🚀 Latest Updates

<div align="center">
  <a href="#" title="electric girl - sketch"><img src="https://vdegtlphahkkduoymzlr.supabase.co/storage/v1/object/public/images/1769174629271-752ca38fe5ddab465f298812ff19e256.jpg" width="180" height="180" style="object-fit: cover; border-radius: 12px; margin: 5px;" /></a>
  <a href="#" title="null"><img src="https://vdegtlphahkkduoymzlr.supabase.co/storage/v1/object/public/images/1768723697732-a595e3cd48e38fd8c87edbd2214440e0.jpg" width="180" height="180" style="object-fit: cover; border-radius: 12px; margin: 5px;" /></a>
  <a href="#" title="null"><img src="https://vdegtlphahkkduoymzlr.supabase.co/storage/v1/object/public/images/1768506382214-yellowhoodSprite_test2.png" width="180" height="180" style="object-fit: cover; border-radius: 12px; margin: 5px;" /></a>
</div>

### 📝 Recent Thoughts
- [Beyond the Hype: Why I’m Choosing Public Utility Over Quick Profits](https://a-new-type-portifolio.vercel.app/feed?id=-beyond-the-hype-why-im-choosing-public-utility-over-quick-profits-9018) - *13/02/2026*
- [From St. Augustine to Personal Blogging: How I Found My Own Catharsis](https://a-new-type-portifolio.vercel.app/feed?id=from-st-augustine-to-personal-blogging-how-i-found-my-own-catharsis-3492) - *18/01/2026*
- [# Super Busy with Project 2026](https://a-new-type-portifolio.vercel.app/feed?id=-super-busy-with-project-2026-8426) - *10/01/2026*
- [From Block to Art: Why Creativity Is the Technical Skill You Are Ignoring](https://a-new-type-portifolio.vercel.app/feed?id=from-block-to-art-why-creativity-is-the-technical-skill-you-are-ignoring-1574) - *03/01/2026*

### 📚 Currently Reading
- **Documenting Software Architectures: Views and Beyond**
- **The Family**

See more at [My Portfolio](https://a-new-type-portifolio.vercel.app)
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
