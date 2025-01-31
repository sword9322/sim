import { Film } from "lucide-react";

const Videos = () => {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-2 mb-8">
        <Film size={24} />
        <h1 className="text-2xl font-semibold">Videos</h1>
      </div>
      <div className="bg-white rounded-lg border border-border p-6">
        <p className="text-muted-foreground">Video player coming soon...</p>
      </div>
    </div>
  );
};

export default Videos;