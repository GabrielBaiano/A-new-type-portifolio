# JSON Configuration Files

This directory contains JSON configuration files that control the content displayed on the portfolio website.

## Files

### `projects.json`
Controls the projects page content.

#### Structure:

```json
{
  "topProjects": [
    {
      "id": "unique-project-id",           // Used in URL: /detail/project/{id}
      "title": "Project Title",
      "subtitle": "Short description",
      "image": "assets/images/project.jpg", // Optional: path to image
      "gradient": "bg-purple-gradient",    // Optional: CSS gradient class (if no image)
      "icon": "fa-solid fa-code",          // Font Awesome icon (if no image)
      "content": "# Markdown content..."   // Full markdown content for detail page
    }
  ],
  "otherProjects": {
    "categories": [
      {
        "name": "Category Name",
        "projects": [
          {
            "title": "Project Title",
            "subtitle": "Description",
            "link": "https://external-link.com"  // External link (opens in new tab)
          }
        ]
      }
    ]
  }
}
```

**Top Projects**: Clickable cards that open detail pages with full markdown content
**Other Projects**: External links organized by categories

---

### `tools.json`
Controls the tools page content.

#### Structure:

```json
{
  "categories": [
    {
      "name": "Category Name",
      "tools": [
        {
          "id": "tool-id",
          "name": "Tool Name",
          "icon": "fa-brands fa-react",  // Font Awesome icon
          "color": "#61DAFB"             // Hex color for the icon
        }
      ]
    }
  ]
}
```

**Tools**: Displayed as icon + name, organized by categories

---

### `blog.json`
Controls the blog page content.

#### Structure:

```json
{
  "posts": [
    {
      "id": "unique-post-id",              // Used in URL: /detail/blog/{id}
      "title": "Post Title",
      "date": "Nov 23, 2025",
      "excerpt": "Short preview text...",
      "content": "# Full markdown content..."  // Full markdown content for detail page
    }
  ]
}
```

**Blog Posts**: Clickable posts that open detail pages with full markdown content

---

## How to Edit

1. **Edit the JSON files** in this directory
2. **Refresh the page** - changes will load automatically
3. **No code changes needed** - all content is data-driven

## Image Support

For top projects, you can either:
- Use a real image: `"image": "assets/images/project.jpg"`
- Use a gradient + icon: `"gradient": "bg-purple-gradient"` and `"icon": "fa-solid fa-code"`

Available gradients:
- `bg-purple-gradient`
- `bg-green-gradient`
- `bg-orange-gradient`
- `bg-red-gradient`
- `bg-cyan-gradient`

## Markdown Support

The `content` field in projects and blog posts supports full markdown:
- Headings (`# H1`, `## H2`, etc.)
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Links, images, tables
- Blockquotes, bold, italic

Example:
```markdown
# Project Title

## Features

- Feature 1
- Feature 2

## Code Example

\`\`\`javascript
const example = "Hello World";
\`\`\`
```

## Icons

Use [Font Awesome](https://fontawesome.com/icons) icons:
- Brands: `fa-brands fa-react`
- Solid: `fa-solid fa-code`
- Regular: `fa-regular fa-star`
