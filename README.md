🚀 NexusAI - AI Tool Discovery Platform
Discover, explore, and leverage the most powerful AI tools available.

StatusTechDB

📖 About
NexusAI is an AI tool discovery platform that connects users with powerful artificial intelligence solutions. Browse 500+ curated tools, read reviews, and find the perfect AI for your needs.

Mission: Democratize access to AI technology through a comprehensive, user-friendly directory.

✨ Key Features
User Features

✅ User authentication (register/login)

✅ Browse 500+ AI tools

✅ Search & filter by category

✅ Read/write reviews

✅ Save favorites

✅ View trending tools

Admin Features

✅ Manage tools & users

✅ Moderate reviews

✅ View analytics

✅ Ban/unban users

Technical

✅ Responsive design (mobile, tablet, desktop)

✅ Dark theme UI

✅ Live Server for development

✅ 56 API endpoints

🛠️ Tech Stack
Layer	Technology
Frontend	HTML5, CSS3, JavaScript (ES6+)
Backend	Node.js, Express.js
Database	MongoDB
Auth	JWT, Bcrypt
Dev	Live Server, VS Code
📁 Project Structure
text
frontend/
├── index.html              # Home
├── login.html              # Login
├── register.html           # Register
├── tools-listing.html      # Browse tools
├── tool-detail.html        # Tool page
├── trending.html           # Trending
├── profile.html            # User profile
├── admin-dashboard.html    # Admin panel
└── js/
    ├── api.js             # 56 endpoints
    ├── app.js             # Logic
    └── auth.js            # Auth functions
🚀 Quick Start
Frontend Only (Live Server)
bash
# 1. Install Live Server in VS Code
# Extensions → Search "Live Server" → Install

# 2. Open with Live Server
# Right-click index.html → "Open with Live Server"

# 3. Browser opens at localhost:5500
# Edit → Save → Auto-reload! ⚡
Full Stack Setup
bash
# Backend
cd backend
npm install
npm start              # Runs on localhost:5000

# Frontend (in VS Code)
# Right-click index.html → "Open with Live Server"
# Frontend runs on localhost:5500
💻 Usage
bash
# Test in browser console (F12):
typeof toolsAPI           # Returns "object"
updateNavbar()            # Works without errors
await toolsAPI.getAll()   # Returns tools (if backend running)
📚 API Endpoints (56 Total)
Module	Count	Examples
Auth	7	register, login, logout, verify
Users	8	profile, favorites, reviews
Tools	19	list, search, trending, filter
Reviews	9	create, read, helpful, report
Categories	5	list, create, update, delete
Admin	13	dashboard, manage, analytics
Base URL: http://localhost:5000/api

🔗 Pages & Routes
Page	URL	Description
Home	/	Landing page
Login	/login.html	User login
Register	/register.html	User signup
Tools	/tools-listing.html	Browse tools
Tool Detail	/tool-detail.html?id=XXX	Tool page
Trending	/trending.html	Popular tools
Profile	/profile.html	User account
Admin	/admin-dashboard.html	Admin panel
🔐 Authentication
JWT Tokens (Access: 15 min, Refresh: 7 days)

Bcrypt password hashing

Roles: User, Admin

Permissions: Based on role

📦 Database Schema
javascript
// Users
{ name, email, password, avatar, role, status, createdAt }

// Tools
{ name, description, category, logo, rating, reviewCount, status }

// Reviews
{ toolId, userId, rating, title, content, helpfulCount }

// Categories
{ name, description, icon, toolCount }
🧪 Testing
bash
# Manual Test
1. Right-click index.html → "Open with Live Server"
2. Open DevTools (F12)
3. Run: typeof toolsAPI
4. Click navbar links → Check navigation
5. Test responsive (Ctrl+Shift+M)
🐛 Troubleshooting
Problem	Solution
"Cannot GET /login.html"	Move all HTML files to frontend/ root
Live Server not reloading	Restart it or clear cache (Ctrl+Shift+Del)
toolsAPI undefined	Check api.js is loaded in HTML
MongoDB connection error	Verify .env connection string
🚀 Deployment
Frontend: Vercel, Netlify, GitHub Pages
Backend: Heroku, Railway, Render
Database: MongoDB Atlas

📊 Project Stats
Pages: 8 (complete)

API Endpoints: 56 (documented)

Collections: 4 (designed)

Lines of Code: 5000+ (frontend)

Status: In Development

📝 Contributing
bash
# Fork → Clone → Branch → Commit → Push → PR

git checkout -b feature/your-feature
git commit -m "feat: description"
git push origin feature/your-feature