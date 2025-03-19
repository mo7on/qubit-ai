# Qubit AI - Smart Technical Assistant 🤖

![Project Banner](https://via.placeholder.com/1200x600.png?text=Qubit+AI+-+Real-time+Technical+Problem+Solving)

A Next.js-powered application providing AI-assisted technical troubleshooting with contextual knowledge base integration.

## 🚀 Key Features
- **Real-time AI Chat** powered by Gemini API
- **Technical Knowledge Base** with curated articles <mcsymbol name="mockArticles" filename="mock-articles.ts" path="src/data/mock-articles.ts" startline="2" type="function"></mcsymbol>
- **Multi-modal Support**:
  - Image upload & analysis <mcsymbol name="ImageUploadModal" filename="ImageUploadModal.tsx" path="src/components/chat/ImageUploadModal.tsx" startline="15" type="class"></mcsymbol>
  - Markdown-rich responses <mcsymbol name="MarkdownRenderer" filename="MarkdownRenderer.tsx" path="src/components/MarkdownRenderer.tsx" startline="0" type="function"></mcsymbol>
- **Contextual Problem Solving**:
  - Dynamic article recommendations <mcsymbol name="ChatContext" filename="ChatContext.tsx" path="src/components/chat/ChatContext.tsx" startline="5" type="class"></mcsymbol>
  - Step-by-step troubleshooting guides
- **Enterprise-grade UI** with Shadcn components <mcsymbol name="AlertDialog" filename="alert-dialog.tsx" path="src/components/ui/alert-dialog.tsx" startline="97" type="class"></mcsymbol>

## 🛠 Tech Stack
**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Radix UI + Shadcn Component Library
- Lucide React Icons

**Backend** <mcfolder name="backend" path="backend"></mcfolder>
- Node.js + Express
- Supabase
- Multer for file uploads <mcsymbol name="createProblem" filename="problem.controller.js" path="backend/src/controllers/problem.controller.js" startline="12" type="function"></mcsymbol>
- CORS & Security Middlewares

**AI Services**
- Google Gemini Integration <mcsymbol name="generateResponse" filename="ai-integration.service.js" path="backend/src/services/ai-integration.service.js" startline="60" type="function"></mcsymbol>
- Contextual Prompt Engineering
- Multi-modal Processing

## ⚙️ Installation
1. Clone repository:
```bash
git clone https://github.com/your-org/qubit-ai.git
cd qubit-ai
```

2. Install dependencies:
```bash
npm install
cd backend
npm install
```

3. Set up environment variables:
```bash
# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000

# Backend .env
GEMINI_API_KEY=your_google_api_key
UPLOAD_DIR=./uploads
```

## 🖥 Running the Application
Start development servers:
```bash
# Frontend
npm run dev

# Backend (from /backend)
npm run server:dev
```

Access the application at `http://localhost:3000`

## 📂 Project Structure
```
qubit-ai/
├── src/
│   ├── app/               # Next.js route handlers
│   ├── components/        # UI components library
│   ├── data/              # Mock datasets
│   └── types/             # TypeScript definitions
├── backend/
│   ├── src/
│   │   ├── controllers/   # API route handlers
│   │   └── services/      # Business logic
└── public/                # Static assets
```

## 🤝 Contributing
1. Create feature branch:
```bash
git checkout -b feature/your-feature
```
2. Commit changes following [Conventional Commits](https://www.conventionalcommits.org)
3. Open a PR with detailed description of changes

## 📄 License
MIT License - See [LICENSE](LICENSE) for details