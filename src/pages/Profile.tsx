import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiCamera, FiSave, FiAlertCircle } from 'react-icons/fi';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface ProfileFormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile = () => {
  const { user, updateUserContext } = useAuth();
  const [profileImage, setProfileImage] = useState<string>(user?.profileImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();

    // Cleanup function
    return () => {
      // Clean up any subscriptions or intervals here
    };
  }, []); // Empty dependency array

  const fetchProfile = async () => {
    if (!isLoading) return; // Prevent fetching if already loaded
    
    try {
      const response = await fetch('http://localhost:8888/backend/api/profile.php', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.status === 'success' && data.data.imageUrl) {
        setProfileImage(data.data.imageUrl);
        if (user) {
          updateUserContext({
            ...user,
            profileImage: data.data.imageUrl
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('profile_image', file);

    try {
      const response = await fetch('http://localhost:8888/backend/api/profile.php', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'success') {
        setProfileImage(data.data.imageUrl);
        if (user) {
          updateUserContext({
            ...user,
            profileImage: data.data.imageUrl
          });
        }
        setMessage({ type: 'success', text: 'Profile image updated successfully' });
        fetchProfile();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update profile image'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    try {
      const response = await fetch('http://localhost:8888/backend/api/profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'update',
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        if (user) {
          updateUserContext({ 
            ...user, 
            name: formData.name, 
            email: formData.email 
          });
        }
        setMessage({ type: 'success', text: data.message });
        
        // Clear password fields after successful update
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        fetchProfile();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile. Please try again.' 
      });
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Profile Settings</h1>
          
          {/* Profile Image Section */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div 
                onClick={handleImageClick}
                className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden cursor-pointer 
                          border-2 border-primary/20 hover:border-primary transition-colors duration-300
                          hover:shadow-lg transform hover:scale-105 transition-transform duration-300"
              >
                {profileImage ? (
                  <img
                    src={`${profileImage}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-accent flex items-center justify-center">
                    <FiCamera size={24} className="text-primary" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`text-center mb-4 ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {message.text}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            <div className="pt-4 border-t">
              <h2 className="text-lg font-semibold mb-4">Change Password</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 
                             transform hover:scale-105 transition-all duration-300"
              >
                <FiSave size={18} />
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;