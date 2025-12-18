# 🚀 Next.js Dashboard Starter Kit

A modern, production-ready Next.js dashboard starter kit with authentication, multi-tenancy, internationalization (i18n), and a beautiful UI built with shadcn/ui.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)

## ✨ Features

- 🔐 **Authentication** - Secure authentication with NextAuth.js v5
- 🏢 **Multi-tenancy** - Organization-based multi-tenant architecture
- 🌐 **Internationalization** - Built-in i18n support (English & Arabic)
- 🎨 **Beautiful UI** - Modern dashboard with shadcn/ui components
- 🌙 **Dark Mode** - System-aware dark/light theme switching
- 🎭 **Color Palettes** - Multiple color themes to choose from
- 📱 **Responsive** - Mobile-first responsive design
- 🔒 **Role-based Access** - User roles and permissions system
- 📊 **Dashboard Ready** - Pre-built dashboard with stats and widgets
- 🗄️ **Database Ready** - Prisma ORM with PostgreSQL
- ⚡ **Type Safe** - Full TypeScript support throughout

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui + Radix UI
- **Authentication:** NextAuth.js v5
- **Database ORM:** Prisma 6
- **Database:** PostgreSQL
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod
- **Icons:** Lucide React + Iconify
- **Animations:** Framer Motion

## 📦 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/dashboard-starter.git
   cd dashboard-starter
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/dashboard_db"
   
   # NextAuth
   AUTH_SECRET="your-super-secret-key-here"
   AUTH_URL="http://localhost:3000"
   
   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   
   # Seed the database
   pnpm db:seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

| Role  | Email              | Password   |
|-------|-------------------|------------|
| Admin | admin@example.com | admin123   |
| User  | user@example.com  | user123    |

## 📁 Project Structure

```
├── messages/               # i18n translation files
│   ├── en.json            # English translations
│   └── ar.json            # Arabic translations
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── [locale]/      # Locale-based routing
│   │   │   ├── dashboard/ # Dashboard pages
│   │   │   └── login/     # Auth pages
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI components (shadcn)
│   ├── data/              # Navigation & static data
│   ├── hooks/             # Custom React hooks
│   ├── i18n/              # i18n configuration
│   ├── lib/               # Utilities & configurations
│   └── services/          # API services
└── ...config files
```

## 🗄️ Database Schema

The starter kit includes a comprehensive schema for:

- **Organizations** - Multi-tenant support
- **Users** - User management with roles
- **User Groups** - Group-based permissions
- **Permissions** - Fine-grained access control
- **System Settings** - Per-organization configuration
- **Audit Logs** - Activity tracking
- **Notifications** - User notifications
- **Files** - File storage metadata
- **API Keys** - For integrations

## 🎨 Customization

### Adding New Pages

1. Create a new page in `src/app/[locale]/dashboard/your-page/page.tsx`
2. Add navigation entry in `src/data/navigation.ts`
3. Add translations in `messages/en.json` and `messages/ar.json`

### Modifying the Schema

1. Update `prisma/schema.prisma`
2. Run `pnpm db:migrate` to create a migration
3. Update the seed file if needed

### Adding UI Components

This project uses shadcn/ui. To add new components:
```bash
npx shadcn@latest add [component-name]
```

### Changing Color Themes

The app supports multiple color palettes. Modify the theme in:
- `src/app/globals.css` - CSS variables
- `src/components/layout/palette-changer.tsx` - Palette options

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:push` | Push schema changes |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed the database |
| `pnpm db:reset` | Reset and reseed database |

## 🌐 Internationalization

The app supports multiple languages out of the box:

- **English (en)** - Default
- **Arabic (ar)** - RTL support included

To add a new language:
1. Create `messages/[locale].json`
2. Update `src/i18n/routing.ts`
3. Add translations for all keys

## 🔒 Authentication

The starter uses NextAuth.js v5 with:
- Credentials provider (email/password)
- JWT sessions
- Role-based access control
- Organization context

To add OAuth providers, update `src/lib/auth.config.ts`.

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy!

### Docker

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
CMD ["npm", "start"]
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)

---

**Made with ❤️ for the developer community**
