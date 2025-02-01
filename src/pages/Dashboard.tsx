import React, { useState, useEffect } from 'react';
import { FileText, Music2, Film, Gamepad2, HardDrive, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import DocumentPreview from '@/components/DocumentPreview';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Document {
  id: string;
  title: string;
  type: string;
  url: string;
  created_at: string;
}

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
  documents: Document[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [music, setMusic] = useState([]);
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    fetchStats();
    fetchMusic();
    fetchVideos();
    fetchDocuments();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard.php`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/music.php`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/videos.php`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents.php`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.status === 'success') {
        setDocuments(data.documents);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
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
    <div className="p-6 animate-fade-up min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>
      
      {/* Storage Overview */}
      <Card className="mb-8 bg-white rounded-lg shadow-lg p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <HardDrive className="h-6 w-6 text-blue-600" />
            Storage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-1 bg-gray-100 rounded-lg relative">
              <Progress 
                value={getUsedSpacePercentage()} 
                className="h-2.5 rounded-md [&>div]:bg-blue-600 [&>div]:rounded-md bg-gray-100"
              />
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-blue-600">
                {Math.round(getUsedSpacePercentage())}%
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Used: {stats && formatSize(stats.used_space)}</span>
              <span>Total: {stats && formatSize(stats.total_space)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Type Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Documents", icon: FileText, count: stats?.file_counts.documents, size: stats?.space_by_type.documents, color: "#3b82f6" },
          { title: "Music", icon: Music2, count: stats?.file_counts.music, size: stats?.space_by_type.music, color: "#10b981" },
          { title: "Videos", icon: Film, count: stats?.file_counts.videos, size: stats?.space_by_type.videos, color: "#f59e0b" },
          { title: "Games", icon: Gamepad2, count: stats?.file_counts.games, color: "#ef4444" },
        ].map((item) => (
          <Card 
            key={item.title}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4"
            style={{ borderLeftColor: item.color }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900">{item.title}</CardTitle>
              <item.icon className="h-5 w-5" style={{ color: item.color }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{item.count}</div>
              {item.size && (
                <p className="text-xs text-gray-500">
                  {formatSize(item.size)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Documents with Preview */}
      <Card className="mt-8 bg-white rounded-xl shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600 font-semibold">
            <FileText className="h-6 w-6" />
            Recent Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.slice(0, 6).map((doc) => (
              <Dialog key={doc.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="uppercase">{doc.type}</span>
                              <span>•</span>
                              <span>{new Date(doc.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-blue-600 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(doc.url, '_blank');
                            }}
                          >
                            <Eye className="h-5 w-5 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full">
                  <DocumentPreview document={doc} />
                </DialogContent>
              </Dialog>
            ))}
          </div>
          {documents.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 