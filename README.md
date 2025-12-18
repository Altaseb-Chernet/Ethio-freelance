# Ethio-Freelance

Ethio-Freelance is a modern, local-first freelance marketplace built with the MERN stack (MongoDB, Express, React, Node). It connects Ethiopian freelancers and clients with an intuitive interface, secure authentication, project and milestone management, and extensible payment and notification hooks.

Why this project
- Local-first: Designed for the Ethiopian freelance ecosystem with localized defaults and currency-ready hooks.
- Full-stack example: Demonstrates a production-like MERN architecture, authentication, role-based features, and deployment-ready scripts.
- Extensible: Easy to add payments, chat, escrow, and localization.

Table of Contents
- Overview
- Key features
- Tech stack
- Quickstart (Local development)
- Environment variables
- Running the app
- Deployment notes
- Contributing
- License
- Contact

Overview
Ethio-Freelance enables clients to post projects, receive proposals from freelancers, and manage work via milestones. Freelancers create profiles, bid on projects, communicate with clients, and deliver work. The repository contains two main parts:
- /backend — Node.js + Express API, MongoDB data models, authentication, authorization, and business logic
- /frontend — React application (create-react-app or Vite), UI components, pages for projects, profiles, and dashboards

Key features
- Secure authentication (JWT) and role-based access (client / freelancer / admin)
- Project posting, bidding/proposals, and milestone management
- User profiles and portfolio sections
- Basic notifications / activity feed
- Admin panel for managing users/projects
- Extensible payment integration points (Stripe/Flutterwave/etc.)

Tech stack
- Frontend: React, React Router, Axios, Tailwind/CSS (or your preferred UI lib)
- Backend: Node.js, Express, Mongoose (MongoDB)
- Database: MongoDB (Atlas or local)
- Auth: JWT, password hashing (bcrypt)
- Dev tools: nodemon, concurrently, eslint, prettier
- Deployment: Vercel/Netlify for frontend, Render/Heroku/DigitalOcean for backend, MongoDB Atlas for database

Quickstart (Local development)

Prerequisites
- Node.js (>= 16)
- npm or yarn
- MongoDB (local or an Atlas cluster)

Clone
git clone https://github.com/Altaseb-Chernet/Ethio-freelance.git
cd Ethio-freelance

Backend setup
cd backend
cp .env.example .env
npm install
npm run dev
# Backend should be available at http://localhost:5000 (or the port you set)

Frontend setup
cd ../frontend
cp .env.example .env
npm install
npm run start
# Frontend should be available at http://localhost:3000

Environment variables (example)
Backend (.env)
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/ethio-freelance?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
PORT=5000
CLIENT_URL=http://localhost:3000
# Optional: STRIPE_SECRET_KEY=...

Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CLIENT_URL=http://localhost:3000

Running the app
- Start backend: (from /backend) npm run dev
- Start frontend: (from /frontend) npm start
- To run both concurrently (if a root script exists): npm run dev:all or use concurrently

Testing
- If tests are configured: run npm test in respective packages
- Add unit and integration tests for critical endpoints and components

Deployment notes
- Use MongoDB Atlas for production databases.
- Deploy backend to Render, Heroku, or a container platform; set environment variables there.
- Deploy frontend to Vercel, Netlify, or similar, pointing API calls to the backend URL.
- For production, set secure JWT_SECRET and enable HTTPS. Use a payment provider supported in Ethiopia (Stripe, Flutterwave, etc.) and configure webhooks.

Security & privacy
- Keep JWT_SECRET and DB credentials out of source control.
- Sanitize inputs and validate both client and server-side.
- Add rate limiting and CORS restrictions as needed.

Contributing
Contributions are welcome! Suggested flow:
1. Fork the repository
2. Create a feature branch (git checkout -b feat/my-feature)
3. Commit changes with clear messages
4. Open a pull request explaining the change
Please follow the code style and add tests for new logic.


License
MIT — see LICENSE file for details.

Contact
Project maintained by Altaseb-Chernet. Open an issue or pull request for improvements or questions.


