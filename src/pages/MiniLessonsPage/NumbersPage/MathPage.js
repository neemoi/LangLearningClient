import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/MathPage.css';

const MathPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showReference, setShowReference] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/');
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  useEffect(() => {
    if (!isAuthorized) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAuthorized]);

  if (!isAuthorized) {
    return null;
  }

  const sections = [
    { path: "/mini-lessons/numbers", name: "Дом" },
    { path: "/numbers/accounting", name: "Счет" },
    { path: "/numbers/dates", name: "Даты" },
    { path: "/numbers/math", name: "Математика" },
    { path: "/numbers/money", name: "Деньги" },
    { path: "/numbers/ordinal", name: "Порядковые числительные" },
    { path: "/numbers/time", name: "Время" }
  ];

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleBack = () => navigate('/mini-lessons/numbers');

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(prev => !prev);
  };

  const operations = [
    {
      title: "Основные операции",
      items: [
        { name: "Addition / Сложение", symbol: "+", example: "2 + 2 = 4" },
        { name: "Subtraction / Вычитание", symbol: "-", example: "5 - 3 = 2" },
        { name: "Multiplication / Умножение", symbol: "×", example: "3 × 4 = 12" },
        { name: "Division / Деление", symbol: "÷", example: "10 ÷ 2 = 5" }
      ]
    },
    {
      title: "Дроби",
      items: [
        { name: "Fraction / Дробь", symbol: "/", example: "1/2" },
        { name: "One quarter", symbol: "", example: "1/4" },
        { name: "Three quarters", symbol: "", example: "3/4" }
      ]
    },
    {
      title: "Десятичные дроби",
      items: [
        { name: "Decimal point", symbol: ".", example: "0.5" },
        { name: "Point two five", symbol: "", example: "0.25" },
        { name: "One point five", symbol: "", example: "1.5" }
      ]
    },
    {
      title: "Проценты",
      items: [
        { name: "Percent", symbol: "%", example: "50%" },
        { name: "Twenty five percent", symbol: "", example: "25%" },
        { name: "One hundred percent", symbol: "", example: "100%" }
      ]
    }
  ];

  const ReferenceContent = () => (
    <div className={`reference-content ${showReference ? 'show' : ''}`}>
      <div className="panel panel-body panel-opacity">
        <p>
          <span className="notranslate">Math is a universal language because it works the same no matter what language you speak. The only difference with math in English is that the words are spoken differently than other languages. Before you learn the basic math terms, it is important that you know how to say the English numbers.</span><br />
          Математика - универсальный язык, потому что она работает одинаково, независимо от того, на каком языке вы говорите. Единственное отличие от математики в английском заключается в том, что слова произносятся иначе, чем в других языках. Прежде чем вы выучите основные математические термины, важно, чтобы вы знали, как произносятся цифры на английском языке.
        </p>
        <p>
          <span className="notranslate">Once you can pronounce the numbers, there are some basic math terms that you must also learn in order to pronounce math problems.</span><br />
          Как только вы научитесь произносить цифры, вам также необходимо выучить несколько основных математических терминов, чтобы правильно решать математические задачи.
        </p>
        
        <h3 className="header smaller lighter purple">
          Примеры:
        </h3>
        
        <div className="math-buttons-grid">
          <button onClick={() => speak("add")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">add (+)</span><br />
            add
          </button>
          <button onClick={() => speak("plus")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">plus (+)</span><br />
            plus
          </button>
          <button onClick={() => speak("subtract")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">subtract (-)</span><br />
            subtract
          </button>
          <button onClick={() => speak("minus")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">minus (-)</span><br />
            minus
          </button>
          <button onClick={() => speak("multiply")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">multiply (x)</span><br />
            multiply
          </button>
          <button onClick={() => speak("times")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">times (x)</span><br />
            times
          </button>
          <button onClick={() => speak("divide")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">divide (÷)</span><br />
            divide
          </button>
          <button onClick={() => speak("divided by")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">divided by (÷)</span><br />
            divided by
          </button>
          <button onClick={() => speak("equals")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">equals (=)</span><br />
            equals
          </button>
          <button onClick={() => speak("fraction")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">fraction (/)</span><br />
            fraction
          </button>
          <button onClick={() => speak("decimal")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">decimal (.)</span><br />
            decimal
          </button>
          <button onClick={() => speak("point")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">point (.)</span><br />
            point
          </button>
          <button onClick={() => speak("percent")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">percent (%)</span><br />
            percent
          </button>
          <button onClick={() => speak("quarter")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">quarter (1/4)</span><br />
            quarter
          </button>
          <button onClick={() => speak("half")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">half (1/2)</span><br />
            half
          </button>
          <button onClick={() => speak("quarters")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">quarters (3/4)</span><br />
            quarters
          </button>
          <button onClick={() => speak("whole")} className="btn btn-primary customplay" style={{marginBottom:'3px',width:'120px'}}>
            <span className="notranslate">whole (1)</span><br />
            whole
          </button>
        </div>
        
        <br />
        
        <p>
          <span className="notranslate">Now let's take a look at some math problems and how they are spoken.</span><br />
          Теперь давайте рассмотрим некоторые математические задачи и то, как они решаются.
        </p>
        
        <h3 className="header smaller lighter red">
          <span className="notranslate">Examples</span> (Examples):
        </h3>
        
        <div className="math-examples-grid">
          <button onClick={() => speak("two plus two equals four")} className="btn btn-success customplay" style={{marginBottom:'3px'}}>
            <span className="notranslate">two plus two equals four (2+2=4)</span><br />
            two plus two equals four
          </button>
          <button onClick={() => speak("four minus two equals two")} className="btn btn-success customplay" style={{marginBottom:'3px'}}>
            <span className="notranslate">four minus two equals two (4-2=2)</span><br />
            four minus two equals two
          </button>
          <button onClick={() => speak("two times two equals four")} className="btn btn-success customplay" style={{marginBottom:'3px'}}>
            <span className="notranslate">two times two equals four (2x2=4)</span><br />
            two times two equals four
          </button>
          <button onClick={() => speak("four divided by two equals two")} className="btn btn-success customplay" style={{marginBottom:'3px'}}>
            <span className="notranslate">four divided by two equals two (4÷2=2)</span><br />
            four divided by two equals two
          </button>
        </div>
        
        <br />
        
        <p>
          <span className="notranslate">Now let's take a look at some fractions, decimals and percentages and how they are pronounced.</span><br />
         Теперь давайте взглянем на некоторые дроби, десятичные дроби и проценты и на то, как они произносятся.
        </p>
        
        <h3 className="header smaller lighter orange">
          <span className="notranslate">Fractions</span> / Fractions
        </h3>
        
        <div className="math-fractions-grid">
          <button onClick={() => speak("one quarter")} className="btn btn-info customplay" style={{marginBottom:'3px', width:'200px'}}>
            <span className="notranslate">one quarter (1/4)</span><br />
            one quarter
          </button>
          <button onClick={() => speak("one half")} className="btn btn-info customplay" style={{marginBottom:'3px', width:'200px'}}>
            <span className="notranslate">one half (1/2)</span><br />
            one half
          </button>
          <button onClick={() => speak("three quarters")} className="btn btn-info customplay" style={{marginBottom:'3px', width:'200px'}}>
            <span className="notranslate">three quarters (3/4)</span><br />
            three quarters
          </button>
          <button onClick={() => speak("whole")} className="btn btn-info customplay" style={{marginBottom:'3px', width:'200px'}}>
            <span className="notranslate">whole (4/4)</span><br />
            whole
          </button>
        </div>
        
        <div className="clearfix"></div>
        <br />
        
        <h3 className="header smaller lighter blue">
          <span className="notranslate">Decimals</span> / Decimals
        </h3>
        
        <div className="math-decimals-grid">
          <button onClick={() => speak("point twenty five")} className="btn btn-danger customplay" style={{marginBottom:'3px'}}>
            <span className="notranslate">point twenty five (.25)</span><br />
            point twenty five
          </button>
          <button onClick={() => speak("point five")} className="btn btn-danger customplay" style={{marginBottom:'3px'}}>
            <span className="notranslate">point five (.5)</span><br />
            point five
          </button>
          <button onClick={() => speak("point seventy five")} className="btn btn-danger customplay" style={{marginBottom:'3px'}}>
            <span className="notranslate">point seventy five (.75)</span><br />
            point seventy five
          </button>
          <button onClick={() => speak("one point five")} className="btn btn-danger customplay" style={{marginBottom:'3px'}}>
            <span className="notranslate">one point five (1.5)</span><br />
            one point five
          </button>
        </div>
        
        <br />
        
        <h3 className="header smaller lighter purple">
          <span className="notranslate">Percents</span> / Percents
        </h3>
        
        <div className="math-percents-grid">
          <button onClick={() => speak("twenty five percent")} className="btn btn-warning customplay" style={{marginBottom:'3px'}}>
            <span className="notranslate">twenty five percent (25%)</span><br />
            twenty five percent
          </button>
          <button onClick={() => speak("fifty percent")} className="btn btn-warning customplay" style={{marginBottom:'3px'}}>
            <span className="notranslate">fifty percent (50%)</span><br />
            fifty percent
          </button>
          <button onClick={() => speak("seventy-five percent")} className="btn btn-warning customplay" style={{marginBottom:'3px'}}>
            <span className="notranslate">seventy-five percent (75%)</span><br />
            seventy-five percent
          </button>
          <button onClick={() => speak("one hundred percent")} className="btn btn-warning customplay" style={{marginBottom:'3px'}}>
            <span className="notranslate">one hundred percent (100%)</span><br />
            one hundred percent
          </button>
        </div>
        
        <div className="space-24"></div>
      </div>
    </div>
  );

  return (
    <div className="math-app">
      <Navigation 
        isSidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`math-main-content ${sidebarOpen ? 'with-sidebar' : 'no-sidebar'}`}>
        <div className="math-page">
          <header className="math-header">
            <button onClick={handleBack} className="back-btn">
              ← Назад к уроку
            </button>
            <h1>Номера / Математика</h1>
            <div className="section-dropdown-wrapper">
              <div className="section-dropdown" ref={dropdownRef}>
                <button onClick={toggleDropdown} className="dropdown-toggle">
                  Перейти к разделу {showDropdown ? '▲' : '▼'}
                </button>
                <div className={`dropdown-menu ${showDropdown ? 'show' : ''}`}>
                  {sections.map((section, index) => (
                    <Link
                      key={index}
                      to={section.path}
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      {section.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <div className="math-container">
            <button 
              onClick={() => setShowReference(!showReference)}
              className="static-reference-toggle-btn"
            >
              {showReference ? 'Закрыть справочник' : 'Открыть справочник'}
            </button>

            <ReferenceContent />

            {operations.map((group, index) => (
              <section key={index} className={`math-group group-${index}`}>
                <h2>{group.title}</h2>
                <div className="operations-grid">
                  {group.items.map((item, i) => (
                    <div key={i} className="operation-card">
                      {item.name && (
                        <button 
                          onClick={() => speak(item.name.split(' / ')[0])} 
                          className="operation-name"
                        >
                          {item.name}
                        </button>
                      )}
                      <div className="symbols-row">
                        {item.symbol && (
                          <button 
                            onClick={() => speak(
                              item.symbol === '+' ? 'Plus' : 
                              item.symbol === '-' ? 'Minus' : 
                              item.symbol === '×' ? 'Times' : 
                              item.symbol === '÷' ? 'Divided by' : 
                              item.symbol === '/' ? 'Fraction' : 
                              item.symbol === '.' ? 'Decimal point' : 
                              item.symbol === '%' ? 'Percent' : item.symbol
                            )} 
                            className="symbol-btn"
                          >
                            {item.symbol}
                          </button>
                        )}
                        <button 
                          onClick={() => speak(item.example)} 
                          className="example-btn"
                        >
                          {item.example}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MathPage;