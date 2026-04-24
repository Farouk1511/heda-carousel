# Phase 2: Database Schema

## Goal
Define Prisma models for authentication, multi-brand tenancy, projects, posts, and subscriptions.

## Scope
- Database: PostgreSQL
- ORM: Prisma
- Auth compatibility: NextAuth v5 Prisma Adapter
- Content model: `Brand -> Project -> Post` with `slides` as JSON

## Step 1: Configure Prisma
Run:

```bash
npx prisma init --datasource-provider postgresql
```

Set `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/contentdeck?schema=public"
```

## Step 2: Create `prisma/schema.prisma`
Use the schema below.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  passwordHash  String?

  accounts      Account[]
  sessions      Session[]
  brands        Brand[]
  subscription  Subscription?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Brand {
  id      String @id @default(cuid())
  userId  String
  name    String
  handle  String?
  logoUrl String?
  niche   String?
  config  Json

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  projects Project[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

model Project {
  id          String @id @default(cuid())
  brandId     String
  name        String
  description String?

  brand Brand  @relation(fields: [brandId], references: [id], onDelete: Cascade)
  posts Post[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([brandId])
}

model Post {
  id        String     @id @default(cuid())
  projectId String
  title     String
  slides    Json
  tags      String[]
  hashtags  String?
  status    PostStatus @default(DRAFT)

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([projectId])
}

model Subscription {
  id                    String             @id @default(cuid())
  userId                String             @unique
  stripeCustomerId      String             @unique
  stripeSubscriptionId  String?            @unique
  stripePriceId         String?
  plan                  Plan               @default(FREE)
  status                SubscriptionStatus @default(ACTIVE)
  aiGenerationsUsed     Int                @default(0)
  exportsUsed           Int                @default(0)
  usagePeriodStart      DateTime           @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum PostStatus {
  DRAFT
  READY
  EXPORTED
  ARCHIVED
}

enum Plan {
  FREE
  PRO
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  INCOMPLETE
}
```

## Step 3: Add Shared TS Types
Create `src/types/index.ts` with:
- `Slide`
- `BrandConfig` (colors/fonts/cardStyle)
- `ReelBranding`
- `PLAN_LIMITS`

Keep `Post.slides` and `Brand.config` aligned with these interfaces.

## Step 4: Add Prisma Singleton
Create `src/lib/db.ts` using global singleton pattern to prevent hot-reload client duplication.

## Step 5: Add Seed
Create `prisma/seed.ts` that creates:
- demo user
- one demo brand with default config
- one project
- one post with 4-5 demo slides

Add `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

## Step 6: Migrate
Run:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

## Done Criteria
- [ ] Migration runs successfully
- [ ] Tables exist for auth + business + subscription models
- [ ] Multi-brand per user works
- [ ] Projects belong to brands
- [ ] Posts belong to projects and store slides in JSON
- [ ] Seed creates usable demo records
