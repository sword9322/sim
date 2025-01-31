import { Film, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Videos = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a video file to upload",
        variant: "destructive",
      });
      return;
    }
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    
    // For now, we'll just show a success message
    toast({
      title: "Video added",
      description: `Successfully added video: ${title}`,
    });
    
    // Reset form
    setTitle("");
    setFile(null);
    setIsOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Film size={24} />
          <h1 className="text-2xl font-semibold">Videos</h1>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" size={16} />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Video</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  accept="video/*,.mp4,.webm,.ogg"
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected file: {file.name}
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit">Upload Video</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-white rounded-lg border border-border p-6">
        <p className="text-muted-foreground">No videos added yet. Click the "Add Video" button to get started.</p>
      </div>
    </div>
  );
};

export default Videos;