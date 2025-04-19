//* Netlify Identity & Airtable user linkage
import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { getOrCreateUser } from '../services/service';
import netlifyIdentity from 'netlify-identity-widget';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [netlifyUser, setNetlifyUser] = useState(null);
  const [userRecordId, setUserRecordId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [identityReady, setIdentityReady] = useState(false); //~ widget init state

  const identityWidget = netlifyIdentity;

  useEffect(() => {
    //~ only init once & set global fr compatibility
    identityWidget.init({ APIUrl: import.meta.env.VITE_NETLIFY_IDENTITY_URL });
    window.netlifyIdentity = identityWidget;
    identityWidget.on('init', user => {
      setIdentityReady(true);
    });
    identityWidget.on('login', user => {
      setNetlifyUser(user);
      const { id: netlifyId, email } = user;
      getOrCreateUser(netlifyId, email).then(id => setUserRecordId(id));
      identityWidget.close();
    });
    identityWidget.on('logout', () => {
      setNetlifyUser(null);
      setUserRecordId(null);
    });
    //~ check fr existing sesh after init
    identityWidget.on('init', user => {
      if (user) {
        setNetlifyUser(user);
        const { id: netlifyId, email } = user;
        getOrCreateUser(netlifyId, email).then(id => setUserRecordId(id));
      }
      setIsReady(true);
    });
    identityWidget.init(); //~ trigger init event
    return () => {
      identityWidget.off('login');
      identityWidget.off('logout');
      identityWidget.off('init');
    };
  }, []);

  //~ only open modal if widget is ready
  const login = () => {
    if (!identityReady) {
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.error('Auth widget still loading, please wait.');
      } else if (typeof window !== 'undefined') {
        //~ fallback using alert
        alert('Auth widget still loading, please wait.');
      }
      return;
    }
    identityWidget.open();
  };
  const logout = () => identityWidget.logout();

  return (
    <AuthContext.Provider value={{ netlifyUser, userRecordId, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  //~ prop validation fr children
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export default AuthContext;
