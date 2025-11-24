# JSON Configuration Files

This directory contains JSON configuration files that control the content displayed on the portfolio website.

## Structure

```
data/
├── projects.json          # Projects configuration
├── tools.json            # Tools configuration
├── blog.json             # Blog configuration
└── content/              # Markdown content files
    ├── projects/         # Project markdown files
    │   ├── project-1.md
    │   └── project-2.md
    └── blog/             # Blog post markdown files
        ├── post-1.md
        └── post-2.md
```

## Files

### `projects.json`
Controls the projects page content.

#### Structure:

```json
{
  "topProjects": [
    {
      "id": "unique-project-id",
      "title": "Project Title",
      "subtitle": "Short description",
      "image": "assets/images/project.jpg",
      "gradient": "bg-purple-gradient",
      "icon": "fa-solid fa-code",
      "contentFile": "data/content/projects/project-id.md"
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
            "link": "https://external-link.com"
          }
        ]
      }
    ]
  }
}
```

**Top Projects**: 
- Use `contentFile` to reference a markdown file
- The markdown file contains the full project description
- Much easier to edit than inline JSON!

**Other Projects**: External links organized by categories

---

### `blog.json`
Controls the blog page content.

#### Structure:

```json
{
  "posts": [
    {
      "id": "unique-post-id",
      "title": "Post Title",
      "date": "Nov 23, 2025",
      "excerpt": "Short preview text...",
      "contentFile": "data/content/blog/post-id.md"
    }
  ]
}
```

**Blog Posts**: 
- Use `contentFile` to reference a markdown file
- Edit the `.md` file directly - no escaping needed!

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
          "title": "Tool Name",
          "subtitle": "Description of what the tool does",
          "link": "https://external-link.com"
        }
      ]
    }
  ]
}
```

**Tools**: User-created tools and utilities with external links, organized by categories (VS Code Extensions, Web Tools, Linux Apps, CLI Tools, Utilities, etc.)

---

## How to Edit

### Adding a New Project

1. **Create markdown file**: `data/content/projects/my-project.md`
   ```markdown
   # My Project
   
   Description here...
   
   ## Features
   - Feature 1
   - Feature 2
   ```

2. **Update JSON**: Add to `data/projects.json`
   ```json
   {
     "id": "my-project",
     "title": "My Project",
     "subtitle": "Cool project",
     "gradient": "bg-purple-gradient",
     "icon": "fa-solid fa-rocket",
     "contentFile": "data/content/projects/my-project.md"
   }
   ```

3. **Refresh** - Done!

### Adding a Blog Post

1. **Create markdown file**: `data/content/blog/my-post.md`
   ```markdown
   # My Blog Post
   
   Content here...
   ```

2. **Update JSON**: Add to `data/blog.json`
   ```json
   {
     "id": "my-post",
     "title": "My Post",
     "date": "Nov 24, 2025",
     "excerpt": "Preview...",
     "contentFile": "data/content/blog/my-post.md"
   }
   ```

### Benefits of Separate Files

✅ **Easy to Edit**: Edit markdown in your favorite editor
✅ **No Escaping**: No need for `\n` or escaping quotes
✅ **Syntax Highlighting**: Your editor highlights markdown
✅ **Version Control**: See changes clearly in Git
✅ **Reusable**: Same file can be used elsewhere

## Markdown Support

All `.md` files support full markdown syntax:

```markdown
# Heading 1
## Heading 2

**Bold** and *italic*

- Lists
- Work great

\`\`\`javascript
// Code blocks
const code = "awesome";
\`\`\`

[Links](https://example.com)

> Blockquotes

| Tables | Work | Too |
|--------|------|-----|
```

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

## Icons

Use [Font Awesome](https://fontawesome.com/icons) icons:
- Brands: `fa-brands fa-react`
- Solid: `fa-solid fa-code`
- Regular: `fa-regular fa-star`
