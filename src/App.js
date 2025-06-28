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
import ImageTestPage from './pages/LessonsPage/Quizzes/image/ImageTestPage';
import MonitoringPage from './pages/LessonsPage/MonitoringPage/MonitoringPage';
import AudioTestPage from './pages/LessonsPage/Quizzes/audio/AudioTestPage';
import AudioImageTestPage from './pages/LessonsPage/Quizzes/audioImage/AudioImageTestPage';
import SpellingTestPage from './pages/LessonsPage/Quizzes/spelling/SpellingTestPage';
import GrammarTestPage from './pages/LessonsPage/Quizzes/grammar/GrammarTestPage';
import PronunciationTestPage from './pages/LessonsPage/Quizzes/pronunciation/PronunciationTestPage';
import AdvancedTestPage from './pages/LessonsPage/Quizzes/advanced/AdvancedTestPage';
import NounsPage from './pages/NounsPage/NounsPage';
import WordsByLetterPage from './pages/NounsPage/WordsByLetter/WordsByLetterPage';
import PartsOfSpeechPage from './pages/PartsOfSpeech/PartsOfSpeechPage';
import WordsByPartOfSpeechPage from './pages/PartsOfSpeech/WordsByPartOfSpeech/WordsByPartOfSpeechPage';
import AlphabetPage from './pages/MiniLessonsPage/AlphabetPage/AlphabetPage';
import NumbersPage from './pages/MiniLessonsPage/NumbersPage/NumbersPage';
import NumbersMathPage from './pages/MiniLessonsPage/NumbersMathPage/NumbersMathPage';
import AccountingPage from './pages/MiniLessonsPage/AccountingPage/AccountingPage';
import OrdinalNumbersPage from './pages/MiniLessonsPage/OrdinalNumbersPage/OrdinalNumbersPage';
import MoneyPage from './pages/MiniLessonsPage/MoneyPage/MoneyPage';
import TimePage from './pages/MiniLessonsPage/TimePage/TimePage';
import DatesPage from './pages/MiniLessonsPage/DatesPage/DatesPage';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        <Route path="/mini-lessons/alphabet" element={<AlphabetPage />} />
        
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
        <Route path="/lessonsVirtual/:lessonId/audio-test" element={<AudioTestPage />} />
        <Route path="/lessonsVirtual/:lessonId/audio-image-test" element={<AudioImageTestPage />} />
        <Route path="/lessonsVirtual/:lessonId/spelling-test" element={<SpellingTestPage />} />
        <Route path="/lessonsVirtual/:lessonId/grammar-test" element={<GrammarTestPage />} />
        <Route path="/lessonsVirtual/:lessonId/pronunciation-test" element={<PronunciationTestPage />} />
        <Route path="/lessonsVirtual/:lessonId/advanced-test" element={<AdvancedTestPage />} />
        <Route path="/mini-lessons/numbers" element={<NumbersPage />} />
        <Route path="/numbers/math" element={<NumbersMathPage />} />
        <Route path="/numbers/accounting" element={<AccountingPage />} />
        <Route path="/numbers/ordinal" element={<OrdinalNumbersPage />} />
        <Route path="/numbers/money" element={<MoneyPage />} />
        <Route path="/numbers/time" element={<TimePage />} />
        <Route path="/numbers/dates" element={<TimePage />} />
        <Route path="/nouns" element={<NounsPage />} />
        <Route path="/alphabet/:letter" element={<WordsByLetterPage />} />
        <Route path="/functions" element={<PartsOfSpeechPage />} />
        <Route path="/functions/:id" element={<WordsByPartOfSpeechPage />} />
        
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