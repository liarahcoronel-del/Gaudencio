import React from 'react';
import { Document, Office, User } from '../types';
import StatusBadge from './StatusBadge';
import { EditIcon, TrashIcon, SendIcon, ClockIcon, CheckCircleIcon, DownloadIcon } from './Icons';

interface DocumentListItemProps {
  document: Document;
  currentUser: User;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onForward: (doc: Document) => void;
  onReceive: (doc: Document) => void;
  onViewHistory: (doc: Document) => void;
  isSelected: boolean;
  onToggleSelection: (docId: string) => void;
}

// FIX: Renamed the `document` prop to `doc` during destructuring to avoid shadowing the global `document` object. This resolves errors where DOM properties were being incorrectly accessed on the component's `document` prop.
const DocumentListItem: React.FC<DocumentListItemProps> = ({ document: doc, currentUser, onEdit, onDelete, onForward, onReceive, onViewHistory, isSelected, onToggleSelection }) => {
    const formattedDate = new Date(doc.lastUpdated).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const isOwner = doc.ownerId === currentUser.id;
    const isAdmin = currentUser.office === Office.Admin;
    const isAtMyOffice = doc.currentOffice === currentUser.office;
    
    const canReceive = isAtMyOffice && !doc.isReceived;
    const canEdit = (isAdmin || (isOwner && isAtMyOffice)) && !canReceive;
    const canDelete = (isAdmin || (isOwner && isAtMyOffice)) && !canReceive;
    const canForward = (isAdmin || isAtMyOffice) && !canReceive;

    const handleDownload = () => {
        if (!doc.attachment) return;
        
        const { data, mimeType, fileName } = doc.attachment;
        
        // Convert base64 to a Blob
        const byteCharacters = atob(data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        // Create a link and trigger the download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

  return (
    <tr className={`transition-colors duration-150 ${isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
      <td className="px-4 py-4">
        <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(doc.id)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-slate-900">{doc.title}</div>
        <div className="text-sm text-slate-500">by {doc.ownerName} ({doc.ownerOffice})</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={doc.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
        <div className="flex items-center gap-2">
            <span>{doc.currentOffice}</span>
            {!doc.isReceived && <span className="text-xs text-amber-600 font-semibold">(Pending)</span>}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formattedDate}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-4">
          <button onClick={() => onViewHistory(doc)} className="text-slate-500 hover:text-slate-800 transition-colors" title="View History">
            <ClockIcon />
          </button>
          {doc.attachment && (
            <button onClick={handleDownload} className="text-slate-500 hover:text-slate-800 transition-colors" title="Download Attachment">
                <DownloadIcon />
            </button>
          )}
          {canReceive && (
             <button onClick={() => onReceive(doc)} className="flex items-center gap-1.5 bg-green-100 text-green-700 font-semibold py-1 px-3 rounded-md text-sm hover:bg-green-200 transition" title="Receive Document">
                <CheckCircleIcon />
                Receive
             </button>
          )}
          {canForward && (
            <button onClick={() => onForward(doc)} className="text-sky-600 hover:text-sky-900 transition-colors" title="Forward">
              <SendIcon />
            </button>
          )}
          {canEdit && (
            <button onClick={() => onEdit(doc)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit">
              <EditIcon />
            </button>
          )}
          {canDelete && (
            <button onClick={() => onDelete(doc)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete">
              <TrashIcon />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default DocumentListItem;