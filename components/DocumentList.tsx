import React, { useRef, useEffect } from 'react';
import { Document, User } from '../types';
import DocumentListItem from './DocumentListItem';

interface DocumentListProps {
  documents: Document[];
  currentUser: User;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onForward: (doc: Document) => void;
  onReceive: (doc: Document) => void;
  onViewHistory: (doc: Document) => void;
  selectedDocuments: string[];
  onToggleSelection: (docId: string) => void;
  onToggleAllSelections: () => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
    documents, currentUser, onEdit, onDelete, onForward, onReceive, onViewHistory,
    selectedDocuments, onToggleSelection, onToggleAllSelections
}) => {
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const numSelected = selectedDocuments.length;
  const numDocs = documents.length;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
        selectAllCheckboxRef.current.checked = numSelected > 0 && numSelected === numDocs;
        selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numDocs;
    }
  }, [numSelected, numDocs]);
    
  if (documents.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-slate-50 rounded-lg">
        <h3 className="text-xl font-semibold text-slate-700">No documents found.</h3>
        <p className="text-slate-500 mt-2">Try adjusting your search or add a new document to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left">
              <input
                type="checkbox"
                ref={selectAllCheckboxRef}
                onChange={onToggleAllSelections}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Title / Owner
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </th>
             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Current Office
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Last Updated
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {documents.map(doc => (
            <DocumentListItem 
                key={doc.id} 
                document={doc} 
                currentUser={currentUser}
                onEdit={onEdit} 
                onDelete={onDelete} 
                onForward={onForward}
                onReceive={onReceive}
                onViewHistory={onViewHistory}
                isSelected={selectedDocuments.includes(doc.id)}
                onToggleSelection={onToggleSelection}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentList;