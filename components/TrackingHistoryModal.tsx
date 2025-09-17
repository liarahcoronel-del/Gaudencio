import React from 'react';
import { Document, DocumentTracking } from '../types';
import { CloseIcon, PlusCircleIcon, ArrowRightIcon, CheckCircleIcon } from './Icons';

interface TrackingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
}

const actionDetails: Record<DocumentTracking['action'], {
    icon: React.ComponentType,
    color: string,
    title: string
}> = {
    Created: { icon: PlusCircleIcon, color: 'text-indigo-500', title: 'Document Created & Sent' },
    Forwarded: { icon: ArrowRightIcon, color: 'text-sky-500', title: 'Document Forwarded' },
    Received: { icon: CheckCircleIcon, color: 'text-green-500', title: 'Document Received' },
};


const TrackingHistoryModal: React.FC<TrackingHistoryModalProps> = ({ isOpen, onClose, document }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Tracking History</h2>
            <p className="text-sm text-slate-500 mt-1 truncate">for: {document.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <CloseIcon />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-6">
          <ol className="relative border-l border-slate-200">
             {document.trackingHistory.map((entry, index) => {
                const { icon: Icon, color, title } = actionDetails[entry.action];
                const formattedDate = new Date(entry.timestamp).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                });
                 
                let description = '';
                if (entry.action === 'Created') {
                    description = `by ${entry.user.name} from ${entry.fromOffice} to ${entry.toOffice}.`;
                } else if (entry.action === 'Forwarded') {
                    description = `by ${entry.user.name} from ${entry.fromOffice} to ${entry.toOffice}.`;
                } else if (entry.action === 'Received') {
                    description = `by ${entry.user.name} at ${entry.fromOffice}.`;
                }

                 return (
                    <li key={index} className="mb-8 ml-8">
                        <span className={`absolute -left-4 flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full ring-8 ring-white`}>
                            <Icon />
                        </span>
                        <h3 className={`flex items-center mb-1 text-lg font-semibold ${color}`}>
                            {title}
                        </h3>
                        <time className="block mb-2 text-sm font-normal leading-none text-slate-400">{formattedDate}</time>
                        <p className="text-base font-normal text-slate-600">{description}</p>
                    </li>
                 );
             })}
          </ol>
        </div>
         <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-xl">
            <button type="button" onClick={onClose} className="bg-white text-slate-700 border border-slate-300 py-2 px-4 rounded-lg font-semibold hover:bg-slate-50 transition">Close</button>
          </div>
      </div>
    </div>
  );
};

export default TrackingHistoryModal;
