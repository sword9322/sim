import { Music2 } from "lucide-react";

const Music = () => {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-2 mb-8">
        <Music2 size={24} />
        <h1 className="text-2xl font-semibold">Music</h1>
      </div>
      <div className="bg-white rounded-lg border border-border p-6">
        <p className="text-muted-foreground">Music player coming soon...</p>
      </div>
    </div>
  );
};

export default Music;