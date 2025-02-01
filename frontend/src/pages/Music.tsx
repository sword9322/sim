import { Music as MusicIcon, Plus, Search, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import SearchBar from "@/components/SearchBar";
import { useLocation } from 'react-router-dom';

interface Music {
  id: number;
  title: string;
  artist: string;
  file_path: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 9;

const Music = () => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const [filteredMusic, setFilteredMusic] = useState<Music[]>([]);
  const location = useLocation() as { state: { selectedId?: number } };

  useEffect(() => {
    fetchMusic();
  }, []);

  useEffect(() => {
    if (location.state?.selectedId) {
      const selectedMusic = musicList.find(m => m.id === location.state.selectedId);
      if (selectedMusic) {
        const element = document.getElementById(`music-${selectedMusic.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          element.classList.add('highlight');
          setTimeout(() => element.classList.remove('highlight'), 2000);
        }
      }
      window.history.replaceState({}, document.title);
    }
  }, [musicList, location.state]);

  const fetchMusic = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/music.php`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setMusicList(data.data);
        setFilteredMusic(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch music",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = musicList.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.artist?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMusic(filtered);
    setCurrentPage(1); // Reset to first page when searching
  };

  const totalPages = Math.ceil(filteredMusic.length / ITEMS_PER_PAGE);
  const paginatedMusic = filteredMusic.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('file', file);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/music.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload music');
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        toast({
          title: "Success",
          description: "Music uploaded successfully",
        });
        
        fetchMusic();
        setTitle("");
        setArtist("");
        setFile(null);
        setIsOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload music",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/music.php?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete music');
      }

      const data = await response.json();
      if (data.status === 'success') {
        toast({
          title: "Success",
          description: "Music deleted successfully",
        });
        fetchMusic(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to delete music');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete music",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 min-h-screen animate-fade-up flex flex-col">
      <div className="flex items-center gap-2">
          <MusicIcon size={24} className="text-blue-600" />
          <h1 className="text-3xl font-semibold text-gray-900">Music</h1>
        </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
       
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2" size={16} />
              Add Music
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white rounded-lg p-6 shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Add New Music
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter music title"
                  required
                  className="shadow-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist" className="text-gray-700">Artist</Label>
                <Input
                  id="artist"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Enter artist name"
                  required
                  className="shadow-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file" className="text-gray-700">File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".mp3,.wav,.ogg"
                  onChange={(e) => e.target.files && setFile(e.target.files[0])}
                  required
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Upload Music
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : paginatedMusic.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedMusic.map((music) => (
              <Card key={music.id} id={`music-${music.id}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <MusicIcon size={20} className="text-gray-600 flex-shrink-0" />
                      <div className="truncate">
                        <h3 className="font-medium text-gray-900 truncate">{music.title}</h3>
                        <p className="text-sm text-gray-500 truncate">{music.artist}</p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white rounded-lg p-6 shadow-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-lg font-semibold text-gray-900">Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
                            This action cannot be undone. This will permanently delete the music.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(music.id)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Pagination className="mt-8 overflow-x-auto">
            <PaginationContent className="flex-wrap justify-center gap-2">
              <PaginationItem>
                {currentPage === 1 ? (
                  <Button variant="outline" size="icon" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                ) : (
                  <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
                )}
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i + 1} className="hidden sm:block">
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem className="sm:hidden">
                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                {currentPage === totalPages ? (
                  <Button variant="outline" size="icon" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-600">
            {searchQuery ? "No music matches your search." : "No music added yet. Click the 'Add Music' button to get started."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Music;