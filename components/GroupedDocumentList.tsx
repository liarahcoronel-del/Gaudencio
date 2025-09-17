import React from 'react';
import { Document, Office, User } from '../types';
import DocumentListItem from './DocumentListItem';

interface GroupedDocumentListProps {
  documents: Document[];
  currentUser: User;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onForward: (doc: Document) => void;
  onReceive: (doc: Document) => void;
  onViewHistory: (doc: Document) => void;
  selectedDocuments: string[];
  onToggleSelection: (docId: string) => void;
}

const GroupedDocumentList: React.FC<GroupedDocumentListProps> = ({ 
    documents, currentUser, onEdit, onDelete, onForward, onReceive, onViewHistory,
    selectedDocuments, onToggleSelection
}) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-slate-50 rounded-lg">
        <h3 className="text-xl font-semibold text-slate-700">No documents found.</h3>
        <p className="text-slate-500 mt-2">Try adjusting your search or add a new document to get started.</p>
      </div>
    );
  }

  const groupedDocuments = documents.reduce((acc, doc) => {
    (acc[doc.currentOffice] = acc[doc.currentOffice] || []).push(doc);
    return acc;
  }, {} as Record<Office, Document[]>);
  
  const allOffices = Object.values(Office);
  
  return (
    <div className="space-y-8">
      {allOffices.map(office => {
          const officeDocuments = groupedDocuments[office];
          if (!officeDocuments) {
              return null;
          }

          return (
            <div key={office}>
              <h2 className="text-xl font-semibold text-slate-800 mb-3 border-b pb-2">
                {office} <span className="text-base font-normal text-slate-500">({officeDocuments.length} document{officeDocuments.length > 1 ? 's' : ''})</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        <span className="sr-only">Select</span>
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
                    {officeDocuments.map(doc => (
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
            </div>
          )
      })}
    </div>
  );
};

export default GroupedDocumentList;