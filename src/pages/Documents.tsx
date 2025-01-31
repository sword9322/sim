import { FileText } from "lucide-react";

const Documents = () => {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-2 mb-8">
        <FileText size={24} />
        <h1 className="text-2xl font-semibold">Documents</h1>
      </div>
      <div className="bg-white rounded-lg border border-border p-6">
        <p className="text-muted-foreground">Document management coming soon...</p>
      </div>
    </div>
  );
};

export default Documents;