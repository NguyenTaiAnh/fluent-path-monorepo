# Fluent Path Monorepo

Welcome to the Fluent Path Monorepo. This repository contains the Next.js frontend applications and shared packages for the Fluent Path English learning platform. It is managed using **Yarn Workspaces**.

## 🏗 Monorepo Structure

- `apps/`: Contains all the application code (e.g., Next.js web applications).
  - `fluent-path-english-web`: The main web platform frontend.
- `packages/`: Contains shared libraries, UI components, and utilities that can be imported by the apps.
  - `courses-packages`: Shared logic and packages within the workspace.

## 🚀 Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/en/download/) (v18+)
- [Yarn](https://yarnpkg.com/)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NguyenTaiAnh/fluent-path-monorepo.git
   cd courses-monorepo
   ```

2. **Install all dependencies:**
   Since we use Yarn workspaces, running install at the root level will automatically install dependencies for all apps and packages, and wire them together.
   ```bash
   yarn install
   ```

3. **Setup Environment Variables:**
   Navigate into the web application folder and setup your `.env.local` file (Make sure to retrieve your Supabase access keys).
   ```bash
   cd apps/fluent-path-english-web
   cp .env.example .env.local
   ```

### Running for Development

To spin up the web app in development mode, run:

```bash
cd apps/fluent-path-english-web
yarn dev
```

The application should now be running on `http://localhost:3000`.

## 🔄 Monorepo Flow (How to work with it)

Yarn Workspaces linking allows code in `packages/*` to be consumed by `apps/*` directly without needing to publish them to npm.

**Working with dependencies:**
1. **Adding a package to a specific workspace (e.g., the web app):**
   ```bash
   yarn workspace fluent-path-english add <package_name>
   ```
2. **Adding a shared dependency to the entire Monorepo root:**
   ```bash
   yarn add <package_name> -W
   ```

**Committing Code:**
Always commit from the **Root** of the directory. Do not initialize separate Git repositories inside `apps/` or `packages/`.
