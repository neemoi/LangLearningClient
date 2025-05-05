import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import MainPage from './pages/MainPage/MainPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage/ForgotPasswordPage';
import PasswordResetPage from './components/auth/PasswordResetPage/PasswordResetPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import AdminPage from './pages/AdminPage/AdminPage';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import UsersManagement from './components/admin/users/UsersManagement';
import LessonsManagement from './components/admin/lessons/LessonsManagement';
import LessonDetail from './components/admin/lessons/details/LessonDetail';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="lessons" element={<LessonsManagement />} />
          <Route path="/admin/lessons/:id" element={<LessonDetail />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
