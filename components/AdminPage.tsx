import React, { useRef } from 'react';
import { useTranslation } from '../i18n';
import { AdminIcon, DocumentIcon, UploadIcon, XCircleIcon } from './icons';

type UploadedFile = { name: string; type: string; data: string; };

interface AdminPageProps {
    onIndexDocument: (file: UploadedFile | null) => void;
    indexedDocumentName: string | null;
    isIndexing: boolean;
    indexingStatus: string;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onIndexDocument, indexedDocumentName, isIndexing, indexingStatus }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const uploadedFile = {
                    name: file.name,
                    type: file.type,
                    data: e.target?.result as string,
                };
                onIndexDocument(uploadedFile);
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClear = () => {
        onIndexDocument(null);
    };

    return (
        <div className="h-full bg-black/30 backdrop-blur-md rounded-lg border border-blue-400/30 shadow-2xl p-4 md:p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <AdminIcon className="w-16 h-16 text-cyan-300 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-cyan-200 mb-2">
                        {t('admin.title')}
                    </h2>
                    <p className="text-gray-300">
                        {t('admin.description')}
                    </p>
                </div>

                <div className="bg-black/20 p-6 rounded-lg border border-blue-400/20">
                    <h3 className="text-lg font-semibold text-white mb-4">{t('admin.currentKnowledge')}</h3>
                    {isIndexing ? (
                        <div className="flex items-center gap-3 text-cyan-200">
                             <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                             <span>{indexingStatus || t('admin.indexing')}</span>
                        </div>
                    ) : indexedDocumentName ? (
                        <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
                            <div className="flex items-center gap-3">
                                <DocumentIcon className="w-6 h-6 text-cyan-300" />
                                <span className="font-medium text-white">{indexedDocumentName}</span>
                            </div>
                            <button onClick={handleClear} className="text-gray-400 hover:text-red-400 transition-colors" title={t('admin.clearKnowledge')}>
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">{t('admin.noKnowledge')}</p>
                    )}
                </div>

                <div className="mt-6">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="application/pdf"
                        disabled={isIndexing}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isIndexing}
                        className="w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        <UploadIcon className="w-6 h-6" />
                        <span>{indexedDocumentName ? t('admin.changeFile') : t('admin.upload')}</span>
                    </button>
                </div>

            </div>
        </div>
    );
};