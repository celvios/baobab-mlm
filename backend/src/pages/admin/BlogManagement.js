import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, CheckIcon, PhotoIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function BlogManagement() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/blog`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/blog/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const [dummyPosts] = useState([
    { id: 1, title: 'Benefits of Organic Tea', author: 'Admin', date: '01/01/25', status: 'Published', views: 1250 },
    { id: 2, title: 'Skincare Routine Tips', author: 'Admin', date: '31/12/24', status: 'Published', views: 890 },
    { id: 3, title: 'MLM Success Stories', author: 'Admin', date: '30/12/24', status: 'Draft', views: 0 },
    { id: 4, title: 'Product Launch Announcement', author: 'Admin', date: '29/12/24', status: 'Published', views: 2100 }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [actionType, setActionType] = useState('');
  
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    status: 'draft',
    featuredImage: null
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    const newPost = {
      id: posts.length + 1,
      title: postData.title,
      author: 'Admin',
      date: new Date().toLocaleDateString('en-GB'),
      status: postData.status === 'publish' ? 'Published' : 'Draft',
      views: 0
    };
    setPosts([newPost, ...posts]);
    setShowCreateModal(false);
    setActionType('create');
    setShowSuccessModal(true);
    setPostData({ title: '', content: '', excerpt: '', category: '', status: 'draft', featuredImage: null });
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setPostData({
      title: post.title,
      content: 'Sample content for ' + post.title,
      excerpt: 'Sample excerpt...',
      category: 'General',
      status: post.status.toLowerCase(),
      featuredImage: null
    });
    setShowEditModal(true);
  };

  const handleUpdatePost = (e) => {
    e.preventDefault();
    setPosts(posts.map(p => 
      p.id === selectedPost.id 
        ? { ...p, title: postData.title, status: postData.status === 'publish' ? 'Published' : 'Draft' }
        : p
    ));
    setShowEditModal(false);
    setActionType('edit');
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  const handleDeletePost = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setPosts(posts.filter(p => p.id !== selectedPost.id));
    setShowDeleteModal(false);
    setActionType('delete');
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  return (
    <div className="bg-white">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Blog Management</h1>
          <div className="relative">
            <div className="h-6 w-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">8</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Blog Overview</h2>
          <p className="text-gray-600 text-sm mb-6">Create and manage blog posts to engage your community.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-xs sm:text-sm mb-2">Total Posts</h3>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{stats.totalPosts || 0}</div>
              <p className="text-gray-500 text-xs sm:text-sm">All Blog Posts</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Published</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.publishedPosts || 0}</div>
              <p className="text-gray-500 text-sm">Live Posts</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Drafts</h3>
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.draftPosts || 0}</div>
              <p className="text-gray-500 text-sm">Draft Posts</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Total Views</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalViews?.toLocaleString() || '0'}</div>
              <p className="text-gray-500 text-sm">All Time Views</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Blog Posts</h3>
              <button 
                onClick={() => {
                  setPostData({ title: '', content: '', excerpt: '', category: '', status: 'draft', featuredImage: null });
                  setShowCreateModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center text-sm w-full sm:w-auto justify-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Post
              </button>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <input 
                type="text" 
                placeholder="Search posts..." 
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <select className="px-3 py-2 border rounded-lg text-sm w-full sm:w-auto">
                <option>All Status</option>
                <option>Published</option>
                <option>Draft</option>
                <option>Scheduled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(posts.length > 0 ? posts : dummyPosts).map((post, index) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium">{post.title}</td>
                    <td className="px-6 py-4 text-sm">{post.author}</td>
                    <td className="px-6 py-4 text-sm">{post.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        post.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{post.views.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800" title="View">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditPost(post)}
                          className="text-green-600 hover:text-green-800" 
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePost(post)}
                          className="text-red-600 hover:text-red-800" 
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Blog Post</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
                <input 
                  type="text" 
                  value={postData.title}
                  onChange={(e) => setPostData({...postData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg" 
                  placeholder="Enter post title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={postData.category}
                  onChange={(e) => setPostData({...postData, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Category</option>
                  <option value="health">Health & Wellness</option>
                  <option value="products">Products</option>
                  <option value="mlm">MLM Tips</option>
                  <option value="success">Success Stories</option>
                  <option value="news">News & Updates</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea 
                  value={postData.excerpt}
                  onChange={(e) => setPostData({...postData, excerpt: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg" 
                  rows="2"
                  placeholder="Brief description of the post"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea 
                  value={postData.content}
                  onChange={(e) => setPostData({...postData, content: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg" 
                  rows="6"
                  placeholder="Write your blog post content here..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <button type="button" className="text-blue-600 text-sm">Choose image to upload</button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={postData.status}
                  onChange={(e) => setPostData({...postData, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="draft">Save as Draft</option>
                  <option value="publish">Publish Now</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  {postData.status === 'publish' ? 'Publish Post' : 'Save Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Blog Post</h3>
            <form onSubmit={handleUpdatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
                <input 
                  type="text" 
                  value={postData.title}
                  onChange={(e) => setPostData({...postData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={postData.category}
                  onChange={(e) => setPostData({...postData, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="health">Health & Wellness</option>
                  <option value="products">Products</option>
                  <option value="mlm">MLM Tips</option>
                  <option value="success">Success Stories</option>
                  <option value="news">News & Updates</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea 
                  value={postData.content}
                  onChange={(e) => setPostData({...postData, content: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg" 
                  rows="6"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={postData.status}
                  onChange={(e) => setPostData({...postData, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="draft">Draft</option>
                  <option value="publish">Published</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Update Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Blog Post</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "{selectedPost?.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {actionType === 'create' ? 'Post Created Successfully' :
               actionType === 'edit' ? 'Post Updated Successfully' :
               'Post Deleted Successfully'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {actionType === 'create' ? 'Your blog post has been created and is ready for publication.' :
               actionType === 'edit' ? 'Your blog post has been updated successfully.' :
               'The blog post has been permanently deleted.'}
            </p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-6 py-2 bg-gray-900 text-white rounded-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}