import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function BlogManagement() {
  const [posts] = useState([
    { id: 1, title: 'Benefits of Organic Tea', author: 'Admin', date: '01/01/25', status: 'Published', views: 1250 },
    { id: 2, title: 'Skincare Routine Tips', author: 'Admin', date: '31/12/24', status: 'Published', views: 890 },
    { id: 3, title: 'MLM Success Stories', author: 'Admin', date: '30/12/24', status: 'Draft', views: 0 },
    { id: 4, title: 'Product Launch Announcement', author: 'Admin', date: '29/12/24', status: 'Published', views: 2100 }
  ]);

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

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Blog Overview</h2>
          <p className="text-gray-600 text-sm mb-6">Create and manage blog posts to engage your community.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Total Posts</h3>
              <div className="text-3xl font-bold text-gray-900 mb-2">47</div>
              <p className="text-gray-500 text-sm">All Blog Posts</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Published</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">42</div>
              <p className="text-gray-500 text-sm">Live Posts</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Drafts</h3>
              <div className="text-3xl font-bold text-yellow-600 mb-2">5</div>
              <p className="text-gray-500 text-sm">Draft Posts</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-gray-600 text-sm mb-2">Total Views</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">25,430</div>
              <p className="text-gray-500 text-sm">All Time Views</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Blog Posts</h3>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center text-sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Post
              </button>
            </div>
            <div className="flex space-x-4">
              <input 
                type="text" 
                placeholder="Search posts..." 
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <select className="px-3 py-2 border rounded-lg text-sm">
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
                {posts.map((post, index) => (
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
                        <button className="text-blue-600 hover:text-blue-800">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
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
    </div>
  );
}