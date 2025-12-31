# Portfolio: A New Type of Experience 🚀

An experimental, highly interactive SPA (Single Page Application) portfolio featuring dynamic animations, real-time activity synchronization, and a custom LeetCode resolution system.

## 🛠️ Tech Stack
-   **Frontend**: Vanilla JS (ES6+), CSS3 (Modern Hooks/Variables), HTML5.
-   **Animations**: Custom CSS Keyframes & Floating Balloon System.
-   **Backend/API**: Node.js (Vercel Serverless Functions).
-   **Database**: Supabase (PostgreSQL) for real-time data persistence.
-   **Automation**: Vercel Cron Jobs & GitHub API Integration.

---

## 🤖 How Automation Works (Tutorial)

This portfolio is designed to be "alive", updating itself based on your activities. Here is how to use the automated features:

### 1. GitHub Activity Sync (Automatic)
The "Floating Balloons" and "Activity Feed" sync with your GitHub profile automatically.
-   **The Mechanism**: A cron job runs every 6 hours on Vercel. It calls `/api/update-github-cache`.
-   **What it does**: It fetches your latest **Stars**, **Releases**, and **Followers** and saves them into a Supabase cache.
-   **How to Force Update**: If you don't want to wait 6 hours, you can manually trigger a sync by visiting:
    `https://your-domain.com/api/update-github-cache?username=YOUR_USERNAME`
-   **Visual Result**: New activity will automatically appear as floating notifications (balloons) across the site.

### 2. LeetCode Daily System (Semi-Automatic)
A custom system to track your algorithm resolutions with an interactive heatmap.
-   **How to Add a Problem**:
    1.  Go to `admin-leetcode.html` in your browser.
    2.  Enter the secret key, problem number, and name.
    3.  Choose the **Category** (Daily Challenge or Training).
    4.  Write the resolution in Markdown.
-   **Results**:
    -   The **Heatmap** updates automatically to show activity on that day.
    -   The **Streak** counter increments if you post consecutive days.
    -   The **Feed** and **Filters** reflect the new resolution immediately.

### 3. Dynamic Sidebar (Academic/Reading List)
The "Academic" section features a reading list that updates based on the `data/academic.json` file.
-   **To Update**: Simply modify the JSON file with new books or courses. The SPA will reflect these changes on the next reload without touching the HTML structure.

---

## 🎈 Floating Balloons
The balloons are not just decor; they are real-time notifications of:
-   **New Followers** on GitHub.
-   **New Stars** on your repositories.
-   **New Releases** of your projects.
-   **LeetCode Streaks** and updates.

## 🚀 Development
To run this project locally:
1.  Clone the repository.
2.  Install Vercel CLI: `npm i -g vercel`.
3.  Run `vc dev` to start the serverless environment with local environment variables.
