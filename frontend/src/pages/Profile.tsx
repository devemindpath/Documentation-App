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
    userInfo?.profileImage || null
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    setForm(userInfo || {});
    setImage(userInfo?.profileImage || null);
  }, [userInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // TODO: Implement actual upload logic (e.g., to Supabase Storage or backend)
    // For now, just show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm(userInfo || {});
    setImage(userInfo?.profileImage || null);
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
      const response = await fetch("http://localhost:3000/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          name: form.name,
          profilePicture: image,
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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={image || "/default-avatar.png"}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 shadow"
            />
            {editMode && (
              <button
                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700 focus:outline-none"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload profile image"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 20h14M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
              disabled={uploading}
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-blue-700">
            {form.name || user?.email}
          </h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              disabled={!editMode}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <input
              type="text"
              name="role"
              value={form.role || user?.role || ""}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Joined
            </label>
            <input
              type="text"
              name="created_at"
              value={form.created_at || user?.created_at || ""}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
            />
          </div>
          {/* Add more fields as needed */}
        </form>
        <div className="flex justify-end mt-6 space-x-3">
          {error && (
            <div className="text-red-600 mb-2 w-full text-right">{error}</div>
          )}
          {success && (
            <div className="text-green-600 mb-2 w-full text-right">
              {success}
            </div>
          )}
          {editMode ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                type="button"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                type="button"
                disabled={uploading || saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleEdit}
              type="button"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
