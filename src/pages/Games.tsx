import { Gamepad2, Plus, Trash2, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Game {
  id: number;
  title: string;
  url: string;
  thumbnail_url?: string;
  description?: string;
  created_at: string;
}

const Games = () => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  const fetchGames = async () => {
    try {
      const response = await fetch('http://localhost:8888/backend/api/games.php', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setGames(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch games",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/backend/api/games.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          url,
          thumbnail_url: thumbnailUrl,
          description,
        }),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        toast({
          title: "Success",
          description: "Game added successfully",
        });
        
        setTitle("");
        setUrl("");
        setThumbnailUrl("");
        setDescription("");
        setIsOpen(false);
        fetchGames();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add game",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/backend/api/games.php?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        toast({
          title: "Success",
          description: "Game deleted successfully",
        });
        fetchGames();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete game",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="animate-fade-up">
      {isFullscreen && selectedGame ? (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="h-full flex flex-col">
            <div className="p-4 flex items-center justify-between bg-card border-b">
              <h2 className="text-xl font-semibold">{selectedGame.title}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(false)}
              >
                <Minimize2 className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 relative">
              <iframe
                src={selectedGame.url}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Gamepad2 size={24} />
              <h1 className="text-2xl font-semibold">Games</h1>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2" size={16} />
                  Add Game
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Game</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter game title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">Game URL</Label>
                    <Input
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Enter game URL"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
                    <Input
                      id="thumbnail"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="Enter thumbnail URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter game description"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Add Game</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.length > 0 ? (
              games.map((game) => (
                <div key={game.id} className="bg-white rounded-lg border border-border p-4">
                  {selectedGame?.id === game.id ? (
                    <div className="aspect-video mb-4 relative">
                      <iframe
                        src={game.url}
                        className="w-full h-full rounded-md"
                        allowFullScreen
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-2 right-2 bg-background/50 backdrop-blur-sm hover:bg-background"
                        onClick={() => setIsFullscreen(true)}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="aspect-video mb-4 bg-muted rounded-md cursor-pointer relative group"
                      onClick={() => setSelectedGame(game)}
                    >
                      {game.thumbnail_url ? (
                        <img 
                          src={game.thumbnail_url} 
                          alt={game.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{game.title}</h3>
                      {game.description && (
                        <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {selectedGame?.id !== game.id && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedGame(game)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(game.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-lg border border-border p-6">
                <p className="text-muted-foreground">
                  No games added yet. Click the "Add Game" button to get started.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Games;