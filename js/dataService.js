// Data Service - Handles data fetching for detail pages
// Currently uses mock data, prepared for future backend integration

const DataService = {
    // Mock data for projects
    projects: {
        'e-commerce-platform': {
            id: 'e-commerce-platform',
            title: 'E-Commerce Platform',
            subtitle: 'Full-stack online store with payment integration',
            content: `# E-Commerce Platform

A modern, full-stack e-commerce platform built with cutting-edge technologies.

## Features

- **User Authentication**: Secure login and registration system
- **Product Catalog**: Browse and search through thousands of products
- **Shopping Cart**: Add, remove, and manage items
- **Payment Integration**: Secure checkout with Stripe
- **Order Tracking**: Real-time order status updates
- **Admin Dashboard**: Manage products, orders, and users

## Tech Stack

- **Frontend**: React, Redux, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Payment**: Stripe API
- **Deployment**: AWS (EC2, RDS, S3)

## Key Achievements

- Handled 10,000+ daily active users
- 99.9% uptime
- Sub-second page load times
- PCI DSS compliant payment processing

## Code Example

\`\`\`javascript
// Payment processing with Stripe
const processPayment = async (paymentIntent) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET);
    
    const payment = await stripe.paymentIntents.create({
        amount: paymentIntent.amount,
        currency: 'usd',
        payment_method: paymentIntent.paymentMethod,
        confirm: true,
    });
    
    return payment;
};
\`\`\`

## Links

- [Live Demo](https://example.com)
- [GitHub Repository](https://github.com/example/ecommerce)
`
        },
        'mobile-banking-app': {
            id: 'mobile-banking-app',
            title: 'Mobile Banking App',
            subtitle: 'React Native app for financial management',
            content: `# Mobile Banking App

A secure and intuitive mobile banking application for iOS and Android.

## Overview

This cross-platform mobile app provides users with complete control over their finances, from checking balances to transferring money and paying bills.

## Features

- **Account Overview**: View all accounts at a glance
- **Transfers**: Send money instantly to other users
- **Bill Payments**: Schedule and automate bill payments
- **Budgeting Tools**: Track spending and set financial goals
- **Biometric Security**: Face ID and fingerprint authentication
- **Push Notifications**: Real-time transaction alerts

## Technology

- React Native
- Redux for state management
- Firebase for authentication
- Plaid API for bank connections
- Chart.js for data visualization

## Security

All data is encrypted end-to-end using AES-256 encryption. We follow industry best practices for secure mobile development.
`
        },
        'analytics-dashboard': {
            id: 'analytics-dashboard',
            title: 'Analytics Dashboard',
            subtitle: 'Real-time data visualization platform',
            content: `# Analytics Dashboard

A powerful real-time analytics platform for business intelligence.

## Description

Built for enterprise clients to monitor KPIs, track metrics, and make data-driven decisions.

## Features

- Real-time data streaming
- Customizable widgets
- Multiple data source integrations
- Export to PDF/Excel
- Role-based access control

## Tech Stack

- Vue.js 3
- D3.js for visualizations
- WebSocket for real-time updates
- Node.js backend
- MongoDB for data storage
`
        }
    },

    // Mock data for blog posts
    blogPosts: {
        'spa-architecture': {
            id: 'spa-architecture',
            title: 'Getting Started with SPA Architecture',
            date: 'Nov 23, 2025',
            content: `# Getting Started with SPA Architecture

Single Page Applications (SPAs) have revolutionized web development by providing a more fluid user experience.

## What is a SPA?

A SPA is a web application that loads a single HTML page and dynamically updates content as the user interacts with the app.

## Benefits

1. **Better UX**: No page reloads, instant navigation
2. **Performance**: Less data transfer after initial load
3. **Mobile-friendly**: Similar to native app experience

## Implementation

Here's how to build a simple router:

\`\`\`javascript
class Router {
    constructor() {
        this.routes = {};
        window.addEventListener('hashchange', () => this.handleRoute());
    }
    
    register(path, handler) {
        this.routes[path] = handler;
    }
    
    handleRoute() {
        const path = window.location.hash.slice(1);
        this.routes[path]?.();
    }
}
\`\`\`

## Conclusion

SPAs are powerful but require careful consideration of SEO and initial load time.
`
        },
        'fullstack-journey': {
            id: 'fullstack-journey',
            title: 'My Journey into Full Stack Development',
            date: 'Nov 15, 2025',
            content: `# My Journey into Full Stack Development

A reflection on my path from beginner to professional developer.

## The Beginning

I started coding in 2018 with a simple HTML page. Little did I know where this journey would take me.

## Key Milestones

- **2018**: First HTML/CSS website
- **2019**: Learned JavaScript and React
- **2020**: Backend development with Node.js
- **2021**: First full-stack project
- **2022**: Professional developer role

## Lessons Learned

1. **Consistency is key**: Code every day, even if just for 30 minutes
2. **Build projects**: Theory is important, but practice is essential
3. **Join communities**: Learn from others and share your knowledge

## Advice for Beginners

Don't try to learn everything at once. Master the fundamentals first, then expand your knowledge gradually.
`
        },
        'scalable-apis': {
            id: 'scalable-apis',
            title: 'Building Scalable APIs with Node.js',
            date: 'Nov 01, 2025',
            content: `# Building Scalable APIs with Node.js

Best practices for designing and implementing RESTful APIs that can handle high traffic.

## Architecture Principles

### 1. Separation of Concerns

Keep your routes, controllers, and services separate:

\`\`\`javascript
// routes/users.js
router.get('/users/:id', userController.getUser);

// controllers/userController.js
exports.getUser = async (req, res) => {
    const user = await userService.findById(req.params.id);
    res.json(user);
};

// services/userService.js
exports.findById = async (id) => {
    return await User.findByPk(id);
};
\`\`\`

### 2. Error Handling

Implement centralized error handling middleware.

### 3. Caching

Use Redis for frequently accessed data.

### 4. Rate Limiting

Protect your API from abuse with rate limiting.

## Conclusion

Building scalable APIs requires planning and following best practices from the start.
`
        }
    },

    // Mock data for tools
    tools: {
        'quick-reference': {
            id: 'quick-reference',
            title: 'Quick Reference',
            subtitle: '开发人员分享快速参考备忘清单',
            content: `# Quick Reference Tool

A comprehensive collection of developer cheat sheets and quick references.

## Features

- Searchable cheat sheets
- Multiple programming languages
- Framework references
- Command line tools

## Usage

Simply search for the technology you need help with and get instant access to syntax, examples, and best practices.
`
        }
    },

    /**
     * Get project by ID
     * @param {string} id - Project identifier
     * @returns {Promise<Object>} Project data
     */
    async getProjectById(id) {
        // Simulate async operation
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const project = this.projects[id];
                if (project) {
                    resolve(project);
                } else {
                    reject(new Error('Project not found'));
                }
            }, 300); // Simulate network delay
        });

        // Future backend integration:
        // return fetch(`/api/projects/${id}`).then(res => res.json());
        // Or fetch README from GitHub:
        // return fetch(`https://raw.githubusercontent.com/user/repo/main/README.md`)
        //     .then(res => res.text())
        //     .then(content => ({ id, content }));
    },

    /**
     * Get blog post by ID
     * @param {string} id - Blog post identifier
     * @returns {Promise<Object>} Blog post data
     */
    async getBlogPostById(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const post = this.blogPosts[id];
                if (post) {
                    resolve(post);
                } else {
                    reject(new Error('Blog post not found'));
                }
            }, 300);
        });

        // Future backend integration:
        // return fetch(`/api/blog/${id}`).then(res => res.json());
    },

    /**
     * Get tool by ID
     * @param {string} id - Tool identifier
     * @returns {Promise<Object>} Tool data
     */
    async getToolById(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const tool = this.tools[id];
                if (tool) {
                    resolve(tool);
                } else {
                    reject(new Error('Tool not found'));
                }
            }, 300);
        });

        // Future backend integration:
        // return fetch(`/api/tools/${id}`).then(res => res.json());
    }
};
