import React, { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Document, Status, Office, User } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import DocumentList from './components/DocumentList';
import DocumentFormModal from './components/DocumentFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import ForwardDocumentModal from './components/ForwardDocumentModal';
import TrackingHistoryModal from './components/TrackingHistoryModal';
import Auth from './components/Auth';
import { PlusIcon, SearchIcon, QrCodeIcon, CheckCircleIcon, TrashIcon } from './components/Icons';
import GroupedDocumentList from './components/GroupedDocumentList';
import QrScannerModal from './components/QrScannerModal';

type View = 'sent' | 'inbox' | 'received';

const generateTrackingSlipPdf = async (doc: Document) => {
    try {
        const pdf = new jsPDF();
        const qrCodeDataUrl = await QRCode.toDataURL(doc.id, { errorCorrectionLevel: 'H' });
        
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DocuTrack AI - Tracking Slip', 105, 20, { align: 'center' });

        pdf.addImage(qrCodeDataUrl, 'PNG', 150, 25, 40, 40);

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        
        pdf.text('Document Title:', 20, 40);
        pdf.setFont('helvetica', 'normal');
        pdf.text(doc.title, 60, 40, { maxWidth: 80 });

        pdf.setFont('helvetica', 'bold');
        pdf.text('Document ID:', 20, 60);
        pdf.setFont('helvetica', 'normal');
        pdf.text(doc.id, 60, 60, { maxWidth: 80 });
        
        const creationEntry = doc.trackingHistory[0];
        if (creationEntry) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Created By:', 20, 80);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`${creationEntry.user.name} (${creationEntry.fromOffice})`, 60, 80);

            pdf.setFont('helvetica', 'bold');
            pdf.text('Sent To:', 20, 90);
            pdf.setFont('helvetica', 'normal');
            pdf.text(String(creationEntry.toOffice), 60, 90);

            pdf.setFont('helvetica', 'bold');
            pdf.text('Date Created:', 20, 100);
            pdf.setFont('helvetica', 'normal');
            pdf.text(new Date(creationEntry.timestamp).toLocaleString(), 60, 100);
        }

        pdf.setLineWidth(0.5);
        pdf.line(20, 120, 190, 120);

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Please attach this slip to the physical copy of the document for tracking purposes.', 105, 130, { align: 'center' });

        pdf.save(`DocuTrack-Slip-${doc.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
        console.error("Failed to generate PDF tracking slip:", error);
    }
};

const App: React.FC = () => {
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [documents, setDocuments] = useLocalStorage<Document[]>('documents', []);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null);
  const [documentsToDelete, setDocumentsToDelete] = useState<Document[]>([]);
  const [documentToForward, setDocumentToForward] = useState<Document | null>(null);
  const [documentToViewHistory, setDocumentToViewHistory] = useState<Document | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<View>('inbox');

  useEffect(() => {
    // Seed initial admin user if none exist
    if (users.length === 0) {
      const adminUser: User = { id: 'admin-user', name: 'Admin', office: Office.Admin, password: 'admin' };
      setUsers([adminUser]);
      setDocuments([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Clear selection when view changes
    setSelectedDocuments([]);
  }, [activeView]);

  // --- Auth Handlers ---
  const handleLogin = (name: string, password?: string): boolean => {
    const user = users.find(u => u.name === name && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };
  
  const handleRegister = (user: Omit<User, 'id'>) => {
    if (users.find(u => u.name.toLowerCase() === user.name.toLowerCase())) {
        console.error("User already exists");
        return false;
    }
    const newUser = { ...user, id: new Date().toISOString() };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return true;
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // --- Modal Handlers ---
  const handleOpenAddModal = () => {
    setDocumentToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (doc: Document) => {
    setDocumentToEdit(doc);
    setIsFormModalOpen(true);
  };
  
  const handleOpenDeleteModal = (docs: Document[]) => {
    setDocumentsToDelete(docs);
    setIsConfirmModalOpen(true);
  };

  const handleOpenForwardModal = (doc: Document) => {
    setDocumentToForward(doc);
    setIsForwardModalOpen(true);
  }
  
  const handleOpenHistoryModal = (doc: Document) => {
    setDocumentToViewHistory(doc);
    setIsHistoryModalOpen(true);
  }

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsConfirmModalOpen(false);
    setIsForwardModalOpen(false);
    setIsHistoryModalOpen(false);
    setDocumentToEdit(null);
    setDocumentsToDelete([]);
    setDocumentToForward(null);
    setDocumentToViewHistory(null);
  };

  // --- Document CUD+Forward+Receive Handlers ---
  const handleSaveDocument = (
    docData: Omit<Document, 'id' | 'lastUpdated' | 'ownerId' | 'ownerName' | 'ownerOffice' | 'currentOffice' | 'trackingHistory' | 'isReceived'>,
    destinationOffice?: Office
  ) => {
    if (!currentUser) return;
    
    if (documentToEdit) {
      // Editing existing document
      const updatedDoc = {
          ...documentToEdit,
          ...docData,
          lastUpdated: new Date().toISOString()
      };
      setDocuments(documents.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    } else {
      // Creating new document
      if (!destinationOffice) { 
          console.error("Destination office is required for new documents");
          return;
      }
      const newDoc: Document = {
        ...docData,
        id: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        ownerOffice: currentUser.office,
        currentOffice: destinationOffice,
        isReceived: false,
        trackingHistory: [{
            fromOffice: currentUser.office,
            toOffice: destinationOffice,
            action: 'Created',
            timestamp: new Date().toISOString(),
            user: { id: currentUser.id, name: currentUser.name }
        }]
      };
      setDocuments([...documents, newDoc]);
      generateTrackingSlipPdf(newDoc);
    }
    handleCloseModals();
  };

  const handleConfirmDelete = () => {
    if (documentsToDelete.length > 0) {
      const idsToDelete = documentsToDelete.map(d => d.id);
      setDocuments(documents.filter(d => !idsToDelete.includes(d.id)));
      setSelectedDocuments(prev => prev.filter(id => !idsToDelete.includes(id)));
    }
    handleCloseModals();
  };

  const handleForwardDocument = (doc: Document, targetOffice: Office) => {
    if (!currentUser) return;

    const updatedDoc: Document = {
      ...doc,
      currentOffice: targetOffice,
      lastUpdated: new Date().toISOString(),
      isReceived: false,
      trackingHistory: [
        ...doc.trackingHistory,
        {
          fromOffice: currentUser.office,
          toOffice: targetOffice,
          action: 'Forwarded',
          timestamp: new Date().toISOString(),
          user: { id: currentUser.id, name: currentUser.name }
        }
      ]
    };
    setDocuments(documents.map(d => d.id === doc.id ? updatedDoc : d));
    handleCloseModals();
  };

  const handleReceiveDocument = (doc: Document) => {
      if (!currentUser) return;

      const updatedDoc: Document = {
          ...doc,
          isReceived: true,
          lastUpdated: new Date().toISOString(),
          trackingHistory: [
              ...doc.trackingHistory,
              {
                  fromOffice: doc.currentOffice,
                  toOffice: null,
                  action: 'Received',
                  timestamp: new Date().toISOString(),
                  user: { id: currentUser.id, name: currentUser.name }
              }
          ]
      };
      setDocuments(documents.map(d => d.id === doc.id ? updatedDoc : d));
  };
  
  const handleQrScanSuccess = (docId: string) => {
    if (!currentUser) return;

    const docToReceive = documents.find(d => d.id === docId);

    if (!docToReceive) {
        alert("Error: Document with this QR code not found.");
        return;
    }

    if (docToReceive.currentOffice !== currentUser.office) {
        alert(`Error: This document is for the ${docToReceive.currentOffice}, not your office (${currentUser.office}).`);
        return;
    }

    if (docToReceive.isReceived) {
        alert(`Info: The document "${docToReceive.title}" has already been received.`);
        return;
    }

    handleReceiveDocument(docToReceive);
    alert(`Success: Document "${docToReceive.title}" has been received at your office.`);
  };


  // --- Filtering and Display Logic ---
  const filteredDocuments = useMemo(() => {
    if (!currentUser) return [];

    const lowercasedSearchTerm = searchTerm.toLowerCase();
    
    let docsToView: Document[];
    if (activeView === 'sent') {
      // Shows documents the current user created.
      docsToView = documents.filter(doc => doc.ownerId === currentUser.id);
    } else if (activeView === 'inbox') {
      if (currentUser.office === Office.Admin) {
        docsToView = documents;
      } else {
        // Shows documents at the user's office that have already been received.
        docsToView = documents.filter(doc => doc.currentOffice === currentUser.office && doc.isReceived);
      }
    } else { // 'received'
      if (currentUser.office === Office.Admin) {
        // Admin's "Received Documents" is a work queue of pending documents across all offices.
        docsToView = documents.filter(doc => !doc.isReceived);
      } else {
        // Non-admin's "Received Documents" is their queue of documents to receive.
        docsToView = documents.filter(doc => doc.currentOffice === currentUser.office && !doc.isReceived);
      }
    }

    return docsToView.filter(doc =>
      doc.title.toLowerCase().includes(lowercasedSearchTerm) ||
      doc.ownerName.toLowerCase().includes(lowercasedSearchTerm)
    ).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }, [documents, searchTerm, currentUser, activeView]);

  // --- Bulk Action Handlers ---
  const handleToggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => 
        prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };
  
  const handleToggleAllSelections = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
        setSelectedDocuments([]);
    } else {
        setSelectedDocuments(filteredDocuments.map(d => d.id));
    }
  };

  const handleBulkReceive = () => {
    if (!currentUser) return;
    const docsToReceive = documents.filter(doc => 
        selectedDocuments.includes(doc.id) &&
        (doc.currentOffice === currentUser.office || currentUser.office === Office.Admin) &&
        !doc.isReceived
    );
    if (docsToReceive.length === 0) {
        alert("None of the selected documents are available to be received at your office.");
        return;
    }
    const receivedIds = docsToReceive.map(d => d.id);
    const updatedDocs = documents.map(doc => {
        if (receivedIds.includes(doc.id)) {
            return {
                ...doc,
                isReceived: true,
                lastUpdated: new Date().toISOString(),
                trackingHistory: [
                    ...doc.trackingHistory,
                    {
                        fromOffice: doc.currentOffice,
                        toOffice: null,
                        action: 'Received' as const,
                        timestamp: new Date().toISOString(),
                        user: { id: currentUser.id, name: currentUser.name }
                    }
                ]
            };
        }
        return doc;
    });
    setDocuments(updatedDocs);
    setSelectedDocuments([]);
    alert(`Successfully received ${docsToReceive.length} document(s).`);
  };

  const handleBulkDelete = () => {
      const docsToDelete = documents.filter(doc => selectedDocuments.includes(doc.id));
      handleOpenDeleteModal(docsToDelete);
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} onRegister={handleRegister} />;
  }
  
  const inboxCount = documents.filter(d => d.currentOffice === currentUser.office && d.isReceived).length;
  const sentCount = documents.filter(d => d.ownerId === currentUser.id).length;
  const adminReceivedCount = documents.filter(doc => !doc.isReceived).length;
  const nonAdminReceivedCount = documents.filter(d => d.currentOffice === currentUser.office && !d.isReceived).length;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Document Dashboard</h1>
              <p className="text-slate-500 mt-1">Manage and track all your documents in one place.</p>
            </div>
            <div className="flex flex-col sm:flex-row-reverse gap-3 w-full md:w-auto">
                <button
                onClick={handleOpenAddModal}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
                >
                <PlusIcon />
                Upload Document
                </button>
                 <button
                    onClick={() => setIsScannerModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-slate-800 transition-colors duration-200"
                >
                    <QrCodeIcon />
                    Scan to Receive
                </button>
            </div>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setActiveView('inbox')}
                    className={`${activeView === 'inbox' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    {currentUser.office === Office.Admin ? `All Documents (${documents.length})` : `Inbox (${inboxCount})`}
                </button>
                <button
                    onClick={() => setActiveView('sent')}
                    className={`${activeView === 'sent' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    Sent ({sentCount})
                </button>
                <button
                    onClick={() => setActiveView('received')}
                    className={`${activeView === 'received' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                   Received Documents ({currentUser.office === Office.Admin ? adminReceivedCount : nonAdminReceivedCount})
                </button>
            </nav>
          </div>
          
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search by title or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {selectedDocuments.length > 0 && (
             <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-6 flex justify-between items-center transition-all duration-300 ease-in-out">
                <span className="font-semibold text-indigo-800">{selectedDocuments.length} selected</span>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleBulkReceive}
                        className="flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-900 transition"
                    >
                        <CheckCircleIcon /> Receive
                    </button>
                    <button 
                        onClick={handleBulkDelete}
                        className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-800 transition"
                    >
                        <TrashIcon /> Delete
                    </button>
                </div>
             </div>
          )}

          {(activeView === 'received' && currentUser.office === Office.Admin) ? (
            <GroupedDocumentList
                documents={filteredDocuments}
                currentUser={currentUser}
                onEdit={handleOpenEditModal}
                onDelete={(doc) => handleOpenDeleteModal([doc])}
                onForward={handleOpenForwardModal}
                onReceive={handleReceiveDocument}
                onViewHistory={handleOpenHistoryModal}
                selectedDocuments={selectedDocuments}
                onToggleSelection={handleToggleDocumentSelection}
            />
          ) : (
            <DocumentList
                documents={filteredDocuments}
                currentUser={currentUser}
                onEdit={handleOpenEditModal}
                onDelete={(doc) => handleOpenDeleteModal([doc])}
                onForward={handleOpenForwardModal}
                onReceive={handleReceiveDocument}
                onViewHistory={handleOpenHistoryModal}
                selectedDocuments={selectedDocuments}
                onToggleSelection={handleToggleDocumentSelection}
                onToggleAllSelections={handleToggleAllSelections}
            />
          )}
        </div>
      </main>

      {isFormModalOpen && (
        <DocumentFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseModals}
          onSave={handleSaveDocument}
          documentToEdit={documentToEdit}
        />
      )}
      {isConfirmModalOpen && documentsToDelete.length > 0 && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={handleCloseModals}
          onConfirm={handleConfirmDelete}
          title={`Delete ${documentsToDelete.length} Document(s)`}
          message={`Are you sure you want to delete ${documentsToDelete.length} document(s)? This action cannot be undone.`}
        />
      )}
       {isForwardModalOpen && documentToForward && (
        <ForwardDocumentModal
          isOpen={isForwardModalOpen}
          onClose={handleCloseModals}
          onConfirm={handleForwardDocument}
          documentToForward={documentToForward}
        />
      )}
       {isHistoryModalOpen && documentToViewHistory && (
        <TrackingHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={handleCloseModals}
          document={documentToViewHistory}
        />
      )}
      {isScannerModalOpen && (
        <QrScannerModal
            isOpen={isScannerModalOpen}
            onClose={() => setIsScannerModalOpen(false)}
            onScanSuccess={handleQrScanSuccess}
        />
      )}
    </div>
  );
};

export default App;