import { useContext } from 'react';
import ThemeContext from '../context/ThemeContext';

//& custom hook to use theme context
const useTheme = () => useContext(ThemeContext);

export default useTheme;