import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, ShieldCheck } from 'lucide-react';

export const VerificationView: React.FC = () => {
  const [isUploaded, setIsUploaded] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    // Mock upload
    setTimeout(() => {
      setIsUploaded(true);
    }, 1000);
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop } as any);

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-emerald-100 text-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Verification Request</h1>
        <p className="text-slate-500 font-medium text-sm max-w-lg mx-auto mb-8">
          Upload your NID and University ID to get the verified badge and stand out to parents.
        </p>

        {isUploaded ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 flex flex-col items-center">
             <CheckCircle className="w-12 h-12 text-[#10B981] mb-4" />
             <h3 className="text-lg font-bold text-slate-900">Documents Uploaded</h3>
             <p className="text-sm text-slate-600 mt-2">Your verification request is pending admin review.</p>
          </div>
        ) : (
          <div {...getRootProps()} className={`border-2 border-dashed \${isDragActive ? 'border-[#10B981] bg-emerald-50' : 'border-slate-300 bg-slate-50'} p-12 text-center rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors`}>
            <input {...getInputProps()} />
            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="font-bold text-slate-700 text-lg">Drag & drop your documents here</p>
            <p className="text-sm text-slate-500 mt-2">or click to browse files (JPEG, PNG, PDF)</p>
          </div>
        )}
      </div>
    </div>
  );
};
