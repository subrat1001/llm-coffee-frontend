# LLM_COFFEE Project Context

## Project Name

LLM_COFFEE

---

# Goal

Build a production-ready AI assistant similar to ChatGPT with:

- Authentication
- JWT
- PostgreSQL
- RAG
- File Upload
- Ollama
- Web Search
- AI Router
- Chat History
- Modern React Frontend

---

# Backend

Framework

- FastAPI

Database

- PostgreSQL

ORM

- SQLAlchemy

Authentication

- JWT

AI

- Ollama

Embeddings

- Sentence Transformers

Vector Search

- FAISS

Web Search

- Tavily

Document Parsing

- PDF
- DOCX
- TXT

Current Status

✅ Login

✅ Register

✅ JWT

✅ Chat API

✅ Upload API

✅ Vector Database

✅ RAG

✅ AI Router

---

Backend Structure

backend/

app/

api/

services/

models/

schemas/

database/

core/

utils/

main.py

---

Current Features

Authentication

- Register
- Login
- JWT

Chat

- Chat endpoint

AI Router

Returns

- LLM
- WEB
- RAG
- BOTH

Document Upload

Stores embeddings into FAISS.

History

Stores chat history inside PostgreSQL.

---

Frontend

Framework

React + Vite

Language

JavaScript

Styling

TailwindCSS

HTTP

Axios

Routing

React Router

Animation

Framer Motion

Markdown

React Markdown

Icons

React Icons

---

Current Frontend Structure

src/

api/

components/

pages/

layouts/

routes/

context/

hooks/

utils/

---

Completed

✅ Tailwind

✅ Axios

✅ API folder

✅ Auth Context

---

Next Tasks

Authentication

- Login Page
- Register Page
- JWT Storage
- Logout
- Protected Routes

Dashboard

- Sidebar

- Navbar

- Chat Window

- Message Bubble

- Input Box

Backend Integration

- Chat API

- Upload API

- History API

Advanced

- Markdown

- Streaming

- Typing Indicator

- Dark Theme

- Settings

---

Coding Rules

Always:

- Use reusable components.

- Use functional components.

- Use React Hooks.

- Keep code modular.

- Never duplicate code.

- Keep API calls inside src/api.

- Keep state inside Context when shared.

- Use async/await.

- Handle errors properly.

- Write production-ready code.

- Do not break existing backend APIs.

---

Backend API

Before modifying authentication, ALWAYS inspect the backend route implementation.

Never assume:

- JSON

or

- Form Data

Verify first.

---

Important Rule

Whenever authentication, upload, chat, or history APIs are modified,

first inspect the corresponding FastAPI endpoint before changing the frontend.

Never guess the request format.

---

Development Order

1. Authentication

2. Dashboard

3. Chat

4. Upload

5. History

6. Streaming

7. UI Polish

8. Deployment

---

Current Milestone

Authentication