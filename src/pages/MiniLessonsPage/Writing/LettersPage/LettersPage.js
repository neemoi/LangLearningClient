import React, { useState, useEffect } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../../components/layout/Sidebar/Sidebar';
import './../css/LettersPage.css';

const LettersPage = () => {
  const navigate = useNavigate();
  const { speak, cancel } = useSpeechSynthesis();
  const [activeLetter, setActiveLetter] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('uppercase');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);

  const uppercaseLetters = 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'.split(' ');
  const lowercaseLetters = 'a b c d e f g h i j k l m n o p q r s t u v w x y z'.split(' ');
  const vowels = ['A', 'E', 'I', 'O', 'U', 'a', 'e', 'i', 'o', 'u'];
  const consonants = 'B C D F G H J K L M N P Q R S T V W X Y Z b c d f g h j k l m n p q r s t v w x y z'.split(' ');

  const letterAnimationsUppercase = {
    A: {
      paths: ["M50,70 L40,30", "M40,30 L30,70", "M35,50 L45,50"],
      duration: 2.5,
      instructions: "1. Начните с верхней точки\n2. Проведите вниз влево\n3. Вернитесь вверх и проведите вниз вправо\n4. Добавьте перекладину посередине"
    },
    B: {
      paths: ["M30,30 L30,70", "M30,30 Q60,35 30,50", "M30,50 Q60,65 30,70"],
      duration: 3,
      instructions: "1. Проведите вертикальную линию\n2. Нарисуйте верхнюю полуокружность\n3. Нарисуйте нижнюю полуокружность"
    },
    C: {
      paths: ["M65,35 Q40,20 35,50 Q40,80 65,65"],
      duration: 2,
      instructions: "1. Начните с правой верхней точки\n2. Нарисуйте полукруг влево\n3. Завершите форму, возвращаясь вправо"
    },
    D: {
      paths: ["M30,70 L30,30", "M30,30 Q60,30 60,50 Q60,70 30,70"],
      duration: 2.5,
      instructions: "1. Проведите вертикальную линию\n2. Нарисуйте полукруг вправо"
    },
    E: {
      paths: ["M70,30 L30,30", "M30,30 L30,70", "M30,70 L70,70", "M30,50 L55,50"],
      duration: 3,
      instructions: "1. Проведите верхнюю горизонтальную линию\n2. Проведите вертикальную линию\n3. Проведите нижнюю горизонтальную линию\n4. Добавьте среднюю перекладину"
    },
    F: {
      paths: ["M30,30 L30,70", "M30,30 L70,30", "M30,50 L55,50"],
      duration: 2.5,
      instructions: "1. Проведите вертикальную линию\n2. Проведите верхнюю горизонтальную линию\n3. Добавьте среднюю перекладину"
    },
    G: {
      paths: ["M70,40 Q60,30 50,30 Q30,30 30,50 Q30,70 50,70 Q70,70 70,55 L60,55"],
      duration: 3,
      instructions: "1. Начните с правой верхней точки\n2. Нарисуйте полукруг влево\n3. Добавьте хвостик внизу справа"
    },
    H: {
      paths: ["M30,30 L30,70", "M70,30 L70,70", "M30,50 L70,50"],
      duration: 2.5,
      instructions: "1. Проведите левую вертикальную линию\n2. Проведите правую вертикальную линию\n3. Добавьте среднюю перекладину"
    },
    I: {
      paths: ["M50,30 L50,70", "M40,30 L60,30", "M40,70 L60,70"],
      duration: 2,
      instructions: "1. Проведите вертикальную линию\n2. Добавьте верхнюю перекладину\n3. Добавьте нижнюю перекладину"
    },
    J: {
      paths: ["M60,30 L60,60 Q60,70 50,70 Q40,70 40,60"],
      duration: 2,
      instructions: "1. Проведите вертикальную линию\n2. Нарисуйте крючок внизу"
    },
    K: {
      paths: ["M30,30 L30,70", "M30,50 L60,30", "M30,50 L60,70"],
      duration: 2.5,
      instructions: "1. Проведите вертикальную линию\n2. Нарисуйте верхнюю диагональ\n3. Нарисуйте нижнюю диагональ"
    },
    L: {
      paths: ["M30,30 L30,70", "M30,70 L65,70"],
      duration: 2,
      instructions: "1. Проведите вертикальную линию\n2. Проведите горизонтальную линию внизу"
    },
    M: {
      paths: ["M30,70 L30,30", "M30,30 L50,50", "M50,50 L70,30", "M70,30 L70,70"],
      duration: 3,
      instructions: "1. Проведите левую вертикальную линию\n2. Нарисуйте диагональ к центру\n3. Нарисуйте диагональ вправо вверх\n4. Проведите правую вертикальную линию"
    },
    N: {
      paths: ["M30,70 L30,30", "M30,30 L70,70", "M70,70 L70,30"],
      duration: 2.5,
      instructions: "1. Проведите левую вертикальную линию\n2. Нарисуйте диагональ вправо вниз\n3. Проведите правую вертикальную линию"
    },
    O: {
      paths: ["M70,50 Q70,30 50,30 Q30,30 30,50 Q30,70 50,70 Q70,70 70,50"],
      duration: 3,
      instructions: "1. Начните с правой средней точки\n2. Нарисуйте окружность против часовой стрелки"
    },
    P: {
      paths: ["M30,70 L30,30", "M30,30 Q55,30 30,50"],
      duration: 2.5,
      instructions: "1. Проведите вертикальную линию\n2. Нарисуйте полукруг вправо"
    },
    Q: {
      paths: ["M70,50 Q70,30 50,30 Q30,30 30,50 Q30,70 50,70 Q70,70 70,50", "M55,55 L75,75"],
      duration: 3,
      instructions: "1. Нарисуйте окружность\n2. Добавьте диагональный хвостик"
    },
    R: {
      paths: ["M30,70 L30,30", "M30,30 Q55,30 50,45 Q45,50 30,50", "M30,50 Q45,60 60,70"],
      duration: 3,
      instructions: "1. Проведите вертикальную линию\n2. Нарисуйте полукруг вправо\n3. Добавьте диагональный хвостик"
    },
    S: {
      paths: ["M70,30 Q40,20 40,40", "M40,40 Q40,60 60,60", "M60,60 Q80,60 60,70 Q40,80 30,70"],
      duration: 3,
      instructions: "1. Начните с правой верхней точки\n2. Нарисуйте верхнюю полуокружность\n3. Нарисуйте нижнюю полуокружность"
    },
    T: {
      paths: ["M50,30 L50,70", "M30,30 L70,30"],
      duration: 1.5,
      instructions: "1. Проведите вертикальную линию\n2. Проведите верхнюю горизонтальную линию"
    },
    U: {
      paths: ["M30,30 L30,60 Q30,70 50,70 Q70,70 70,60 L70,30"],
      duration: 2.5,
      instructions: "1. Проведите левую вертикальную линию\n2. Нарисуйте закругление внизу\n3. Проведите правую вертикальную линию"
    },
    V: {
      paths: ["M30,30 L50,70", "M50,70 L70,30"],
      duration: 2,
      instructions: "1. Нарисуйте левую диагональ\n2. Нарисуйте правую диагональ"
    },
    W: {
      paths: ["M30,30 L40,70", "M40,70 L50,30", "M50,30 L60,70", "M60,70 L70,30"],
      duration: 3,
      instructions: "1. Нарисуйте первую диагональ\n2. Нарисуйте вторую диагональ\n3. Нарисуйте третью диагональ\n4. Нарисуйте четвертую диагональ"
    },
    X: {
      paths: ["M30,30 L70,70", "M70,30 L30,70"],
      duration: 2,
      instructions: "1. Нарисуйте диагональ из левого верхнего угла\n2. Нарисуйте диагональ из правого верхнего угла"
    },
    Y: {
      paths: ["M30,30 L50,50", "M70,30 L50,50", "M50,50 L50,70"],
      duration: 2.5,
      instructions: "1. Нарисуйте левую верхнюю диагональ\n2. Нарисуйте правую верхнюю диагональ\n3. Проведите вертикальную линию вниз"
    },
    Z: {
      paths: ["M30,30 L70,30", "M70,30 L30,70", "M30,70 L70,70"],
      duration: 2.5,
      instructions: "1. Проведите верхнюю горизонтальную линию\n2. Нарисуйте диагональ\n3. Проведите нижнюю горизонтальную линию"
    }
  };

  const letterAnimationsLowercase = {
    a: {
      paths: ["M55,55 Q55,40 40,40 Q30,40 30,50 Q30,60 40,60 Q50,60 50,50 L50,70"],
      duration: 2.5,
      instructions: "1. Начните с правой верхней точки\n2. Нарисуйте округлую форму\n3. Добавьте хвостик внизу"
    },
  b: {
  paths: [
    "M30,70 L30,30",                 
    "M30,50 Q55,50 55,65 Q55,80 30,80" 
  ],
  duration: 3
}
,
    c: {
      paths: ["M55,45 Q35,30 30,50 Q35,70 55,55"],
      duration: 2,
      instructions: "1. Начните с правой средней точки\n2. Нарисуйте полукруг влево"
    },
  d: {
  paths: [
    "M55,70 L55,30",                 
    "M55,50 Q30,50 30,65 Q30,80 55,80"  
  ],
  duration: 3
}
,
 e: {
  paths: [
    "M35,55 L50,55",                           
    "M50,55 Q60,55 60,50 Q60,40 45,40 Q30,40 30,55 Q30,70 45,70 Q55,70 60,65"
  ],
  duration: 2.5
}

,
   f: {
  paths: [
    "M55,30 Q45,30 45,45 L45,75 Q45,85 35,85", 
    "M35,55 L55,55"                          
  ],
  duration: 2.5
}
,
   g: {
  paths: [
    "M55,45 Q55,30 40,30 Q25,30 25,45 Q25,60 40,60 Q55,60 55,45", 
    "M55,60 L55,80 Q55,90 35,90 Q25,90 30,80 L35,75"            
  ],
  duration: 3
}
,
    h: {
      paths: ["M30,30 L30,70", "M30,50 Q55,50 55,70"],
      duration: 2.5,
      instructions: "1. Проведите вертикальную линию\n2. Нарисуйте изогнутую линию вправо"
    },
    i: {
      paths: ["M40,50 L40,70", "M40,40 L40,40"],
      duration: 2,
      instructions: "1. Проведите вертикальную линию\n2. Добавьте точку сверху"
    },
  j: {
  paths: [
    "M50,30 L50,75 Q50,85 40,85",
    "M50,20 L50,20"              
  ],
  duration: 2
}
,
    k: {
      paths: ["M30,30 L30,70", "M30,50 L55,30", "M30,50 L55,70"],
      duration: 2.5,
      instructions: "1. Проведите вертикальную линию\n2. Нарисуйте верхнюю диагональ\n3. Нарисуйте нижнюю диагональ"
    },
    l: {
      paths: ["M40,30 L40,70"],
      duration: 2,
      instructions: "1. Проведите вертикальную линию"
    },
   m: {
  paths: [
    "M30,70 L30,50",                       
    "M30,50 Q40,35 50,50 Q55,55 55,70",    
    "M55,50 Q65,35 75,50 Q80,55 80,70"     
  ],
  duration: 3
}
,
   n: {
  paths: [
    "M30,70 L30,35",             
    "M30,35 Q50,25 50,50",         
    "M50,50 L50,70"               
  ],
  duration: 2.5
}
,
    o: {
      paths: ["M55,50 Q55,30 35,30 Q15,30 15,50 Q15,70 35,70 Q55,70 55,50"],
      duration: 3,
      instructions: "1. Нарисуйте окружность против часовой стрелки"
    },
p: {
      paths: ["M30,70 L30,30", "M30,30 Q55,30 30,50"],
      duration: 2.5,
      instructions: "1. Проведите вертикальную линию\n2. Нарисуйте полукруг вправо"
    }

,
   q: {
  paths: [
    "M40,60 Q40,40 60,40 Q80,40 80,60 Q80,80 60,80 Q40,80 40,60",  
    "M80,80 Q90,100 85,120"                                         
  ],
  duration: 3
}
,
   r: {
  paths: [
    "M50,80 L50,40",                       
    "M50,50 Q60,40 70,50"          
  ],
  duration: 2
}
,
  s:  {
      paths: ["M70,30 Q40,20 40,40", "M40,40 Q40,60 60,60", "M60,60 Q80,60 60,70 Q40,80 30,70"],
      duration: 3,
      instructions: "1. Начните с правой верхней точки\n2. Нарисуйте верхнюю полуокружность\n3. Нарисуйте нижнюю полуокружность"
    }
,
    t: {
      paths: ["M40,30 L40,70", "M30,40 L50,40"],
      duration: 2,
      instructions: "1. Проведите вертикальную линию\n2. Добавьте верхнюю перекладину"
    },
    u: {
      paths: ["M30,30 L30,60 Q30,70 50,70 Q70,70 70,60 L70,30"],
      duration: 2.5,
      instructions: "1. Проведите левую вертикальную линию\n2. Нарисуйте закругление внизу\n3. Проведите правую вертикальную линию"
    },
    v: {
      paths: ["M30,30 L50,70", "M50,70 L70,30"],
      duration: 2,
      instructions: "1. Нарисуйте левую диагональ\n2. Нарисуйте правую диагональ"
    },
    w: {
      paths: ["M30,30 L40,70", "M40,70 L50,30", "M50,30 L60,70", "M60,70 L70,30"],
      duration: 3,
      instructions: "1. Нарисуйте первую диагональ\n2. Нарисуйте вторую диагональ\n3. Нарисуйте третью диагональ\n4. Нарисуйте четвертую диагональ"
    },
    x: {
      paths: ["M30,30 L70,70", "M70,30 L30,70"],
      duration: 2,
      instructions: "1. Нарисуйте диагональ из левого верхнего угла\n2. Нарисуйте диагональ из правого верхнего угла"
    },
    y: {
      paths: ["M30,30 L50,50", "M70,30 L50,50", "M50,50 L50,70"],
      duration: 2.5,
      instructions: "1. Нарисуйте левую верхнюю диагональ\n2. Нарисуйте правую верхнюю диагональ\n3. Проведите вертикальную линию вниз"
    },
    z: {
      paths: ["M30,30 L70,30", "M70,30 L30,70", "M30,70 L70,70"],
      duration: 2.5,
      instructions: "1. Проведите верхнюю горизонтальную линию\n2. Нарисуйте диагональ\n3. Проведите нижнюю горизонтальную линию"
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        navigate('/');
      } else {
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [navigate]);

  const speakLetter = (letter) => {
    cancel();
    setActiveLetter(letter);
    speak({ text: letter });
    setTimeout(() => setActiveLetter(null), 800);
  };

  const handleLetterClick = (letter) => {
    speakLetter(letter);
    setSelectedLetter(letter);
    setAnimationKey(prev => prev + 1);
  };

  const closeModal = () => {
    setSelectedLetter(null);
  };

  const renderLetterAnimation = () => {
    if (!selectedLetter) return null;
    
    const animations = activeTab === 'uppercase' ? letterAnimationsUppercase : letterAnimationsLowercase;
    const animation = animations[selectedLetter] || {
      paths: [`M30,30 L70,70`, `M70,30 L30,70`],
      duration: 1,
      instructions: "Следуйте за анимацией, чтобы правильно написать букву"
    };

    return (
      <svg key={animationKey} viewBox="0 0 100 100" className="letter-svg">
        {animation.paths.map((path, index) => (
          <path
            key={index}
            d={path}
            fill="none"
            stroke="#3498db"
            strokeWidth="3"
            strokeLinecap="round"
            className="letter-path"
            style={{
              animation: `draw ${animation.duration}s ease-in-out ${index * animation.duration * 0.5}s forwards`,
              strokeDasharray: 1000,
              strokeDashoffset: 1000
            }}
          />
        ))}
      </svg>
    );
  };

  const restartAnimation = () => {
    setAnimationKey(prev => prev + 1);
  };

  if (!isAuthorized) {
    return null; 
  }

  return (
    <div className="letters-page">
      <Navigation 
        isSidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`letters-content ${sidebarOpen ? 'with-sidebar' : 'no-sidebar'}`}>
        <div className="letters-container">
          <div className="back-link">
            <Link to="/mini-lessons/writing" className="back-button">
              ← Назад к Написанию
            </Link>
          </div>

          <div className="header-section">
            <h1 className="letters-title">Английский алфавит</h1>
            <p className="letters-subtitle">Изучайте буквы с правильным произношением</p>
          </div>

          <div className="letters-actions">
            <button 
              onClick={() => setActiveTab('uppercase')}
              className={`action-button ${activeTab === 'uppercase' ? 'active' : ''}`}
            >
              Прописные буквы
            </button>
            <button 
              onClick={() => setActiveTab('lowercase')}
              className={`action-button ${activeTab === 'lowercase' ? 'active' : ''}`}
            >
              Строчные буквы
            </button>
          </div>

          <div className="letters-grid">
            {(activeTab === 'uppercase' ? uppercaseLetters : lowercaseLetters).map((letter) => (
              <div 
                key={letter}
                className={`letter-card ${activeLetter === letter ? 'active' : ''} ${
                  vowels.includes(letter) ? 'vowel' : 'consonant'
                }`}
                onClick={() => handleLetterClick(letter)}
              >
                <div className="letter-content">
                  <div className="letter-display">{letter}</div>
                </div>
              </div>
            ))}
          </div>

          {selectedLetter && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal" onClick={closeModal}>×</button>
                <h2>Написание буквы {selectedLetter}</h2>
                <div className="letter-animation-container">
                  {renderLetterAnimation()}
                </div>
                <div className="writing-instructions">
                  <h3>Инструкция по написанию:</h3>
                  <pre>
                    {activeTab === 'uppercase' 
                      ? letterAnimationsUppercase[selectedLetter]?.instructions || 
                        "Следуйте за анимацией, чтобы правильно написать букву"
                      : letterAnimationsLowercase[selectedLetter]?.instructions || 
                        "Следуйте за анимацией, чтобы правильно написать букву"}
                  </pre>
                  <button 
                    className="play-animation"
                    onClick={restartAnimation}
                  >
                    Повторить анимацию
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LettersPage;