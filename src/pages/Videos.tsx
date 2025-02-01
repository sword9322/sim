import { Film, Plus, Trash2 } from "lucide-react";
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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: number;
  title: string;
  file_path: string;
  created_at: string;
  duration: number;
}

const Videos = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const { toast } = useToast();

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/videos.php`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setVideos(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch videos",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a video file to upload",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/videos.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        toast({
          title: "Success",
          description: "Video uploaded successfully",
        });
        
        setTitle("");
        setFile(null);
        setIsOpen(false);
        fetchVideos(); // Refresh the videos list after upload
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/videos.php?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        toast({
          title: "Success",
          description: "Video deleted successfully",
        });
        fetchVideos(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 min-h-screen animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Film size={24} className="text-blue-600" />
          <h1 className="text-3xl font-semibold text-gray-900">Videos</h1>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2" size={16} />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white rounded-lg p-6 shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Add New Video</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  required
                  className="shadow-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file" className="text-gray-700">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  accept="video/*,.mp4,.webm,.ogg"
                  className="shadow-sm border-gray-300 rounded-md"
                />
                {file && (
                  <p className="text-sm text-gray-600">
                    Selected file: {file.name}
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Upload Video
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="relative">
                <video 
                  controls 
                  className="w-full h-48 object-cover rounded-md mb-4"
                  src={`${import.meta.env.VITE_API_URL}/uploads/videos/${video.file_path.split('/').pop()}`}
                >
                  Your browser does not support the video tag.
                </video>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  onClick={() => handleDelete(video.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-gray-900">{video.title}</h3>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{new Date(video.created_at).toLocaleDateString()}</span>
                <span>{formatDuration(video.duration)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-600">
              No videos added yet. Click the "Add Video" button to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos;