import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LoginSignup from './Pages/LoginSignup/LoginSignup';
import LandingPage from './Pages/LoginSignup/LandingPage/LandingPage';
import HomePage from './Pages/HomePage/HomePage';
import ProfilePage from './Pages/Profile/ProfilePage';
import TasksPage from './Pages/Tasks/TasksPage';
import FriendsPage from './Pages/Friends/FriendsPage';
import SettingsPage from './Pages/Settings/SettingsPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<LoginSignup />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;