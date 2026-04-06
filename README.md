# 🛡️ SheSafe — Women's Safety Companion

> A MERN stack hackathon project for **SDG 5: Gender Equality** and **SDG 11: Sustainable Cities & Communities**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🚨 **SOS System** | One-tap SOS with 5-second cancel window, GPS tracking, simulated SMS to contacts |
| 🧭 **Trip Tracking** | Share journeys with ETA — auto-alert if overdue by 10+ minutes |
| 🚕 **Ride Logging** | Log vehicle details and share with emergency contacts |
| 📍 **Community Alerts** | Crowdsourced danger map with Leaflet, votes, and real-time updates |
| 🤝 **Buddy System** | Match with travel companions on similar routes + live chat |
| 🕵️ **Discreet Mode** | Fake calculator UI — enter `1234=` to unlock the real app |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongod`)

### 1. Clone / Extract the project
```bash
cd shesafe
```

### 2. Install all dependencies
```bash
npm install          # installs concurrently
npm run install:all  # installs server + client deps
```

### 3. Configure environment
The server `.env` is pre-configured for local use:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/shesafe
JWT_SECRET=shesafe_super_secret_jwt_key_2024
CLIENT_URL=http://localhost:3000
```

### 4. Seed the database
```bash
npm run seed
```
This creates:
- 3 demo users with emergency contacts
- 5 community alerts around Bangalore
- Sample trips and rides

### 5. Run the app
```bash
npm start
```
Or run separately:
```bash
# Terminal 1
npm run dev:server   # Backend on :5000

# Terminal 2
npm run dev:client   # Frontend on :3000
```

### 6. Open in browser
```
http://localhost:3000
```

---

## 🎯 Demo Credentials

```
Email:    priya@shesafe.com
Password: demo1234
```

Or click **"Fill Demo Credentials"** on the login page.

---

## 🎭 3-Minute Demo Script

### 1. Login (10s)
- Open app → click "Fill Demo Credentials" → Sign In

### 2. SOS Demo (30s)
- Tap the **red 🆘 SOS button** (bottom right)
- Watch the **5-second countdown** modal
- See the **SOS Active Bar** appear at top
- Click the tracking link to open `/track/:id` in a new tab
- Show real-time GPS tracking on Leaflet map
- Click **"I'm Safe ✓"** to resolve

### 3. Community Alerts Map (30s)
- Go to **📍 Alerts** tab
- Show 5 pre-seeded danger zones on the map
- Click **"🎭 Simulate Danger"** to add a live alert
- Tap 👍 to vote on an alert

### 4. Trip Tracking (20s)
- Go to **🧭 Trips** → "+ New Trip"
- Enter destination + ETA (2 min from now)
- Show the active trip card on Home page
- Click **"✅ Mark Me Safe"**

### 5. Ride Log (15s)
- Go to **🚕 Rides** → "+ Log Ride"
- Fill vehicle number, type, route
- Show it was "shared" with emergency contacts

### 6. Buddy System (20s)
- Go to **🤝 Buddy** → "+ Request Buddy"
- Post a route request
- Open a second browser tab, login as `aisha@shesafe.com`
- Post same route → instant match + chat opens

### 7. Discreet Mode (15s)
- Visit `/discreet`
- Show the working calculator UI
- Type `1234=` → app unlocks to login page

---

## 🗂️ Project Structure

```
shesafe/
├── server/
│   ├── config/
│   │   └── seed.js              # Database seeder
│   ├── controllers/
│   │   ├── authController.js    # JWT auth
│   │   ├── sosController.js     # SOS trigger & tracking
│   │   ├── tripController.js    # Trip management
│   │   └── featureControllers.js# Rides, alerts, buddy, messages
│   ├── middleware/
│   │   └── auth.js              # JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── EmergencyContact.js
│   │   ├── SOSLog.js
│   │   └── index.js             # Trip, Ride, Alert, BuddyMatch, Message
│   ├── routes/                  # Express routers
│   ├── socket/
│   │   └── socketHandler.js     # Socket.IO events
│   ├── server.js
│   └── .env
│
└── client/src/
    ├── context/
    │   ├── AuthContext.js       # JWT auth state
    │   └── SOSContext.js        # Global SOS state + countdown
    ├── services/
    │   ├── api.js               # Axios API layer
    │   └── socket.js            # Socket.IO singleton
    ├── components/
    │   ├── SOSButton.js         # Floating SOS button
    │   ├── SOSCountdownModal.js # 5-sec cancel modal
    │   ├── SOSActiveBar.js      # Active SOS top bar
    │   ├── BottomNav.js         # Navigation
    │   ├── MapComponent.js      # Leaflet map
    │   ├── ChatWindow.js        # Socket.IO buddy chat
    │   └── AlertPanel.js        # Simulated SMS inbox
    └── pages/
        ├── Home.js              # Dashboard + safety score
        ├── Trips.js             # Trip tracking
        ├── Rides.js             # Ride logging
        ├── CommunityAlerts.js   # Alert map
        ├── BuddySystem.js       # Buddy matching
        ├── TrackSOS.js          # Public tracking page
        ├── DiscreetMode.js      # Fake calculator
        ├── Contacts.js          # Emergency contacts
        ├── Login.js
        └── Register.js
```

---

## 🔧 Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, Socket.IO, JWT
- **Frontend**: React 18, React Router v6, Leaflet.js (OpenStreetMap — no API key!)
- **Real-time**: Socket.IO (live SOS tracking, buddy chat, alert notifications)
- **Simulation**: All SMS/calls stored in MongoDB and shown in the in-app inbox

---

## 📡 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/sos/trigger` | Trigger SOS |
| GET | `/api/sos/track/:id` | Public tracking (no auth) |
| PUT | `/api/sos/:id/resolve` | Resolve SOS |
| POST | `/api/trips/start` | Start trip |
| PUT | `/api/trips/:id/safe` | Mark trip safe |
| POST | `/api/rides` | Log ride |
| GET/POST | `/api/alerts` | Community alerts |
| PUT | `/api/alerts/:id/vote` | Vote on alert |
| GET | `/api/alerts/safety-score` | Get area safety score |
| POST | `/api/buddy/request` | Request/match buddy |
| GET | `/api/messages/:roomId` | Chat history |
| GET/POST | `/api/contacts` | Emergency contacts |
| GET | `/api/contacts/inbox` | Simulated SMS inbox |

---

## 🌐 Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| `sos:triggered` | Server → All | New SOS activated |
| `sos:location:{id}` | Server → Room | Live location update |
| `sos:resolved:{id}` | Server → Room | SOS resolved |
| `trip:overdue` | Server → All | Trip overdue alert |
| `alert:new` | Server → All | New community alert |
| `buddy:matched` | Server → All | Buddy match found |
| `chat:message` | Bidirectional | Buddy chat messages |

---

*Built with ❤️ for women's safety. SDG 5 · SDG 11*
