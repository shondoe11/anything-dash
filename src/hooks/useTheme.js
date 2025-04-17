import { useContext } from 'react';
import ThemeContext from '../context/ThemeContext';

//& custom hook to use theme context
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export default useTheme;