# 3D Flight Tracker

A flight tracking application that provides a 3D visualization of a flight with detailed information, built using React, Mapbox GL, and Node.js.

![Flight Tracker Demo](demo.gif)

## Features

- Comprehensive flight details including:
  - Live position tracking
  - Flight progress
  - Departure and arrival information
  - Aircraft details
  - Speed, altitude, and distance metrics
- Responsive design that works on both desktop and mobile devices
- Save favorite flights for quick access
- Support for multiple flight states (in-progress, upcoming, landed)
- Detailed time calculations across different time zones
- Interactive search functionality with flight number validation

## Tech Stack

### Frontend
- React with TypeScript
- Mapbox GL for 3D globe visualization
- React Router for navigation
- Semantic UI React for UI components
- Axios for API communication
- Local Storage for saving favorite flights

### Backend
- Node.js with Express
- TypeScript
- AeroAPI integration for flight data
- RESTful API architecture
- Environment-based configuration

## Prerequisites

Before you begin, ensure you have the following:
- Node.js (v14 or higher)
- npm or yarn
- AeroAPI key from FlightAware
- Mapbox GL API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/3d-flight-tracker.git
cd 3d-flight-tracker
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Create environment files:

Frontend (.env):
```
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_API_URL=http://localhost:3001/api
```

Backend (.env):
```
AERO_API_KEY=your_aero_api_key
PORT=3001
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

## API Endpoints

- `GET /api/flights/:flightNum` - Get flight information by flight number

## Project Structure

```
3d-flight-tracker/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── types/
│   └── public/
└── backend/
    ├── src/
    │   ├── controllers/
    │   ├── routes/
    │   ├── utils/
    │   └── types/
    └── tests/
```

