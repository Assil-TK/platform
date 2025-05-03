import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import RepoExplorer from './pages/RepoExplorer';
import EditFile from './pages/EditFile'; // Import the EditFile page
import FileContent from './pages/filecontent';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/repo-explorer" element={<RepoExplorer />} />
        <Route path="/edit-file" element={<EditFile />} /> {/* Add the EditFile route */}
        <Route path="/filecontent" element={<FileContent />} /> {/* ✅ Route added */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
