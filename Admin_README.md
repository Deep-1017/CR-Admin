<div align="center">

# 🛡️ CR Admin Panel

### A powerful, real-time dashboard for managing your musical instruments & audio equipment e-commerce store

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📋 Overview

**CR Admin** is the administrative dashboard for the CR musical instruments & audio equipment e-commerce platform. Built with **React 19**, **TypeScript**, and **Tailwind CSS 4**, it provides store managers with a centralized interface to monitor sales performance via interactive Recharts/Chart.js visualizations, manage instrument inventory with full variant support, moderate customer reviews, track and update order statuses, and configure store-wide settings — all within a clean, responsive sidebar-driven layout. Authentication is handled via JWT with automatic token injection and 401-based session expiry.

---

## ✨ Features

### 🔐 Login & Authentication
- **Split-screen login page** — decorative gradient left panel (hidden on mobile) + login form on right
- **Email/password form** with validation
- **Password visibility toggle** (Eye/EyeOff icon)
- **"Remember me"** checkbox
- **Loading spinner** during authentication with disabled submit
- **Error alert** with styled banner for invalid credentials
- **JWT token management** — stores token in `localStorage` on success
- **Auto-redirect** — unauthenticated users always see the login page (no route access)
- **Axios request interceptor** — auto-attaches `Bearer` token to all API calls
- **Axios response interceptor** — on `401` response, clears token and reloads to force re-login
- **Responsive** — mobile-optimized layout with hidden branding panel

### 📊 Dashboard
- **KPI stat cards** (4 cards) — Total Revenue, Total Orders, Total Customers, Page Views, each with:
  - Icon with color-coded background
  - Trend indicator (↑/↓ percentage)
  - Description label
  - Hover effects with subtle shadow
- **Revenue chart** — interactive area chart powered by `SalesChart` component (Recharts `AreaChart`) with:
  - Gradient fill under the curve
  - Custom tooltip with INR formatting
  - Responsive container adapting to card width
  - Time period selector (This Week / This Month / This Year)
- **Top Categories panel** — category performance list with trend percentages (Amplifier, Microphone, Portable Speaker)
- **Recent Orders table** — last 5 orders with:
  - Order ID (monospace), Product name, Quantity, Status badge, Amount (INR formatted)
  - Color-coded status pills (Approved/Pending/Rejected/Processing)
  - Hover row highlighting
  - "View All →" link to Orders page
- **Date filter button** in header area

### 🎸 Product Management
- **Product listing page** (`/products`) with:
  - **Paginated product table** (20 per page) fetched from backend API
  - **Search** — filters by product name or SKU
  - **Category filter** dropdown — hierarchical category tree with 14 parent categories and child subcategories (Amplifier, Microphone, Mixers, Portable Speakers, Speakers, Unit Driver, Drivers, Crossover, Megaphones, Conference System, Audio Splitter, Line Array Loudspeaker, Intellection Speaker, Stands)
  - **View mode toggle** — Table view vs. Grid view (LayoutList / LayoutGrid icons)
  - **Expandable filter panel** toggle
  - **Stock summary bar** — In Stock / Low Stock / Out of Stock counts with color indicators
  - **Result count** and **pagination controls** (Previous/Next with page indicators)
  - **Product cards/rows** showing: image, name, SKU, category, brand, price (INR), stock status badge with dot indicator (In Stock green / Low Stock amber / Out of Stock red)
  - **Action buttons** per product: View (Eye → navigates to detail), Edit (Edit2), Delete (Trash2)
- **Add / Edit Product modal** with:
  - **Product details form**: Name, Category (dropdown from tree), Brand (22 brands: Ahuja, StudioMaster, DynaTech, Digimore, NX Audio, P. Audio, Sound Craft, Stranger, Dbx, Pioneer, Dasska, Yamaha, Real Audio, ITS, A Plus, Tauras, Musimax, AudioTone, Sousys, NV mark, Dynamite, Nlabs), Price, Original Price, Description, Condition (New/Used), Skill Level
  - **On Sale toggle**
  - **Active/Inactive toggle** (isActive)
  - **Image upload** — multi-file upload (4–7 images required) via `/upload` endpoint with:
    - FormData multipart upload
    - Upload progress indicator
    - Image preview grid with remove option
    - Validation: minimum 4, maximum 7 images
  - **Variant management** — dynamic variant form rows:
    - Configuration, Finish, SKU, Stock, Price (optional override) fields per variant
    - **SKU validation** — regex pattern `^[A-Z]{2,10}-[A-Z0-9]{1,20}(?:-[A-Z0-9]{2,12}){2,5}$`
    - **Add variant** button
    - **Remove variant** button (minimum 1 variant enforced)
    - Duplicate SKU detection across variants
    - Incomplete variant detection (partial fill validation)
    - Auto-calculated total stock from variant stocks
    - Variant images support
    - Legacy variant auto-generation for products without variants
  - **Form validation** — required fields, image count, SKU format, variant completeness
  - **Sticky modal header** with close button
  - **Scrollable modal body** with footer action buttons
- **Delete product confirmation modal** with backdrop blur
- **Product detail page** (`/products/:productId`) with:
  - **Back to Products** navigation button
  - **Image gallery** with:
    - Main image display (1:1 aspect ratio)
    - Thumbnail strip with active border indicator
    - Previous/Next image navigation arrows
    - Image counter badge
    - **Full-screen image modal** — click main image to open overlay with zoom, navigation arrows, and close button
  - **Product details card** — Price (with original price strikethrough), Category, Brand, Stock count/status, Image count
  - **Description section**
- **Toast notifications** on all CRUD operations (success/error) via custom `ToastContainer`

### 🛒 Order Management
- **Orders list page** (`/orders`) with:
  - **KPI stat cards** (5 cards) — Total Orders, Pending, Processing, Approved, Rejected counts with color-coded icons
  - **Search** — filters by Order ID, customer name, or product name
  - **Status filter** dropdown — All Status, Approved, Pending, Processing, Rejected
  - **Clear filters** button (shown when active)
  - **Result count** display
  - **Export button** for order data
  - **Orders table** with columns: Order ID (monospace), Customer (avatar initials + name), Product, Date, Total (INR), Status badge, Action (chevron to detail)
  - **Loading state** — spinner with message
  - **Error state** — error icon with message
  - **Empty state** — icon with "No orders found" message
- **Order detail slide-out panel** (right sidebar overlay) with:
  - **Order header** — Order ID, status badge, placement date
  - **Customer info** — full name, email, shipping address
  - **Order items list** — item name, quantity, unit price
  - **Order total** (INR formatted)
  - **Payment method** display
  - **Status update form**:
    - Status dropdown (Approved/Pending/Processing/Rejected)
    - **Update Status button** — calls `updateOrderStatus` API
    - Status mapping: UI statuses ↔ Backend statuses (Approved↔Completed, Rejected↔Cancelled, Pending↔Pending, Processing↔Processing)
  - **Slide-in animation** on open
  - **Backdrop close** on click outside
- **Toast notifications** on status update success/failure

### ⭐ Reviews Moderation
- **Reviews moderation page** (`/reviews`) with:
  - **KPI stat cards** (4 cards) — Total Reviews, Pending, Approved, Rejected counts
  - **Search** — filters by review title, comment, user name, or product name
  - **Status filter** dropdown — All Status, Pending, Approved, Rejected
  - **Refresh button** to reload review data
  - **Reviews table** with columns:
    - **User & Product** — reviewer name and product name
    - **Rating** — 5-star visual display (filled/empty stars)
    - **Review Content** — title, truncated comment (2-line clamp), rejection reason display for rejected reviews
    - **Status** — color-coded pill badge (Approved green / Pending amber / Rejected red)
    - **Actions**:
      - **Approve** button (green, shown for pending reviews) — calls `PATCH /admin/reviews/:id/approve`
      - **Reject** button (red, shown for pending reviews) — opens rejection reason modal
      - **Delete** button (always shown) — with `window.confirm` confirmation, calls `DELETE /admin/reviews/:id`
  - **Rejection modal** — requires a reason text before confirming rejection
  - **Optimistic UI** — updates local state immediately after approve/reject/delete
  - **Loading state** and **empty state** handling
  - **Toast notifications** on all moderation actions

### 📈 Analytics
- **Analytics page** (`/analytics`) with:
  - **Tab navigation** — Overview, Revenue, Products, Customers tabs
  - **Date range selector** — Last 7 Days, Last 30 Days, Last 90 Days, This Year
  - **KPI cards** (4 cards) — Gross Revenue, Net Profit, Conversion Rate, Avg. Order Value with:
    - INR formatted values
    - Percentage change badges (green/red)
    - Color-coded icons
  - **Revenue vs Expenses chart** — dual `AreaChart` (Recharts) with:
    - Linear gradient fills under curves
    - Custom tooltip with INR formatting
    - Responsive container
    - Legend with circle icons
  - **Sales by Category** — horizontal progress bar chart for 5 categories (Amplifier, Microphone, Portable Speaker, Unit Driver, Drivers) with:
    - Animated progress bars with colored box-shadows
    - Percentage labels
    - Total categories count
  - **Monthly Orders chart** — `BarChart` (Recharts) showing orders placed vs returned with:
    - Stacked/grouped bars
    - Custom tooltip
    - Responsive container
  - **Top Products table** — rank, product name, units sold, revenue (INR), growth percentage
  - **Traffic Sources** — distribution chart (Direct, Organic Search, Social Media, Referral)

### ⚙️ Settings
- **Settings page** (`/settings`) with sidebar navigation and 5 sections:
  - **General** — Store information form:
    - Store Name, Store Email, Support Phone, Website URL, Store Address (textarea)
    - Regional Settings — Currency (USD/EUR/GBP/INR), Timezone (IST/EST/PST/GMT), Language (English/Spanish/French/German)
  - **Notifications** — Toggle switches for:
    - New Orders alerts
    - Low Stock alerts
    - Customer Reviews notifications
    - Marketing Emails
    - Custom `ToggleSwitch` component with smooth animation
  - **Security**:
    - Change Password form — Current Password, New Password, Confirm New Password
    - Two-Factor Authentication — Enable 2FA button with Shield icon
    - Active Sessions — list of active devices with "Current" badge and remote logout button
  - **Team** — Team member management:
    - Member list with avatar, name, email, role, status
    - **Invite Team Member** button
    - **Role badges** — Super Admin (indigo), Admin (green), Manager (amber), Viewer (gray)
    - **Status indicators** — Active (green), Invited (amber)
    - Action buttons per member
  - **Billing** — Payment and subscription management:
    - Current plan display (Pro Plan)
    - Plan features list
    - Upgrade Plan button
    - Payment method card — masked card number, expiry, "Update" button
    - Billing history table — date, description, amount (INR), status badge (Paid green / Pending amber)
  - **Save button** per section with toast notification on save
- **Sticky sidebar nav** with icon + label for each section
- **Active section highlighting** (indigo background)

### 🧭 Layout & Navigation
- **Persistent sidebar** (`Sidebar.tsx`) with:
  - **CR Music** brand logo with gradient icon
  - **Grouped navigation** — Overview (Dashboard, Analytics), Management (Products, Orders, Reviews), Configuration (Settings)
  - **Active route highlighting** — indigo background with shadow on active NavLink
  - **User card** — avatar initials, "Admin User" name, email
  - **Logout button** — clears token from localStorage and reloads page
  - **Desktop mode** — sticky sidebar (260px width), always visible
  - **Mobile mode** — fixed overlay sidebar with:
    - Backdrop blur overlay
    - Slide-in animation (cubic-bezier)
    - Close button (X icon)
    - Auto-close on nav link click
- **Sticky header** (`Header.tsx`) with:
  - **Hamburger menu** button (mobile only) to toggle sidebar
  - **Global search bar** — "Search products, orders..." input with focus ring effect (hidden on mobile)
  - **Notification bell** — dropdown panel with:
    - Unread count dot (pulsing red indicator)
    - 3 notification items (New Order, Low Stock Alert, Order Approved) with unread styling
    - Relative timestamps
    - "View all notifications" link
  - **User menu** dropdown — avatar, name ("Admin"), role ("Super Admin"), with:
    - Profile Settings, Change Password, Activity Log links
    - Logout button (red on hover)

### 🧩 UI Component Library
- **8 reusable base UI components** in `components/ui/`:
  - `Badge.tsx` — color-coded status badges
  - `Button.tsx` — styled button with variants
  - `Card.tsx` — content card container
  - `Input.tsx` — styled form input
  - `Modal.tsx` — reusable modal dialog with header/body/footer, backdrop blur, slide-in animation
  - `StatCard.tsx` — KPI statistic display card
  - `Table.tsx` — styled table wrapper
  - `Toast.tsx` — toast notification system with auto-dismiss (4s), success/error/info types, stackable, close button
- **Layout components**:
  - `Layout.tsx` — root layout with sidebar + header + scrollable main content
  - `Sidebar.tsx` — responsive sidebar with grouped navigation
  - `Header.tsx` — sticky header with search, notifications, user menu
  - `SalesChart.tsx` — Recharts area chart for dashboard revenue

### 📱 Responsive Design
- Fully responsive across mobile, tablet, and desktop
- Mobile hamburger menu with slide-out sidebar overlay
- Hidden search bar on mobile (Header)
- Adaptive stat card grids (auto-fit responsive columns)
- Scrollable tables with horizontal overflow
- Clamp-based fluid typography throughout

---

## 🗂️ Project Structure

```
CR-Admin/
├── public/                        # Static assets
├── src/
│   ├── api/
│   │   ├── products.ts            # Product CRUD API (fetch, create,
│   │   │                          #   update, delete, fetchById)
│   │   ├── orders.ts              # Order API (fetch all, fetchById,
│   │   │                          #   updateStatus, delete)
│   │   ├── reviews.ts             # Review moderation API (fetch,
│   │   │                          #   approve, reject, delete)
│   │   └── upload.ts              # Image upload API (multipart FormData)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Badge.tsx          # Status badge component
│   │   │   ├── Button.tsx         # Styled button
│   │   │   ├── Card.tsx           # Content card
│   │   │   ├── Input.tsx          # Form input
│   │   │   ├── Modal.tsx          # Reusable modal dialog
│   │   │   ├── StatCard.tsx       # KPI stat card
│   │   │   ├── Table.tsx          # Table wrapper
│   │   │   └── Toast.tsx          # Toast notification system
│   │   ├── Layout.tsx             # Root layout (sidebar + header + outlet)
│   │   ├── Sidebar.tsx            # Responsive sidebar navigation
│   │   ├── Header.tsx             # Sticky header with search,
│   │   │                          #   notifications, user menu
│   │   └── SalesChart.tsx         # Dashboard revenue area chart
│   ├── pages/
│   │   ├── Login.tsx              # Admin login (email/password + JWT)
│   │   ├── Dashboard.tsx          # KPI overview, chart, recent orders
│   │   ├── Products.tsx           # Product CRUD with variant management
│   │   ├── ProductDetail.tsx      # Single product view with gallery
│   │   ├── Orders.tsx             # Order list, detail panel, status update
│   │   ├── Reviews.tsx            # Review moderation (approve/reject/delete)
│   │   ├── Analytics.tsx          # Charts, KPIs, top products, traffic
│   │   └── Settings.tsx           # 5-section admin settings
│   ├── lib/
│   │   ├── api.ts                 # Axios instance with JWT interceptors
│   │   └── utils.ts               # formatINR(), INR number formatting
│   ├── assets/                    # Static images & media
│   ├── App.tsx                    # Root component, auth gate & routes
│   ├── main.tsx                   # Application entry point
│   ├── App.css                    # App-level styles
│   └── index.css                  # Global styles & Tailwind CSS
├── index.html                     # HTML entry point
├── vite.config.ts                 # Vite config with Tailwind CSS plugin
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.app.json              # App TypeScript config
├── tsconfig.node.json             # Node TypeScript config
├── eslint.config.js               # ESLint configuration
└── package.json                   # Dependencies & scripts
```

---

## 🛤️ Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | — | Redirects to `/dashboard` |
| `/dashboard` | Dashboard | KPI cards, revenue chart, recent orders |
| `/products` | Products | Product listing with search, filter, pagination |
| `/products/:productId` | ProductDetail | Individual product view with image gallery |
| `/orders` | Orders | Order list with status management |
| `/reviews` | Reviews | Review moderation (approve/reject/delete) |
| `/analytics` | Analytics | Charts, KPIs, top products, traffic sources |
| `/settings` | Settings | Store config, notifications, security, team, billing |

> **Note:** All routes are protected — unauthenticated users are shown the Login page. Authentication is gate-level (no route rendering without a valid token).

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `v18+`
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
| **Tailwind CSS** | ^4.2.1 | Utility-first styling (v4 with `@tailwindcss/vite` plugin) |
| **React Router DOM** | ^7.13.1 | Client-side routing (8 routes) |
| **Axios** | ^1.13.6 | HTTP API client with JWT interceptors |
| **Recharts** | ^3.8.0 | Interactive charts (AreaChart, BarChart) |
| **Chart.js** | ^4.5.1 | Dashboard charts & graphs |
| **react-chartjs-2** | ^5.3.1 | React Chart.js bindings |
| **Zod** | ^4.3.6 | Schema validation |
| **@hookform/resolvers** | ^5.2.2 | Form validation resolvers |
| **Lucide React** | ^0.577.0 | Icon library |

---

## 🎨 Design System

The admin UI follows a consistent, professional design system:

- **Typography**: Inter / system font stack
- **Color Palette**: Indigo primary (`#4f46e5`) with violet accent (`#7c3aed`), slate grays for neutral surfaces, semantic colors for status indicators (green/amber/red)
- **Cards**: Rounded corners (10–16px), subtle borders (`#f0f4f8`), hover shadow effects
- **Modals**: Backdrop blur (`4px`), slide-in-up animation, sticky headers
- **Tables**: Alternating hover rows, uppercase header labels, color-coded status badges
- **Forms**: Indigo focus rings (`box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1)`), smooth transitions
- **Toasts**: Auto-dismissing (4s) notifications with success/error/info variants
- **Sidebar**: Fixed 260px desktop / slide-in overlay mobile, indigo active state with shadow
- **Animations**: `fadeIn`, `slideInUp`, `slideInRight`, `slideInLeft`, `spin` keyframes throughout
- **Layout**: Container max-width `1400px`, consistent `2.5rem` padding

---

## 🔗 API Integration

The admin communicates with the CR Backend via a centralized Axios instance (`src/lib/api.ts`) pointing to `http://localhost:5000/api/v1`:

| Endpoint | Method | Usage |
|----------|--------|-------|
| `/auth/login` | POST | Admin authentication |
| `/products` | GET | Fetch paginated product list |
| `/products/:id` | GET | Fetch single product detail |
| `/products` | POST | Create a new product |
| `/products/:id` | PUT | Update an existing product |
| `/products/:id` | DELETE | Delete a product |
| `/orders/admin/all` | GET | Fetch all orders (admin view) |
| `/orders/:id` | GET | Fetch single order detail |
| `/orders/:id` | PUT | Update order status |
| `/orders/:id` | DELETE | Delete an order |
| `/admin/reviews` | GET | Fetch all reviews (admin moderation) |
| `/admin/reviews/:id/approve` | PATCH | Approve a pending review |
| `/admin/reviews/:id/reject` | PATCH | Reject a review (with reason) |
| `/admin/reviews/:id` | DELETE | Permanently delete a review |
| `/upload` | POST | Upload product image (multipart/form-data) |

---

## 🔗 Related Services

This panel works in conjunction with the other parts of the CR platform:

- **[CR Backend](../CR-Backend/README.md)** — REST API server (Express + MongoDB)
- **[CR Frontend](../CR-Frontend/README.md)** — Customer-facing storefront

---

## 📄 License

This project is private and proprietary. All rights reserved.
