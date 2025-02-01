import React from 'react';
import { FileText, File } from 'lucide-react';

interface DocumentPreviewProps {
  document: {
    id: string;
    title: string;
    type: string;
    url: string;
  };
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document }) => {
  const getPreviewContent = () => {
    const fileType = document.type.toLowerCase();

    if (fileType.includes('pdf')) {
      return (
        <iframe
          src={`${document.url}#toolbar=0`}
          className="w-full h-[500px] rounded-lg border border-border"
          title={document.title}
        />
      );
    } else if (
      fileType.includes('word') ||
      fileType.includes('powerpoint') ||
      fileType.includes('excel')
    ) {
      // Using Microsoft Office Online Viewer
      const encodedUrl = encodeURIComponent(document.url);
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`}
          className="w-full h-[500px] rounded-lg border border-border"
          title={document.title}
        />
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-[500px] border border-border rounded-lg bg-secondary/30">
          <File className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Preview not available for this file type</p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-medium">{document.title}</h3>
      </div>
      {getPreviewContent()}
    </div>
  );
};

export default DocumentPreview; 