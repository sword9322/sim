import React, { useState, useEffect } from 'react';
import { FileText, Music2, Film, Gamepad2, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface StorageStats {
  total_space: number;
  used_space: number;
  file_counts: {
    documents: number;
    music: number;
    videos: number;
    games: number;
  };
  space_by_type: {
    documents: number;
    music: number;
    videos: number;
  };
}

const Dashboard = () => {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [music, setMusic] = useState([]);
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchMusic();
    fetchVideos();
    fetchDocuments();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8888/backend/api/dashboard.php', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setStats(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMusic = async () => {
    try {
      const response = await fetch('http://localhost:8888/backend/api/music.php', {
        credentials: 'include',
      });
      const data = await response.json();
      setMusic(data);
    } catch (error) {
      console.error('Error fetching music:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch('http://localhost:8888/backend/api/videos.php', {
        credentials: 'include',
      });
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:8888/backend/api/documents.php', {
        credentials: 'include',
      });
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getUsedSpacePercentage = () => {
    if (!stats) return 0;
    return (stats.used_space / stats.total_space) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-up">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      
      {/* Storage Overview */}
      <Card className="mb-6 hover:shadow-lg transition-all duration-300 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <HardDrive className="h-5 w-5" />
            Storage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-1 bg-secondary rounded-lg">
              <Progress 
                value={getUsedSpacePercentage()} 
                className="h-2.5 rounded-md [&>div]:bg-primary/90 [&>div]:rounded-md bg-background/50"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Used: {stats && formatSize(stats.used_space)}</span>
              <span>Total: {stats && formatSize(stats.total_space)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Type Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Documents", icon: FileText, count: stats?.file_counts.documents, size: stats?.space_by_type.documents, color: "rgb(99, 102, 241)" },
          { title: "Music", icon: Music2, count: stats?.file_counts.music, size: stats?.space_by_type.music, color: "rgb(34, 197, 94)" },
          { title: "Videos", icon: Film, count: stats?.file_counts.videos, size: stats?.space_by_type.videos, color: "rgb(234, 179, 8)" },
          { title: "Games", icon: Gamepad2, count: stats?.file_counts.games, color: "rgb(239, 68, 68)" },
        ].map((item) => (
          <Card 
            key={item.title}
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className="h-4 w-4" style={{ color: item.color }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: item.color }}>{item.count}</div>
              {item.size && (
                <p className="text-xs text-muted-foreground">
                  {formatSize(item.size)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 