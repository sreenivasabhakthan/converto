# Converto® — Free Online Document Converter

> A free, high-performance, no-login file converter supporting 50+ formats across documents, images, and data files.

![Converto Banner](https://img.shields.io/badge/Converto-Free%20File%20Converter-8b5cf6?style=for-the-badge&logo=files&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

---

## ✨ Features

- 🚀 **Instant Conversion** — Convert files in seconds, no waiting
- 🔒 **No Sign-up Required** — 100% free, no account needed
- 📁 **50+ Formats** — Documents, images, spreadsheets, and data files
- 🖼️ **Drag & Drop UI** — Intuitive, modern interface
- 🔥 **Auto Format Detection** — Detects your file type and shows only compatible outputs
- 🧹 **Privacy First** — Files are deleted from the server immediately after conversion
- 📱 **Responsive Design** — Works on desktop and mobile

---

## 🗂️ Supported Conversions

| Category     | Input Formats                        | Output Formats                   |
|--------------|--------------------------------------|----------------------------------|
| 🖼️ Images    | JPG, PNG, WEBP, GIF, BMP, TIFF       | JPG, PNG, WEBP, TIFF, PDF        |
| 📄 Documents | DOCX                                 | TXT, HTML                        |
| 📝 Text      | TXT                                  | HTML                             |
| 📊 Data      | JSON, CSV, XML, YAML                 | JSON, CSV, XML, YAML             |
| 📑 PDF       | PDF                                  | TXT                              |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with **TypeScript**
- **Vite** — lightning-fast dev server & bundler
- **Vanilla CSS** — custom design system with CSS variables
- **Lucide React** — icon library
- **Axios** — HTTP client

### Backend
- **Node.js** with **TypeScript**
- **Express 5** — REST API framework
- **Multer** — file upload handling
- **Sharp** — image processing & conversion
- **Mammoth** — DOCX → HTML/TXT extraction
- **pdf-lib** — PDF creation & text extraction
- **Nodemon + ts-node** — hot-reloading dev server

---

## 📁 Project Structure

```
converto/
├── client/                  # React frontend (Vite)
│   ├── public/
│   │   └── favicon.svg      # Custom "C" favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConverterBox.tsx   # Main upload/convert UI
│   │   │   ├── Marquee.tsx        # Scrolling format marquee
│   │   │   └── Navbar.tsx         # Navigation bar
│   │   ├── App.tsx          # Page layout & sections
│   │   ├── index.css        # Design system & all styles
│   │   └── main.tsx         # Entry point
│   ├── index.html           # HTML with SEO meta tags
│   └── vite.config.ts
│
└── server/                  # Express backend (Node.js)
    ├── uploads/             # Temp upload directory (auto-cleaned)
    ├── converted/           # Temp output directory (auto-cleaned)
    └── src/
        ├── routes/
        │   ├── upload.ts    # POST /api/upload
        │   ├── convert.ts   # POST /api/convert
        │   └── download.ts  # GET  /api/download/:filename
        ├── middleware/
        │   └── upload.ts    # Multer config & file validation
        ├── services/
        │   └── converter.ts # All conversion logic
        └── index.ts         # Express app entry point
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ 
- **npm** v9+

### 1. Clone the repository

```bash
git clone https://github.com/sreenivasabhakthan/converto.git
cd converto
```

### 2. Install dependencies

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### 3. Start the development servers

**Backend** (runs on `http://localhost:5000`):
```bash
cd server
npm run dev
```

**Frontend** (runs on `http://localhost:5173`):
```bash
cd client
npm run dev
```

### 4. Open in browser

Visit **[http://localhost:5173](http://localhost:5173)** 🎉

---

## 🔌 API Endpoints

| Method | Endpoint                      | Description                          |
|--------|-------------------------------|--------------------------------------|
| `POST` | `/api/upload`                 | Upload a file (multipart/form-data)  |
| `POST` | `/api/convert`                | Convert uploaded file to new format  |
| `GET`  | `/api/download/:filename`     | Download the converted file          |
| `GET`  | `/api/health`                 | Health check                         |

### Upload Response
```json
{
  "success": true,
  "fileId": "uuid-string",
  "filename": "uuid.ext",
  "originalName": "myfile.png",
  "size": 204800,
  "detectedFormat": "png",
  "compatibleFormats": ["jpg", "webp", "tiff", "pdf"]
}
```

### Convert Request
```json
{
  "filename": "uuid.png",
  "outputFormat": "pdf"
}
```

### Convert Response
```json
{
  "success": true,
  "convertedFilename": "uuid_converted.pdf",
  "downloadUrl": "/api/download/uuid_converted.pdf"
}
```

---

## ⚙️ Environment Variables

The backend uses sensible defaults and requires no additional `.env` configuration for local development.

| Variable | Default | Description          |
|----------|---------|----------------------|
| `PORT`   | `5000`  | Backend server port  |

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Sreenivasa Bhakthan**  
GitHub: [@sreenivasabhakthan](https://github.com/sreenivasabhakthan)

---

<p align="center">Built with ❤️ — <strong>Converto®</strong> — Free forever.</p>
