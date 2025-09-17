import React, { useState } from 'react';
import { Document, Office } from '../types';
import { CloseIcon } from './Icons';

interface ForwardDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (doc: Document, targetOffice: Office) => void;
  documentToForward: Document;
}

const ForwardDocumentModal: React.FC<ForwardDocumentModalProps> = ({ isOpen, onClose, onConfirm, documentToForward }) => {
  const [targetOffice, setTargetOffice] = useState<Office | ''>('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!targetOffice) {
      setError('Please select a destination office.');
      return;
    }
    if (targetOffice === documentToForward.currentOffice) {
        setError('Cannot forward a document to its current office.');
        return;
    }
    setError('');
    onConfirm(documentToForward, targetOffice);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
         <div className="flex justify-between items-center p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Forward Document</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
              <CloseIcon />
            </button>
        </div>
        <div className="p-6">
            <p className="text-sm text-slate-600 mb-4">
                You are forwarding the document: <span className="font-semibold">{documentToForward.title}</span>
            </p>
            <div>
              <label htmlFor="office" className="block text-sm font-medium text-slate-700 mb-1">
                Select Destination Office
              </label>
              <select
                id="office"
                name="office"
                value={targetOffice}
                onChange={(e) => { setTargetOffice(e.target.value as Office); setError('')}}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Choose an office --</option>
                {Object.values(Office).map(o => (
                  <option key={o} value={o} disabled={o === documentToForward.currentOffice}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            className="bg-white text-slate-700 border border-slate-300 py-2 px-4 rounded-lg font-semibold hover:bg-slate-50 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold shadow-sm hover:bg-indigo-700 transition"
            onClick={handleConfirm}
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardDocumentModal;
