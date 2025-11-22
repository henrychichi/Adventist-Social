import React, { useState, useRef, useEffect } from 'react';
import { Post, User } from '../types';
import { Heart, MessageCircle, Share, Image as ImageIcon, Send, AlertCircle, Loader2, Video, X, Edit2, Check, Save, Lock } from 'lucide-react';
import { checkContentSafety } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { INITIAL_POSTS, MOCK_USERS } from '../constants';

export const Feed: React.FC = () => {
  const { user: currentUser, guardAction } = useAuth();
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Like State Persistence
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('liked_posts');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Persist likes
  useEffect(() => {
    localStorage.setItem('liked_posts', JSON.stringify(Array.from(likedPostIds)));
  }, [likedPostIds]);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  
  // Media Upload State
  const [mediaPreview, setMediaPreview] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    // Guard File Selection
    guardAction(() => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 50 * 1024 * 1024) { // 50MB limit for demo purposes
          setError("File size too large. Please choose a file under 50MB.");
          return;
        }

        setUploadProgress(0);
        setError(null);
        
        const reader = new FileReader();

        // Simulate upload progress for better UX
        let simulatedProgress = 0;
        const progressInterval = setInterval(() => {
          simulatedProgress += Math.floor(Math.random() * 15) + 5;
          if (simulatedProgress >= 95) {
               clearInterval(progressInterval);
          } else {
               setUploadProgress(simulatedProgress);
          }
        }, 150);

        reader.onloadend = () => {
          clearInterval(progressInterval);
          setUploadProgress(100);
          setMediaPreview({ type, url: reader.result as string });
          // Clear progress bar after a short delay
          setTimeout(() => setUploadProgress(0), 2000);
        };

        reader.onerror = () => {
          clearInterval(progressInterval);
          setError("Failed to read file.");
          setUploadProgress(0);
        };

        // Add a small delay to start reading to allow the progress bar to appear
        setTimeout(() => {
           reader.readAsDataURL(file);
        }, 500);
      }
      e.target.value = '';
    });
  };

  const clearMedia = () => {
    setMediaPreview(null);
    setUploadProgress(0);
  };

  const handlePost = async () => {
    guardAction(async () => {
      if ((!newPostContent.trim() && !mediaPreview) || !currentUser) return;
      setIsPosting(true);
      setError(null);

      const isSafe = await checkContentSafety(newPostContent);
      
      if (!isSafe) {
        setError("This content does not align with our community guidelines. Please revise.");
        setIsPosting(false);
        return;
      }

      const newPost: Post = {
        id: Date.now().toString(),
        userId: currentUser.id,
        content: newPostContent,
        likes: 0,
        comments: 0,
        timestamp: new Date().toISOString(),
        type: mediaPreview?.type === 'video' ? 'video' : (mediaPreview?.type === 'image' ? 'image' : 'text'),
        image: mediaPreview?.type === 'image' ? mediaPreview.url : undefined,
        video: mediaPreview?.type === 'video' ? mediaPreview.url : undefined,
      };

      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setMediaPreview(null);
      setIsPosting(false);
    });
  };

  const startEditing = (post: Post) => {
    guardAction(() => {
      setEditingId(post.id);
      setEditContent(post.content);
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const saveEdit = async () => {
    if (!editContent.trim() || !editingId) return;
    setIsSavingEdit(true);
    
    // Check safety of edited content
    const isSafe = await checkContentSafety(editContent);
    if (!isSafe) {
      alert("The updated content does not align with our community guidelines.");
      setIsSavingEdit(false);
      return;
    }

    setPosts(posts.map(p => p.id === editingId ? { ...p, content: editContent } : p));
    setEditingId(null);
    setEditContent('');
    setIsSavingEdit(false);
  };

  const toggleLike = (postId: string) => {
    guardAction(() => {
      const isLiked = likedPostIds.has(postId);
      
      // Update posts state (optimistic UI update)
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1 };
        }
        return p;
      }));

      // Update liked set
      const newLikedSet = new Set(likedPostIds);
      if (isLiked) {
        newLikedSet.delete(postId);
      } else {
        newLikedSet.add(postId);
      }
      setLikedPostIds(newLikedSet);
    });
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString; // Fallback if not a date
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (e) {
      return isoString;
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Create Post */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-6 border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex gap-3">
          <img 
            src={currentUser.avatar} 
            alt="Me" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              className="w-full bg-slate-50 dark:bg-slate-700 dark:text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 resize-none transition-all"
              placeholder="Share a testimony, verse, or thought..."
              rows={3}
              value={newPostContent}
              onClick={() => guardAction(() => {})} // Check permission on click
              onChange={(e) => setNewPostContent(e.target.value)}
            />

            {/* Upload Progress Bar */}
            {uploadProgress > 0 && (
              <div className="mt-3 mb-2 animate-fade-in">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
                  <span className="flex items-center gap-2">
                    {uploadProgress === 100 ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> Complete</span>
                    ) : (
                        <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading media...</span>
                    )}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ease-out ${uploadProgress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {mediaPreview && (
              <div className="mt-3 relative rounded-lg overflow-hidden bg-slate-900 max-h-64 w-full flex items-center justify-center animate-fade-in">
                <button 
                  onClick={clearMedia}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {mediaPreview.type === 'image' ? (
                  <img src={mediaPreview.url} alt="Preview" className="max-h-64 w-auto object-contain" />
                ) : (
                  <video src={mediaPreview.url} className="max-h-64 w-full" controls />
                )}
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50 dark:border-slate-700">
              <div className="flex gap-1">
                <input 
                  type="file" 
                  ref={imageInputRef} 
                  onChange={(e) => handleFileSelect(e, 'image')} 
                  accept="image/*" 
                  className="hidden" 
                />
                <input 
                  type="file" 
                  ref={videoInputRef} 
                  onChange={(e) => handleFileSelect(e, 'video')} 
                  accept="video/*" 
                  className="hidden" 
                />
                
                <button 
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadProgress > 0 && uploadProgress < 100}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs font-medium disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Photo</span>
                </button>
                <button 
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadProgress > 0 && uploadProgress < 100}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs font-medium disabled:opacity-50"
                >
                  <Video className="w-4 h-4" />
                  <span>Video</span>
                </button>
              </div>
              
              <button 
                onClick={handlePost}
                disabled={isPosting || (!newPostContent.trim() && !mediaPreview) || (uploadProgress > 0 && uploadProgress < 100)}
                className={`px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${isPosting || (!newPostContent.trim() && !mediaPreview) || (uploadProgress > 0 && uploadProgress < 100) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800 shadow-sm'}`}
              >
                {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Items */}
      <div className="space-y-4">
        {posts.map(post => {
          const isMe = post.userId === currentUser.id;
          // Look up user from constants + current user
          const allUsers = { ...MOCK_USERS, [currentUser.id]: currentUser };
          const postUser = allUsers[post.userId] || { name: 'Unknown User', avatar: 'https://via.placeholder.com/150', church: 'SDA Church', role: 'member' };
          const isEditing = editingId === post.id;
          const isLiked = likedPostIds.has(post.id);
          
          return (
            <div key={post.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-up transition-colors">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img src={postUser.avatar} alt={postUser.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{postUser.name}</h3>
                        {postUser.role === 'pastor' && (
                          <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full font-medium border border-blue-200 dark:border-blue-800">Pastor</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{postUser.church}</span>
                        <span>•</span>
                        <span>{formatTime(post.timestamp)}</span>
                        
                        {(post.type === 'image' || post.image) && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-medium">
                                    <ImageIcon className="w-3 h-3" /> Photo
                                </span>
                            </>
                        )}
                        {(post.type === 'video' || post.video) && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-pink-600 dark:text-pink-400 font-medium">
                                    <Video className="w-3 h-3" /> Video
                                </span>
                            </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isMe && !isEditing && (
                    <button 
                      onClick={() => startEditing(post)}
                      className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 rounded-full transition-colors"
                      title="Edit Post"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="mb-3">
                    <textarea
                      className="w-full bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none mb-2"
                      rows={3}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={cancelEditing}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                      <button 
                        onClick={saveEdit}
                        disabled={isSavingEdit || !editContent.trim()}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-900 text-white hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isSavingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-800 dark:text-slate-200 mb-3 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                    {post.content}
                  </div>
                )}

                {post.image && (
                  <div className="mb-3 -mx-4 bg-slate-100 dark:bg-slate-900">
                    <img src={post.image} alt="Post attachment" className="w-full h-auto max-h-96 object-cover" />
                  </div>
                )}

                {post.video && (
                  <div className="mb-3 -mx-4 bg-black">
                      <video 
                      src={post.video} 
                      controls 
                      className="w-full h-auto max-h-96" 
                    />
                  </div>
                )}

                {post.type === 'verse' && (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded mb-2 text-xs font-medium">
                    <span className="text-lg">📖</span> Scripture
                  </div>
                )}
              </div>

              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
                <div className="flex gap-6">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-2 transition-colors text-sm group ${isLiked ? 'text-pink-600 dark:text-pink-500' : 'text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-500'}`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-pink-600 dark:fill-pink-500' : 'group-hover:fill-pink-600 dark:group-hover:fill-pink-500'}`} />
                    <span>{post.likes}</span>
                  </button>
                  <button 
                    onClick={() => guardAction(() => {})} 
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments}</span>
                  </button>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <Share className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};