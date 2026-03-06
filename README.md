# NPU-Piggy 🐷💰

*For everyone who checks their bank account and needs a moment. AI-powered budget tracking, fully on-device.*

---

## Inspiration & Vision
We've all had that moment: checking the bank account at the end of the month and it becomes a crime scene investigation. Who authorized this? When did this happen? For young adults wanting to save their first bucket of gold but occasionally shopping online at 2 AM, budgeting isn't a knowledge problem—it's a visibility problem!

Many existing budget apps attempt to solve this by asking you to sync your bank and hand over your most sensitive data to cloud servers. But your transaction history is more than just numbers; it reveals where you eat, how you live, and what you’re going through. That data is profoundly personal and should never leave your device. 

That is why we built **NPU-Piggy**, a fully on-device AI budget planner that turns a snapshot of a receipt into structured financial insight with **zero cloud dependency**. No accounts. No clouds. No sharing your privacy with a third party.

## What It Does
NPU-Piggy is an end-to-end expense tracking tool that runs entirely on your local machine. You scan any receipt—physical or digital—and NPU-Piggy will:
* **Extract** the text using on-device OCR.
* **Parse** the text into structured JSON data using a local Large Language Model (LLM).
* **Store** your expenses securely in React local storage.
* **Visualize** your spending patterns on a clean, personal dashboard.
* **Chat** with you through an interactive AI assistant to provide personalized budget planning feedback and suggestions.

## Technical Architecture & How We Built It
Our pipeline operates in four main stages, keeping privacy intact at every step:

1. **Capture**: Users photograph a receipt via their PC camera.
2. **OCR Extraction**: We utilize EasyOCR, uniquely optimized and deployed on-device via the **Qualcomm AI Hub**. The pipeline runs the detector on the **NPU** and the recognizer on the **CPU**, swiftly extracting raw text from the receipt image.
3. **LLM Parsing**: The raw OCR text is passed to a local **Mistral 7B** model via **Ollama**, orchestrated with **LangChain**. A structured prompt with explicit rules converts the messy text into validated JSON, backed by a Pydantic schema. Built-in retry logic and fallback mechanisms handle any malformed or incomplete responses gracefully.
4. **Storage & Insights**: The parsed expense data is stored locally using React local storage—no external database servers required. The React frontend renders a dynamic spending dashboard with interactive visualizations and hosts the local LLM chat interface for budget planning.

### Built With
* **Frontend**: React 18, Vite, Recharts, Lucide Icons
* **Backend**: Python, Flask, Flask-CORS, Pillow
* **AI/ML Models**: Mistral 7B (via Ollama), EasyOCR
* **Runtime**: ONNX Runtime
* **Hardware**: Qualcomm NPU, CPU

## Quick Start

### Prerequisites
- Node.js 16+ (for frontend)
- Python 3.8+ (for backend)

### Option 1: Quick Start Script

**Windows:**
```bash
start.bat
```

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup

#### Terminal 1 - Backend Server
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python server.py
```

Backend runs at: `http://localhost:5000`

#### Terminal 2 - Frontend Server
```bash
cd GUI/npu-piggy-frontend
npm install
npm run dev
```

Frontend opens at: `http://localhost:3000`

## Project Structure

```
NPU_Piggy/
├── GUI/
│   └── npu-piggy-frontend/    # React frontend
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── package.json
│       └── vite.config.js
├── backend/                    # Python Flask backend
│   ├── server.py              # Main server with mock OCR/LLM
│   ├── requirements.txt
│   └── README.md
├── SETUP.md                    # Detailed setup guide
└── README.md                   # This file
```

## Features

### ✨ Frontend (React)
- 📸 **Receipt Capture**: Camera or image upload
- 📊 **Dashboard**: Analytics with charts and statistics
- 💬 **AI Chat Assistant**: Get budget advice
- 📜 **Expense History**: Track all transactions
- 💾 **Local Storage**: All data stays on your device

### ⚙️ Backend (Python/Flask)
- `/api/process_receipt` - Process receipt image (OCR + LLM)
- `/api/chat` - Get budget advice
- `/api/health` - Server health check
- Currently uses hardcoded mocks for OCR and LLM (ready for integration)

## Development

### To integrate real services:

1. **EasyOCR** - Replace mock in `backend/server.py::mock_ocr_extraction()`
2. **Mistral 7B + Ollama** - Replace mock in `backend/server.py::mock_llm_parsing()`
3. **Database** - Replace localStorage with backend database

See [SETUP.md](SETUP.md) for detailed integration instructions.

## API Documentation

Full API endpoint documentation available in [backend/README.md](backend/README.md)

### Key Endpoints:

**POST /api/process_receipt**
- Input: Receipt image (multipart/form-data)
- Output: OCR text + structured JSON data

**POST /api/chat**
- Input: User message + expense history
- Output: Budget advice response

**GET /api/health**
- Output: Server status

## How It Works

### Receipt Processing Flow
```
User captures/uploads receipt image
            ↓
Frontend sends to /api/process_receipt
            ↓
Backend processes through OCR → LLM
            ↓
Returns structured JSON
            ↓
React displays and stores in localStorage
```

### Current State (Mocked Data)
- OCR: Returns simulated Walmart receipt text
- LLM: Parses into structured expense JSON
- Chat: Provides contextual budget advice

### When Integrated (Real Implementation)
- OCR: Uses EasyOCR for actual image processing
- LLM: Uses Mistral 7B via Ollama
- Chat: Full AI-powered budget assistant

## Privacy & Security

✅ **Zero Cloud Dependency**
- All data processed locally
- No external API calls for core features
- All expenses stored in browser localStorage
- No trackers or analytics

✅ **Your Data, Your Device**
- No account creation required
- No sign-up, login, or authentication needed
- No data collection
- Completely offline capable

## Troubleshooting

**Backend not starting?**
- Ensure Python 3.8+ is installed
- Try: `pip install --upgrade flask flask-cors pillow`

**Frontend can't connect to backend?**
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Restart both servers

**Image upload fails?**
- Ensure image is jpg, jpeg, png, or gif
- Check file size is under 16MB
- Verify `/uploads` folder exists in backend directory

See [SETUP.md](SETUP.md) for more troubleshooting.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
