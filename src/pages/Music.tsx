import { Music2, Plus } from "lucide-react";
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

const Music = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an audio file to upload",
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
      title: "Music added",
      description: `Successfully added music: ${title}`,
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
          <Music2 size={24} />
          <h1 className="text-2xl font-semibold">Music</h1>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" size={16} />
              Add Music
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Music</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter music title"
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
                  accept="audio/*,.mp3,.wav,.ogg"
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected file: {file.name}
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit">Upload Music</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-white rounded-lg border border-border p-6">
        <p className="text-muted-foreground">No music added yet. Click the "Add Music" button to get started.</p>
      </div>
    </div>
  );
};

export default Music;