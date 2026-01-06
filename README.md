# Skill Grep

**AI-powered candidate filtering for modern recruiting teams.**

Skill Grep is an intelligent recruiting tool that connects to your ATS (Applicant Tracking System) and uses conversational AI to help you build precise candidate evaluation criteria. It scores and ranks candidates based on your custom requirements, saving hours of manual resume screening.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 🔐 Authentication
- OAuth integration with **Google** and **Slack**
- Secure API key connection to your ATS

### 📋 Job Management
- View and manage all synced job listings
- Configure candidate sync settings per job:
  - **All candidates** — Sync everyone regardless of stage
  - **Specific stages** — Only sync candidates in selected pipeline stages (Phone Screen, Onsite, Offer, etc.)
  - **No sync** — Skip syncing for specific jobs
- Search and filter jobs by status (Open/Closed)

### 💬 Conversational Criteria Builder
- ChatGPT-style interface for defining ideal candidate criteria
- Quick suggestion chips for common requirements
- Intelligent parsing of natural language inputs:
  - Experience levels (e.g., "5+ years")
  - Technical skills (Python, Go, Kubernetes, etc.)
  - Location preferences (SF Bay Area, remote)
  - Background requirements (FAANG, startup experience)
  - Leadership experience

### 📝 Dynamic Prompt Generation
- Real-time prompt generation as you define criteria
- Editable prompt panel for fine-tuning
- Structured output with role context and scoring guidelines

### 📊 Candidate Results Dashboard
- Score-based candidate ranking (0-100)
- Visual filtering by match quality:
  - 🟢 **Excellent** (90+)
  - 🔵 **Strong** (75-89)
  - 🟡 **Potential** (60-74)
  - 🔴 **Weak** (<60)
- Expandable candidate cards with detailed analysis
- Skills, leadership, and background breakdowns

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/talent-lens.git
cd talent-lens

# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint |

---

## 🏗️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Language:** TypeScript
- **UI:** React 19 with inline styles (CSS-in-JS)
- **Styling:** Custom CSS variables with glass-morphism design
- **Fonts:** Geist (via `next/font`)

---

## 📁 Project Structure

```
talent-lens/
├── src/
│   └── app/
│       ├── page.tsx        # Main application component
│       ├── layout.tsx      # Root layout with fonts
│       ├── globals.css     # Global styles & CSS variables
│       └── favicon.ico
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── eslint.config.mjs
```

---

## 🎨 Design System

The application uses a dark theme with glass-morphism effects and custom CSS variables:

| Variable | Purpose |
|----------|---------|
| `--bg-primary` | Main background |
| `--bg-card` | Card backgrounds |
| `--accent-primary` | Primary green accent |
| `--accent-secondary` | Purple accent |
| `--accent-success` | Success states |
| `--accent-warning` | Warning states |
| `--accent-error` | Error states |

---

## 🔮 Roadmap

- [ ] Real ATS integrations (Greenhouse, Lever, Ashby)
- [ ] LLM integration for actual candidate scoring
- [ ] Bulk actions and CSV export
- [ ] Team collaboration features
- [ ] Email notifications and scheduling
- [ ] Custom scoring rubrics

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  Built with ❤️ for recruiters who value their time
</p>
