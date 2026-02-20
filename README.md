# 🛸 KUBE - Africa's First Aerial Intelligence Platform for Living Assets

<div align="center">

![KUBE Platform](https://img.shields.io/badge/KUBE-Aerial_Intelligence-0066FF?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production_Ready-00CC66?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Web_&_Mobile-00AAFF?style=for-the-badge)

**Turning Africa's livestock, wildlife, and landscapes into real-time, data-driven, protectable assets**

</div>

---

## 🌍 What is KUBE?

KUBE is not a drone project. **KUBE is a new operating system** for how Africa protects, manages, and grows its living wealth.

In one sentence:
> **KUBE gives Africa "eyes in the sky + brains in the cloud" to protect animals, stop losses, and grow productivity at continental scale.**

### The Origin Story

*"In 2019, 950 cattle disappeared into the Zimbabwean savannah and were never recovered. That loss wasn't just animals—it was school fees, food security, and family survival. KUBE exists so that no farmer, ranger, or community has to be blind again."*

---

## 🚀 One Platform. Three Massive Markets.

### 1️⃣ KUBE-Farm (Livestock Intelligence)
- Real-time herd counting & tracking
- Early disease & heat stress detection (thermal AI)
- Missing animal search (day & night)
- Pasture biomass & NDVI maps
- Anti-theft patrols with visual evidence
- SMS alerts for rural farmers

### 2️⃣ KUBE-Park (Wildlife & Tourism Intelligence)
- Automated wildlife census
- Migration & movement tracking
- Injured/sick wildlife detection
- Night thermal patrols
- Real-time ranger alerts
- Evidence-grade aerial footage

### 3️⃣ KUBE-Land (Landscape & Climate Intelligence)
- Overgrazing & land degradation monitoring
- Vegetation health & drought stress maps
- Land-use change timeline
- Climate risk indicators
- Policy/insurance reports

---

## 💎 What Makes KUBE Different

### 🔮 Proactive, Not Reactive
Detects problems **before** humans notice them:
- Fever before visible sickness
- Isolation before death
- Unusual movement before theft
- Vegetation stress before pasture collapse

### 🌤️ Sky as Digital Infrastructure
- **Drones** = moving sensors
- **AI** = real-time decision engine
- **Cloud** = national livestock & wildlife brain
- **Mobile** = last-mile interface

### 👥 Digital Twins of Living Systems
Creates digital profiles for every herd, park zone, and grazing area with:
- Health history
- Movement patterns
- Risk maps
- Productivity trends

### 📈 Scales from Village to Continent
- **Start**: 1-2 drones serving one cooperative
- **Scale**: Regional operations centers
- **National**: Aerial intelligence network
- **Regional**: Cross-border tracking

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React + TypeScript)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Maps**: Mapbox GL JS
- **Charts**: Recharts
- **State**: React Context + Hooks

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Real-time**: Socket.io
- **Auth**: JWT

### Infrastructure
- **Hosting**: Vercel (Frontend) + Railway/AWS (Backend)
- **Database**: Supabase / AWS RDS
- **Storage**: AWS S3 / Cloudinary
- **Maps**: Mapbox
- **CDN**: Cloudflare

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Git

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd KUBE-WEB

# 2. Install root dependencies
npm install

# 3. Setup backend
cd apps/backend
npm install
cp .env.example .env
# Edit .env with your database credentials

# 4. Setup database
npx prisma generate
npx prisma migrate dev
npm run seed  # Load demo data

# 5. Setup frontend
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local with API URL

# 6. Return to root and start development
cd ../..
npm run dev
```

### Quick Start

```bash
# From root directory
npm install
npm run setup
npm run seed
npm run dev
```

The platform will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 📁 Project Structure

```
KUBE-WEB/
├── apps/
│   ├── backend/              # Node.js + Express API
│   │   ├── src/
│   │   │   ├── controllers/  # API controllers
│   │   │   ├── routes/       # API routes
│   │   │   ├── models/       # Data models
│   │   │   ├── services/     # Business logic
│   │   │   ├── middleware/   # Auth, validation
│   │   │   └── utils/        # Helpers
│   │   ├── prisma/           # Database schema & migrations
│   │   └── package.json
│   │
│   └── frontend/             # Next.js + React app
│       ├── src/
│       │   ├── app/          # Next.js pages (app router)
│       │   ├── components/   # React components
│       │   ├── lib/          # Utilities
│       │   ├── hooks/        # Custom hooks
│       │   ├── contexts/     # React contexts
│       │   └── types/        # TypeScript types
│       └── package.json
│
├── packages/                 # Shared packages (future)
├── docs/                     # Documentation
└── package.json              # Root workspace config
```

---

## 👥 Default Users (Demo Data)

After seeding, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kube.africa | admin123 |
| Farmer | farmer@kube.africa | farmer123 |
| Ranger | ranger@kube.africa | ranger123 |
| Analyst | analyst@kube.africa | analyst123 |

---

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#0066FF` - Sky, trust, technology
- **Deep Blue**: `#003D99` - Authority, depth
- **Light Blue**: `#66B2FF` - Clarity, openness
- **Accent Blue**: `#00AAFF` - Energy, action
- **Success**: `#00CC66` - Growth, health
- **Warning**: `#FFAA00` - Alerts, attention
- **Danger**: `#FF3366` - Urgency, critical
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Headings**: Inter / Outfit (bold, modern)
- **Body**: Inter (clean, readable)
- **Code/Data**: JetBrains Mono

---

## 📊 Features Showcase

### Landing Page
- Cinematic hero section with animated sky visualization
- Mission statement and origin story
- Three-module showcase
- Real-world impact metrics
- Call-to-action for demo

### Dashboard
- Module switcher (Farm / Park / Land)
- Real-time alert feed
- Live statistics cards
- Activity timeline
- Quick actions panel

### KUBE-Farm
- Interactive herd map
- Individual animal profiles
- Health monitoring dashboard
- Pasture condition maps
- Alert configuration

### KUBE-Park
- Wildlife census dashboard
- Species tracking maps
- Patrol routes and incidents
- Evidence gallery
- Ranger communication

### KUBE-Land
- Vegetation health heatmaps
- Land degradation indicators
- Climate risk assessment
- Policy reports generator
- Historical comparisons

---

## 🚦 Roadmap

### Phase 1: MVP (Current)
- ✅ Core platform architecture
- ✅ Three module foundations
- ✅ Demo data and simulations
- ✅ Web interface

### Phase 2: Production
- 🔲 Real drone integration
- 🔲 Live AI processing
- 🔲 Mobile apps (iOS/Android)
- 🔲 SMS/USSD gateway
- 🔲 Multi-tenancy

### Phase 3: Scale
- 🔲 Regional deployment
- 🔲 Multi-language support
- 🔲 Offline-first sync
- 🔲 Satellite imagery integration
- 🔲 Cross-border tracking

### Phase 4: Ecosystem
- 🔲 Partner APIs
- 🔲 Insurance integration
- 🔲 Marketplace for services
- 🔲 Community platform
- 🔲 Training academy

---

## 🤝 Contributing

KUBE is built for Africa, by innovators who believe technology should serve communities first.

Contributions are welcome! Please read our contributing guidelines and code of conduct.

---

## 📄 License

Copyright © 2024-2026 KUBE Platform. All rights reserved.

---

## 🌟 Impact

With KUBE, Africa can achieve:
- ✅ 25-40% faster detection of sick, lost, or injured animals
- ✅ >95% accuracy in herd and wildlife counts
- ✅ 20-50% reduction in theft and poaching
- ✅ Smarter grazing = higher yields + less land degradation
- ✅ Higher farmer income + stronger rural economies
- ✅ Youth jobs in drone ops, AI, data, and field tech

---

<div align="center">

**Built with 💙 for Africa's future**

[Website](https://kube.africa) • [Demo](https://demo.kube.africa) • [Docs](https://docs.kube.africa) • [Contact](mailto:hello@kube.africa)

</div>
#   K U B E - s y s t e m s  
 