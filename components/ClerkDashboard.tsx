import React, { useState } from 'react';
import { User } from '../types';
import { Users, UserPlus, CheckCircle, XCircle, Search, Mail, Phone, Calendar, Shield, Key, Loader2, Send } from 'lucide-react';
import { MOCK_USERS, MOCK_PENDING_MEMBERS } from '../constants';
import { sendPushNotification } from '../services/notificationService';

export const ClerkDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'add' | 'pending'>('directory');
  
  // Data State
  // Combine static users and pending members for demo
  const [users, setUsers] = useState<User[]>([...Object.values(MOCK_USERS), ...MOCK_PENDING_MEMBERS]);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State for New Member
  const [newMember, setNewMember] = useState<Partial<User> & { email?: string }>({
    role: 'member',
    church: 'Central SDA Church',
    status: 'active',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter lists
  const activeMembers = users.filter(u => u.status !== 'pending' && 
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.church.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const pendingMembers = users.filter(u => u.status === 'pending' && u.role === 'member');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMember.phoneNumber && !newMember.email) {
      alert("Please provide either a Phone Number or Email Address to send login credentials.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate Temporary Credentials
    const cleanName = (newMember.name || 'member').toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = `${cleanName}.${new Date().getFullYear()}`;
    const tempPassword = `SDA${Math.floor(1000 + Math.random() * 9000)}!`;
    const deliveryMethod = newMember.email ? 'Email' : 'SMS';
    const destination = newMember.email || newMember.phoneNumber;

    const member: User = {
      id: Date.now().toString(),
      name: newMember.name || 'New Member',
      avatar: newMember.avatar || 'https://via.placeholder.com/150',
      role: 'member',
      church: newMember.church || 'Central SDA Church',
      bio: 'New member',
      interests: [],
      phoneNumber: newMember.phoneNumber,
      email: newMember.email,
      gender: newMember.gender,
      baptismDate: newMember.baptismDate,
      status: 'active',
      joinedDate: new Date().toISOString(),
      isSubscribed: false
    };

    setUsers([...users, member]);
    
    setNewMember({ 
      role: 'member', 
      church: 'Central SDA Church', 
      status: 'active', 
      email: '', 
      name: '', 
      phoneNumber: '', 
      gender: undefined, 
      baptismDate: '' 
    });
    
    setIsSubmitting(false);
    setActiveTab('directory');

    const welcomeMessage = 
      `Hello ${member.name},\n\n` +
      `Welcome to the Adventist Social family! We are blessed to have you join our digital community.\n\n` +
      `Please log in to connect with your church family, join ministries, and access daily spiritual content.\n\n` +
      `🔗 Login here: app.adventistsocial.org\n` +
      `👤 Username: ${username}\n` +
      `🔑 Password: ${tempPassword}\n\n` +
      `See you online!`;

    alert(
      `✅ Account Created Successfully!\n\n` +
      `[SYSTEM SIMULATION - Sending ${deliveryMethod} to ${destination}]\n` +
      `----------------------------------------\n` +
      welcomeMessage +
      `\n----------------------------------------`
    );
    
    sendPushNotification('New Member Registered', `${member.name} has been successfully added to the directory.`);
  };

  const handleApprove = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'active' } : u));
      alert(`Notification sent to ${user.name}: Your membership has been approved!`);
      sendPushNotification('Membership Approved', `${user.name} is now an active member.`);
    }
  };

  const handleReject = (id: string) => {
    if (window.confirm('Are you sure you want to reject this membership application?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const generateCredentials = (user: User) => {
    const tempPass = `Reset${Math.floor(1000 + Math.random() * 9000)}`;
    alert(`[SIMULATION]\nSMS sent to ${user.phoneNumber || 'User'}:\nYour password has been reset. New Password: ${tempPass}`);
  };

  const toggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2 mb-2">
          <Users className="w-8 h-8" /> Clerk Dashboard
        </h1>
        <p className="text-slate-600">Manage church membership, records, and transfers.</p>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex-1 py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 min-w-[150px] ${
              activeTab === 'directory' ? 'border-blue-900 text-blue-900 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Search className="w-4 h-4" /> Member Directory
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 min-w-[150px] ${
              activeTab === 'add' ? 'border-blue-900 text-blue-900 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Add Member
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-4 px-6 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 min-w-[150px] ${
              activeTab === 'pending' ? 'border-blue-900 text-blue-900 bg-blue-50' : 'border-transparent text-slate-500 hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <CheckCircle className="w-4 h-4" />
              {pendingMembers.length > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                  {pendingMembers.length}
                </span>
              )}
            </div>
            Pending Approvals
          </button>
        </div>
      </div>

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search members by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-900 outline-none"
              />
            </div>
            <div className="text-sm text-slate-500 font-medium">
              Active Members: {activeMembers.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Member</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeMembers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500">Baptized: {u.baptismDate || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {u.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 capitalize">{u.role}</td>
                    <td className="p-4 text-sm text-slate-600">
                      {u.phoneNumber || u.email || 'No contact'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => generateCredentials(u)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" 
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleStatus(u)}
                          className={`p-2 rounded-full ${u.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                          title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Member Tab */}
      {activeTab === 'add' && (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-fade-in">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-900" />
            Register New Member
          </h3>
          <form onSubmit={handleAddMember} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-900 outline-none"
                  value={newMember.name || ''}
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-900 outline-none"
                  value={newMember.gender || ''}
                  onChange={e => setNewMember({...newMember, gender: e.target.value as any})}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="tel" 
                    placeholder="555-0123"
                    className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-900 outline-none"
                    value={newMember.phoneNumber || ''}
                    onChange={e => setNewMember({...newMember, phoneNumber: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder="member@email.com"
                    className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-900 outline-none"
                    value={newMember.email || ''}
                    onChange={e => setNewMember({...newMember, email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Baptism Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="date" 
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-900 outline-none"
                  value={newMember.baptismDate || ''}
                  onChange={e => setNewMember({...newMember, baptismDate: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-start gap-3 p-4 border border-blue-100 bg-blue-50 rounded-lg">
                <Send className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-blue-900 text-sm">Automatic Credential Delivery</p>
                  <p className="text-xs text-blue-700 mt-1">
                    The system will automatically generate a username and temporary password and send it to the provided Phone Number or Email Address immediately upon account creation.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={() => setActiveTab('directory')}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-orange-500" />
            Pending Applications
          </h3>
          
          {pendingMembers.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No pending applications</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingMembers.map(u => (
                <div key={u.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full bg-slate-100" />
                      <div>
                        <h4 className="font-bold text-slate-900">{u.name}</h4>
                        <p className="text-xs text-slate-500">Applied: Just now</p>
                      </div>
                    </div>
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded uppercase">Pending</span>
                  </div>
                  
                  <div className="text-sm text-slate-600 space-y-2 mb-5">
                    <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {u.church}</p>
                    <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {u.phoneNumber}</p>
                    <p className="text-xs italic text-slate-500 border-l-2 border-slate-200 pl-2 mt-2">"{u.bio}"</p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleReject(u.id)}
                      className="flex-1 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(u.id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};