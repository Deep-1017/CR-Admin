<div align="center">

# 🛡️ CR Admin Panel

### A powerful, real-time dashboard for managing your e-commerce store

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📋 Overview

**CR Admin** is the administrative dashboard for the CR e-commerce platform. It provides a centralized interface for store managers to monitor sales performance, manage product inventory, and track customer orders — all in a clean, responsive UI.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 📊 **Analytics Dashboard** | Visual charts for revenue, orders, and product performance |
| 📦 **Products Management** | Create, update, and delete products with image support |
| 🛒 **Orders Management** | View, filter, and update order statuses in real-time |
| 🔐 **Secure Access** | JWT-based authentication with protected admin routes |
| 📱 **Responsive Design** | Fully mobile-friendly layout |
| ⚡ **Fast & Reactive** | Powered by Vite + React 19 for near-instant HMR |

---

## 🗂️ Project Structure

```
CR-Admin/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Layout/         # Sidebar, Navbar, etc.
│   │   └── ui/             # Shared UI elements
│   ├── pages/
│   │   ├── Dashboard.tsx   # Analytics & KPI overview
│   │   ├── Products.tsx    # Product CRUD management
│   │   └── Orders.tsx      # Order tracking & management
│   ├── App.tsx             # Root component & routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `v18+`
- npm or yarn
- CR Backend server running at `http://localhost:5000`

### Installation & Setup

```bash
# 1. Navigate to the admin directory
cd CR-Admin

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The admin panel will be available at **[http://localhost:5174](http://localhost:5174)** (or the next available port).

---

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across all source files |

---

## 🧰 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | ^19.2.0 | UI framework |
| **TypeScript** | ~5.9.3 | Type safety |
| **Vite** | ^7.3.1 | Build tool & dev server |
| **Tailwind CSS** | ^4.2.1 | Utility-first styling |
| **React Router DOM** | ^7.13.1 | Client-side routing |
| **Axios** | ^1.13.6 | HTTP API client |
| **Chart.js** | ^4.5.1 | Dashboard charts & graphs |
| **Lucide React** | ^0.577.0 | Icon library |

---

## 🔗 Related Services

This panel works in conjunction with the other parts of the CR platform:

- **[CR Backend](../CR-Backend/README.md)** — REST API server (Express + MongoDB)
- **[CR Frontend](../CR-Frontend/README.md)** — Customer-facing storefront

---

## 📄 License

This project is private and proprietary. All rights reserved.
