import { Routes, Route, Navigate } from 'react-router-dom';
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
import AlphabetLettersManagement from './components/admin/alphabet/AlphabetLettersManagement';
import FunctionsManagement from './components/admin/function/FunctionManagement';
import PronunciationManagement from './components/admin/pronunciation/PronunciationManagement';
import MainQuestionsManager from './components/admin/questions/MainQuestionsPage';
import NamesManagement from './components/admin/name/NamesManagement';
import KidLessonsManagement from './components/admin/kid-lessons/kiLessonsManagement';
import KidLessonDetail from './components/admin/kid-lessons/kiLessonDetail';
import LessonsPage from './pages/LessonsPage/LessonsPage';
import WordsPage from './pages/LessonsPage/WordsPage/WordsPage';
import PhrasesPage from './pages/LessonsPage/PhrasesPage/PhrasesPage';
import ImageTestPage from './pages/LessonsPage/Quizzes/ImageTestPage';
import MonitoringPage from './pages/LessonsPage/MonitoringPage/MonitoringPage';

        //<Route path="/lessonsVirtual/:lessonId/audio-test" element={<AudioTestPage />} />
        //<Route path="/lessonsVirtual/:lessonId/audio-image-test" element={<AudioImageTestPage />} />
        //<Route path="/lessonsVirtual/:lessonId/spelling-test" element={<SpellingTestPage />} />

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route 
          path="/lessonsVirtual" 
          element={<Navigate to="/lessonsVirtual/1" replace />} 
        />
        <Route path="/lessonsVirtual/:lessonId" element={<LessonsPage />} />
        <Route path="/lessonsVirtual/:lessonId/phrases" element={<PhrasesPage />} />
        <Route path="/lessonsVirtual/:lessonId/words" element={<WordsPage />} />
        <Route path="/lessonsVirtual/:lessonId" element={<LessonsPage />} />
        <Route path="/monitoring/:lessonId" element={<MonitoringPage />} />
        <Route path="/lessonsVirtual/:lessonId/image-test" element={<ImageTestPage />} />
        <Route path="/admin" element={<AdminPage />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="lessons" element={<LessonsManagement />} />
          <Route path="lessons/:id" element={<LessonDetail />} />
          <Route path="kid-lessons" element={<KidLessonsManagement />} />
          <Route path="kid-lessons/:id" element={<KidLessonDetail />} />
          <Route path="alphabet" element={<AlphabetLettersManagement />} />
          <Route path="functions" element={<FunctionsManagement />} />
          <Route path="functions/:functionId" element={<FunctionsManagement />} />
          <Route path="pronunciation" element={<PronunciationManagement />} />
          <Route path="questions" element={<MainQuestionsManager />} />
          <Route path="names" element={<NamesManagement />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;