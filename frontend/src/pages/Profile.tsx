import React, { useState, useRef } from "react";
import { useUser } from "../context/UserContext";

interface ProfileForm {
  name?: string;
  role?: string;
  created_at?: string;
  profilePicture?: string;
}

const Profile: React.FC = () => {
  const { user, userInfo } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<ProfileForm>(userInfo || {});
  const [image, setImage] = useState<string | null>(
    userInfo?.profilePicture || null
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    setForm(userInfo || {});
    setImage(userInfo?.profilePicture || null);
  }, [userInfo]);

  // Helper function to process image data and handle base64 URLs
  const processImageData = (imageData: string | null): string | null => {
    if (!imageData) return null;
    
    // If it's already a data URL (base64), return as is
    if (imageData.startsWith('data:image/')) {
      return imageData;
    }
    
    // If it's a base64 string without data URL prefix, add the prefix
    if (imageData.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
      // Try to detect image type from the base64 content
      // For now, we'll assume it's a JPEG, but you can enhance this logic
      return `data:image/jpeg;base64,${imageData}`;
    }
    
    // If it's a regular URL, return as is
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      return imageData;
    }
    
    // If it's a relative path, return as is
    return imageData;
  };

  // Get the processed image URL for display
  const getImageUrl = (): string | null => {
    return processImageData(image);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        setUploading(false);
      };
      reader.onerror = () => {
        setError("Failed to process image");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to process image");
      setUploading(false);
    }
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm(userInfo || {});
    setImage(userInfo?.profilePicture || null);
  };
  
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (!user?.id) throw new Error("User ID not found");
      const {
        data: { session },
      } = await import("../lib/supabase").then((m) =>
        m.supabase.auth.getSession()
      );
      const token = session?.access_token;
      if (!token) throw new Error("No authentication token found");
      
      // Process the image data before sending to backend
      const processedImage = processImageData(image);
      
      const response = await fetch("http://localhost:3000/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          name: form.name,
          profilePicture: processedImage,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile");
      }
      setSuccess("Profile updated successfully!");
      setEditMode(false);
      // Optionally update local userInfo here if needed
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get user role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'creator':
        return 'Content Creator';
      case 'reviewer':
        return 'Content Reviewer';
      case 'admin':
        return 'Administrator';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-card-foreground">Profile</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your account settings and preferences
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!editMode ? (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                      disabled={uploading || saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Profile Picture</h2>
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20">
                    {getImageUrl() ? (
                      <img
                        src={getImageUrl()!}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to default avatar if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-muted flex items-center justify-center ${getImageUrl() ? 'hidden' : ''}`}>
                      <svg
                        className="w-20 h-20 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  
                  {editMode && (
                    <button
                      className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Upload profile image"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  disabled={uploading}
                />
                
                <p className="text-sm text-muted-foreground text-center">
                  {editMode 
                    ? "Click the camera icon to upload a new profile picture"
                    : "Your profile picture will be displayed across the platform"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-6">Personal Information</h2>
              
              {/* Status Messages */}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className="text-sm font-medium">{success}</span>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Name Field */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="text-sm font-medium text-card-foreground">
                    Full Name
                  </label>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="name"
                      value={form.name || ""}
                      onChange={handleChange}
                      disabled={!editMode}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed transition-colors"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="text-sm font-medium text-card-foreground">
                    Email Address
                  </label>
                  <div className="md:col-span-2">
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-input bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Role Field */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="text-sm font-medium text-card-foreground">
                    Role
                  </label>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={getRoleDisplayName(user?.role || "creator")}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-input bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Member Since Field */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="text-sm font-medium text-card-foreground">
                    Member Since
                  </label>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={formatDate(user?.created_at || "")}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-input bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* User ID Field */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="text-sm font-medium text-card-foreground">
                    User ID
                  </label>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={user?.id || ""}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-input bg-muted text-muted-foreground cursor-not-allowed font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions Section */}
            <div className="mt-6 bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Account Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                      <div>
                        <div className="font-medium text-card-foreground">Change Password</div>
                        <div className="text-sm text-muted-foreground">Update your account password</div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </button>
                
                <button className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <div>
                        <div className="font-medium text-card-foreground">Preferences</div>
                        <div className="text-sm text-muted-foreground">Manage your account preferences</div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
