
import React from 'react';
import { WarningIcon } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <WarningIcon />
            </div>
            <div className="mt-0 text-left">
              <h3 className="text-lg leading-6 font-bold text-slate-900" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-slate-500">
                  {message}
                </p>
              </div>
            </div>
          </div>
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
            className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold shadow-sm hover:bg-red-700 transition"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
