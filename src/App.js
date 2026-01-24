import { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './app/store';
import { restoreAuth, selectAuthInitialized } from './features/auth/authSlice';
import AppRouter from './router/AppRouter';
import ToastProvider from './components/feedback/ToastProvider';

// Auth Initializer Component
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const initialized = useSelector(selectAuthInitialized);

  useEffect(() => {
    console.log('🔄 Initializing auth from localStorage...');
    dispatch(restoreAuth());
  }, [dispatch]);

  // Show loading screen while initializing
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
          <p className="text-sm text-gray-600">Loading MediBridge...</p>
        </div>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AuthInitializer>
          <AppRouter />
        </AuthInitializer>
      </ToastProvider>
    </Provider>
  );
}

export default App;
