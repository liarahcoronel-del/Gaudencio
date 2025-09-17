import React from 'react';
import { User } from '../types';
import { FileTextIcon } from './Icons';

interface HeaderProps {
    currentUser: User;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <FileTextIcon />
            <h1 className="text-2xl font-bold text-indigo-600">DocuTrack AI</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-sm text-slate-500">{currentUser.office}</p>
            </div>
            <button onClick={onLogout} className="bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors duration-200">
                Logout
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
