import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Award, Book, Edit2, Save, X, Camera, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

export const Profile: React.FC = () => {
  const { user: currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<User>>({});
  const [newInterest, setNewInterest] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        church: currentUser.church,
        bio: currentUser.bio,
        interests: currentUser.interests,
        avatar: currentUser.avatar
      });
    }
  }, [currentUser, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && formData.interests) {
      if (!formData.interests.includes(newInterest.trim())) {
        setFormData(prev => ({
          ...prev,
          interests: [...(prev.interests || []), newInterest.trim()]
        }));
      }
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests?.filter(i => i !== interestToRemove)
    }));
  };

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Banner & Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-900"></div>
        
        <div className="px-6 pb-6">
          <div className="relative flex justify-between items-end -mt-12 mb-4">
            <div className="relative group">
              <img 
                src={isEditing ? (formData.avatar || currentUser.avatar) : currentUser.avatar} 
                alt={currentUser.name} 
                className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
              />
              {isEditing && (
                <>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </>
              )}
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-amber-400 text-blue-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-500 flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
          
          <div>
            {isEditing ? (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Local Church</label>
                    <input
                      type="text"
                      name="church"
                      value={formData.church || ''}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Bio</label>
                  <textarea
                    name="bio"
                    rows={3}
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Interests & Ministries</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.interests?.map(interest => (
                      <span key={interest} className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1 border border-blue-100">
                        {interest}
                        <button onClick={() => removeInterest(interest)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                      placeholder="Add interest (e.g. Pathfinders)"
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                    <button 
                      onClick={addInterest}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  {currentUser.name}
                  {currentUser.role === 'pastor' && <Award className="w-5 h-5 text-amber-500" />}
                </h1>
                <p className="text-slate-500 flex items-center gap-1 text-sm mb-4">
                  <MapPin className="w-4 h-4" /> {currentUser.church}
                </p>
                
                <div className="bg-slate-50 p-4 rounded-lg text-slate-700 text-sm leading-relaxed mb-4 border border-slate-100 italic">
                  "{currentUser.bio}"
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentUser.interests.map(interest => (
                    <span key={interest} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
                      {interest}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats / Details - Read Only for now */}
      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Book className="w-5 h-5 text-amber-500" />
              Spiritual Gifts
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Teaching</span>
                  <span className="text-slate-500">85%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Music</span>
                  <span className="text-slate-500">70%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">Membership Details</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span>Member Since:</span>
                <span className="font-medium text-slate-900">2015</span>
              </li>
              <li className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span>Home District:</span>
                <span className="font-medium text-slate-900">North Conference</span>
              </li>
              <li className="flex justify-between items-center pt-1">
                <span>Status:</span>
                <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">Active / Baptized</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};