# EchoGuard AI

EchoGuard AI is a full-stack safety detection prototype that combines a React/Vite front end with an Express/MongoDB back end. It evaluates acoustic metadata and location context, decides whether the situation looks threatening, and returns an action recommendation plus nearby safe places when escalation is needed.

The project is designed as a practical demo of proactive personal safety tooling: the UI presents the product story, the API runs the analysis pipeline, and the backend stores incident logs for later review.

## Highlights

- React + Vite front end with a polished, responsive product-style interface.
- Express API with MongoDB persistence for incident logging.
- Input validation with Joi on the `/analyze` endpoint.
- Rate limiting to protect the analysis route from abuse.
- CORS allowlist and health check endpoint for deployment readiness.
- Optional Google Places integration with a mock fallback for local development.
- Optional Gemini-powered safety instruction generation.

## How It Works

1. The front end collects metadata such as decibel level, frequency pattern, and coordinates.
2. The backend validates the request and compares the decibel value to a configurable threshold.
3. If the reading looks risky, the service fetches nearby safe places and requests a safety instruction.
4. Each analysis attempt is logged to MongoDB as an incident record.
5. The API returns a structured response containing the threat status, action recommendation, nearby places, and incident ID.

## Tech Stack

- Frontend: React 19, Vite, CSS
- Backend: Node.js, Express 5
- Database: MongoDB with Mongoose
- Validation: Joi
- Security: express-rate-limit, CORS allowlist, custom middleware
- External services: Google Places API, Gemini API

## Project Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
├── README_AUDIT.md
├── AUDIT_EXECUTIVE_SUMMARY.md
├── SECURITY_AUDIT_REPORT.md
├── RED_FLAGS_BEFORE_AFTER.md
├── INTEGRATION_GUIDE.md
└── SUBMISSION_CHECKLIST.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB connection string

Optional, but recommended for full feature parity:

- Google Places API key
- Gemini API key

## Setup

### 1) Install dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### 2) Configure environment variables

Create a `.env` file in `backend/` with at least:

```bash
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
DECIBEL_THRESHOLD=80
GOOGLE_PLACES_API_KEY=optional_key
GEMINI_API_KEY=optional_key
```

### 3) Start the backend

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:5000`.

### 4) Start the frontend

```bash
cd frontend
npm run dev
```

The app will typically run at `http://localhost:5173`.

If you need to point the frontend at a different backend URL, set:

```bash
VITE_API_URL=http://localhost:5000
```

## Available Scripts

### Backend

- `npm run start` - Start the API in production mode.
- `npm run dev` - Start the API with Nodemon for local development.

### Frontend

- `npm run dev` - Start the Vite development server.
- `npm run build` - Build the production frontend bundle.
- `npm run lint` - Run ESLint.
- `npm run preview` - Preview the production build locally.

## API Reference

### Health Check

`GET /health`

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-04-15T12:00:00.000Z"
}
```

### Analyze Safety Signal

`POST /analyze`

Request body:

```json
{
  "decibel": 85,
  "frequency": "high",
  "lat": 12.9716,
  "lng": 77.5946
}
```

Valid `frequency` values:

- `low`
- `mid`
- `high`
- `ultra-high`

Response shape:

```json
{
  "success": true,
  "threat": true,
  "action": "...",
  "places": [],
  "incidentId": "..."
}
```

If the Google Places API key is missing, the backend falls back to mock safe-place data so the demo still works locally.

## Security Notes

- The backend only allows configured origins through its CORS allowlist.
- `/analyze` is protected with request rate limiting.
- Request payloads are validated before analysis starts.
- Incident data is stored in MongoDB for traceability.
- The repository includes audit and remediation documentation for security-focused review.

## Documentation

If you are working through the audit or submission flow, start here:

- [README_AUDIT.md](README_AUDIT.md)
- [AUDIT_EXECUTIVE_SUMMARY.md](AUDIT_EXECUTIVE_SUMMARY.md)
- [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md)
- [RED_FLAGS_BEFORE_AFTER.md](RED_FLAGS_BEFORE_AFTER.md)
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md)

## Troubleshooting

- If the backend fails on startup, verify `MONGO_URI` is set and reachable.
- If the frontend cannot reach the API, confirm `VITE_API_URL` and `FRONTEND_URL` match your local ports.
- If place lookups return generic results, check whether `GOOGLE_PLACES_API_KEY` is configured.
- If you see validation errors, make sure the request body matches the `/analyze` schema exactly.

## License

No explicit license is provided in this repository.
