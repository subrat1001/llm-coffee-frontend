# PROJECT_STRUCTURE.md

# LLM_COFFEE Project Structure

```
LLM_COFFEE/
│
├── backend/
│   │
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   └── ...
│   │
│   ├── uploads/
│   ├── vector_store/
│   ├── main.py
│   └── requirements.txt
│
├── llm-coffee-frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   │
│   │   ├── api/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   │
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   ├── Navbar/
│   │   │   ├── Sidebar/
│   │   │   ├── Upload/
│   │   │   └── Common/
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   │
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── styles/
│   │   │
│   │   ├── utils/
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── README.md
├── MAKER.md
├── PROJECT_STRUCTURE.md
└── CHANGELOG.md
```

---

# Backend Modules

- Authentication
- JWT
- PostgreSQL
- SQLAlchemy
- Ollama
- RAG
- FAISS
- Embeddings
- Chat History
- Tavily Search
- AI Router
- File Upload

---

# Frontend Modules

- React
- Vite
- TailwindCSS
- Axios
- React Router
- Auth Context
- Dashboard
- Chat UI
- Upload UI
- Markdown Rendering
- Streaming Response

---

# Development Status

## Backend

- Authentication ✅
- JWT ✅
- Chat API ✅
- Upload API ✅
- AI Router ✅
- RAG ✅
- History ✅

## Frontend

- Project Setup ✅
- Tailwind Setup ✅
- Axios Setup ✅
- Auth Context ✅
- Login Page 🚧
- Register Page ⏳
- Dashboard ⏳
- Chat UI ⏳
- Upload UI ⏳
- History UI ⏳

---

# Notes

Whenever a new folder, module, or major feature is added, update this file so the project structure always reflects the current state of the project.