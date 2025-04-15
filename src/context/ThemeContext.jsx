import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  //& check if user alrdy hav pref in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    //~ also check system pref if no saved pref
    if (savedMode === null) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return savedMode === 'true';
  });

  //~ toggle theme function
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  //~ update localStorage & document body class on dark mode change
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  //~ listen fr system theme preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const userHasExplicitPreference = localStorage.getItem('darkMode') !== null;
      if (!userHasExplicitPreference) {
        setDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  //~ provide theme context to app
  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ThemeContext;
