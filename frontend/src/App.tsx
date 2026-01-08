import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PdfUpload from './PdfUpload'
import RagChat from './RagChat'

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<RagChat />} />

        {/* PDF Upload Route */}
        <Route path="/upload" element={<PdfUpload />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
