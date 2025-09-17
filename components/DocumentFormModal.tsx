import React, { useState, useEffect } from 'react';
import { Document, Status, Attachment, Office } from '../types';
import { generateSummary } from '../services/geminiService';
import { CloseIcon, SparklesIcon, UploadIcon } from './Icons';

interface DocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    doc: Omit<Document, 'id' | 'lastUpdated' | 'ownerId' | 'ownerName' | 'ownerOffice' | 'currentOffice' | 'trackingHistory' | 'isReceived'>,
    destinationOffice?: Office
  ) => void;
  documentToEdit: Document | null;
}

const DocumentFormModal: React.FC<DocumentFormModalProps> = ({ isOpen, onClose, onSave, documentToEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    status: Status.Draft,
    summary: '',
    content: '',
  });
  
  const [destinationOffice, setDestinationOffice] = useState<Office | ''>('');
  const [attachment, setAttachment] = useState<Attachment | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (documentToEdit) {
            setFormData({
                title: documentToEdit.title,
                status: documentToEdit.status,
                summary: documentToEdit.summary,
                content: documentToEdit.content,
            });
            setAttachment(documentToEdit.attachment);
            if (documentToEdit.attachment?.mimeType.startsWith('image/')) {
                setPreviewUrl(`data:${documentToEdit.attachment.mimeType};base64,${documentToEdit.attachment.data}`);
            } else {
                setPreviewUrl(null);
            }
        } else {
            // Reset form for new document
            setFormData({ title: '', status: Status.Draft, summary: '', content: '' });
            setDestinationOffice('');
            setAttachment(undefined);
            setPreviewUrl(null);
            setError('');
        }
    }
  }, [documentToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
        const result = reader.result as string;
        if (file.type.startsWith('image/')) {
            const base64Data = result.split(',')[1];
            setAttachment({ fileName: file.name, mimeType: file.type, data: base64Data });
            setFormData(prev => ({ ...prev, content: '' }));
            setPreviewUrl(result);
        } else if (file.type.startsWith('text/')) {
            setFormData(prev => ({ ...prev, content: result }));
            setAttachment(undefined);
            setPreviewUrl(null);
        } else {
            setError(`Unsupported file type: ${file.type}. Please upload a text or image file.`);
        }
    };
    reader.onerror = () => {
        setError('Failed to read file.');
    };

    if (file.type.startsWith('image/') || file.type.startsWith('text/')) {
        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else { // text
            reader.readAsText(file);
        }
    } else {
         setError(`Unsupported file type: ${file.type}. Please upload a text or image file.`);
         e.target.value = '';
    }
  };

  const handleGenerateSummary = async () => {
    if (!formData.content && !attachment) {
      setError('Please provide document content or upload a file to summarize.');
      return;
    }
    setIsGenerating(true);
    setError('');
    try {
      const summary = await generateSummary({ content: formData.content, attachment });
      setFormData(prev => ({ ...prev, summary }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.title) {
        setError('Title is required.');
        return;
    }
    if (!documentToEdit && !destinationOffice) {
        setError('Please select a destination office.');
        return;
    }
    onSave({
      title: formData.title,
      status: formData.status as Status,
      summary: formData.summary,
      content: formData.content,
      attachment,
    },
    documentToEdit ? undefined : destinationOffice as Office);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">{documentToEdit ? 'Edit Document' : 'Upload New Document'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select name="status" id="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
             {!documentToEdit && (
              <div>
                <label htmlFor="destinationOffice" className="block text-sm font-medium text-slate-700 mb-1">
                  Send To Office
                </label>
                <select
                  name="destinationOffice"
                  id="destinationOffice"
                  value={destinationOffice}
                  onChange={(e) => setDestinationOffice(e.target.value as Office)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="" disabled>-- Select a destination --</option>
                  {Object.values(Office).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Document File (Optional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <UploadIcon />
                        <div className="flex text-sm text-slate-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="text/plain,text/markdown,image/png,image/jpeg" />
                            </label>
                        </div>
                        <p className="text-xs text-slate-500">TXT, MD, PNG, JPG</p>
                    </div>
                </div>
                {(attachment || formData.content) && (
                    <div className="mt-4 p-3 border rounded-lg bg-slate-50">
                        <h4 className="text-sm font-medium text-slate-800">Preview:</h4>
                        {previewUrl && <img src={previewUrl} alt="Preview" className="mt-2 rounded-lg max-h-40 w-auto shadow-sm" />}
                        {attachment && !previewUrl && <p className="text-sm text-slate-600 mt-1 font-mono">{attachment.fileName}</p>}
                        {formData.content && (
                            <pre className="mt-2 p-3 bg-white rounded-md text-sm text-slate-700 max-h-40 overflow-auto border">{formData.content}</pre>
                        )}
                    </div>
                )}
            </div>
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-1">AI Summary</label>
              <div className="relative">
                <textarea name="summary" id="summary" value={formData.summary} onChange={handleChange} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="A brief summary of the document..."></textarea>
                <button type="button" onClick={handleGenerateSummary} disabled={isGenerating || (!formData.content && !attachment)} className="absolute bottom-2 right-2 flex items-center gap-2 bg-indigo-100 text-indigo-700 font-semibold py-1 px-3 rounded-md text-sm hover:bg-indigo-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition">
                  {isGenerating ? 'Generating...' : <><SparklesIcon /> Generate</>}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-xl">
            <button type="button" onClick={onClose} className="bg-white text-slate-700 border border-slate-300 py-2 px-4 rounded-lg font-semibold hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold shadow-sm hover:bg-indigo-700 transition">Save Document</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentFormModal;