import React, { useState } from 'react';
import { Office, User } from '../types';
import { FileTextIcon } from './Icons';

interface AuthProps {
  onLogin: (name: string, password?: string) => boolean;
  onRegister: (user: Omit<User, 'id'>) => boolean;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [office, setOffice] = useState<Office>(Office.FOU);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const success = onLogin(name, password);
      if (!success) {
        setError('Invalid credentials. Please try again.');
      }
    } else {
      if (!name || !password || !office) {
        setError('All fields are required for registration.');
        return;
      }
      const success = onRegister({ name, password, office });
      if (!success) {
        setError('A user with this name already exists.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center items-center gap-3 mb-6">
           <FileTextIcon />
           <h1 className="text-3xl font-bold text-indigo-600">DocuTrack AI</h1>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          {isLogin ? 'Welcome Back!' : 'Create Your Account'}
        </h2>
        <p className="text-center text-slate-500 mb-8">
          {isLogin ? 'Sign in to continue.' : 'Get started by creating a new account.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="username"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-slate-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
          {!isLogin && (
            <div>
              <label htmlFor="office" className="block text-sm font-medium text-slate-700">Office</label>
              <select
                id="office"
                name="office"
                value={office}
                onChange={(e) => setOffice(e.target.value as Office)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {Object.values(Office).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}
          
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {isLogin ? 'Sign In' : 'Register'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => { setIsLogin(!isLogin); setError('') }} className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
            {isLogin ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
