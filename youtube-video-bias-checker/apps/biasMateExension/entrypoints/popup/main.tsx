import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useAuth } from '../../lib/useAuth';
import './style.css';

function LoginForm({ onSignIn, onSignUp, loading }: {
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
  loading: boolean;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signin') {
      onSignIn(email, password);
    } else {
      onSignUp(email, password);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </button>
      <button
        type="button"
        className="toggle-mode"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        disabled={loading}
      >
        {mode === 'signin' ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
      </button>
    </form>
  );
}

function UserInfo({ email, onSignOut, loading }: {
  email: string;
  onSignOut: () => void;
  loading: boolean;
}) {
  return (
    <div className="user-info">
      <p className="user-email">Logged in as:</p>
      <p className="email-text">{email}</p>
      <button onClick={onSignOut} disabled={loading}>
        {loading ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  );
}

function App() {
  const { user, loading, signIn, signUp, signOut, isAuthenticated } = useAuth();
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError('');
    const { error } = await signIn(email, password);
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  };

  const handleSignUp = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError('');
    const { error } = await signUp(email, password);
    if (error) {
      setAuthError(error.message);
    } else {
      setAuthError('Check your email for confirmation link!');
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    await signOut();
    setAuthLoading(false);
  };

  if (loading) {
    return (
      <div className="popup">
        <h1>Bias Mate</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="popup">
      <h1>Bias Mate</h1>
      {authError && <p className="error">{authError}</p>}
      {isAuthenticated && user?.email ? (
        <UserInfo
          email={user.email}
          onSignOut={handleSignOut}
          loading={authLoading}
        />
      ) : (
        <LoginForm
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          loading={authLoading}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
