import React, { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { CloseIcon } from './Icons';

interface QrScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (decodedText: string) => void;
}

const QrScannerModal: React.FC<QrScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true
        };

        const handleSuccess = (decodedText: string) => {
            onScanSuccess(decodedText);
            if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
                 scanner.stop().catch(err => console.error("Error stopping the scanner on success.", err));
            }
            onClose();
        };

        const handleError = (errorMessage: string) => {
            // This error callback is called frequently, so we typically ignore it.
        };

        scanner.start(
            { facingMode: "environment" },
            config,
            handleSuccess,
            handleError
        ).catch(err => {
            console.error("Failed to start QR scanner.", err);
            onClose(); 
        });

        return () => {
            if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
                scannerRef.current.stop()
                    .catch(err => console.error("Error stopping the scanner on cleanup.", err));
            }
        };

    }, [isOpen, onScanSuccess, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">Scan Document QR Code</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition" aria-label="Close scanner">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 flex-grow">
                    <div id="qr-reader" style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}></div>
                    <p className="text-center text-sm text-slate-500 mt-4">Position the QR code within the frame to automatically receive the document.</p>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-xl">
                    <button type="button" onClick={onClose} className="bg-white text-slate-700 border border-slate-300 py-2 px-4 rounded-lg font-semibold hover:bg-slate-50 transition">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default QrScannerModal;
