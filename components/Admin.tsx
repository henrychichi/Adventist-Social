import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Users, Building, Key, Plus, MapPin, Edit, Save, X, AlertCircle, LayoutDashboard, ArrowLeft, Clock, ArrowRight, Send } from 'lucide-react';
import { Church, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { MOCK_CHURCHES, MOCK_PENDING_CLERKS } from '../constants';
import { sendPushNotification } from '../services/notificationService';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'clerks' | 'churches' | 'create'>('overview');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Data State
  const [pendingClerks, setPendingClerks] = useState<User[]>(MOCK_PENDING_CLERKS);
  const [churches, setChurches] = useState<Church[]>(MOCK_CHURCHES);
  
  // State for Church Modal (Add/Edit)
  const [showChurchModal, setShowChurchModal] = useState(false);
  const [churchModalMode, setChurchModalMode] = useState<'add' | 'edit'>('add');
  const [churchFormData, setChurchFormData] = useState<Partial<Church>>({
    name: '',
    district: '',
    location: '',
    memberCount: 0
  });

  // State for Creation Form
  const [newClerk, setNewClerk] = useState({
    name: '',
    email: '',
    phone: '',
    churchId: '',
    ministry: ''
  });

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- HANDLERS ---

  const handleApproveClerk = (id: string) => {
    const clerk = pendingClerks.find(c => c.id === id);
    if (clerk) {
      setPendingClerks(pendingClerks.filter(c => c.id !== id));
      setNotification({ message: `Approved ${clerk.name}. Access granted.`, type: 'success' });
      sendPushNotification('Clerk Approved', `${clerk.name} has been granted clerk access to ${clerk.church}.`);
    }
  };

  const handleRejectClerk = (id: string) => {
    const clerk = pendingClerks.find(c => c.id === id);
    if (clerk) {
      setPendingClerks(pendingClerks.filter(c => c.id !== id));
      setNotification({ message: `Rejected application for ${clerk.name}.`, type: 'error' });
    }
  };

  const handleApproveChurch = (id: string) => {
    const church = churches.find(c => c.id === id);
    setChurches(churches.map(c => c.id === id ? { ...c, status: 'active' } : c));
    setNotification({ message: 'Church status updated to Active.', type: 'success' });
    if (church) {
      sendPushNotification('Church Activated', `${church.name} is now active in the system.`);
    }
  };

  const handleRejectChurch = (id: string) => {
    setChurches(churches.filter(c => c.id !== id));
    setNotification({ message: 'Church application removed.', type: 'error' });
  };

  const openAddChurchModal = () => {
    setChurchModalMode('add');
    setChurchFormData({ name: '', district: '', location: '', memberCount: 0 });
    setShowChurchModal(true);
  };

  const openEditChurchModal = (church: Church) => {
    setChurchModalMode('edit');
    setChurchFormData({ ...church });
    setShowChurchModal(true);
  };

  const handleChurchFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (churchModalMode === 'add') {
      const newChurchEntry: Church = {
        id: Date.now().toString(),
        name: churchFormData.name || 'New Church',
        district: churchFormData.district || 'General District',
        location: churchFormData.location || 'TBD',
        status: 'active',
        memberCount: churchFormData.memberCount || 0
      };
      setChurches([...churches, newChurchEntry]);
      setNotification({ message: 'New church added successfully.', type: 'success' });
    } else {
      if (churchFormData.id) {
        setChurches(churches.map(c => c.id === churchFormData.id ? { ...c, ...churchFormData } as Church : c));
        setNotification({ message: 'Church details updated.', type: 'success' });
      }
    }
    setShowChurchModal(false);
  };

  const handleCreateClerk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClerk.name || !newClerk.email || !newClerk.churchId) {
      setNotification({ message: "Please fill in all required fields.", type: 'error' });
      return;
    }

    // Generate Credentials
    const username = newClerk.name.toLowerCase().replace(/\s/g, '.') + new Date().getFullYear();
    const tempPassword = `SDA-${Math.random().toString(36).slice(-6).toUpperCase()}`;
    const churchName = churches.find(c => c.id === newClerk.churchId)?.name || 'your local church';

    alert(
      `[SIMULATION] Credentials sent to ${newClerk.email}\n\n` +
      `Username: ${username}\n` +
      `Password: ${tempPassword}\n` +
      `Church: ${churchName}`
    );

    setNotification({ message: `Credentials generated for ${newClerk.name}`, type: 'success' });
    setNewClerk({ name: '', email: '', phone: '', churchId: '', ministry: '' });
  };

  // --- RENDER HELPERS ---

  const DashboardCard = ({ title, count, icon: Icon, description, onClick, alert }: any) => (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
      
      <div className="relative z-10 flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${alert ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          <Icon className="w-6 h-6" />
        </div>
        {count !== undefined && (
          <span className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-slate-900'}`}>
            {count}
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 mb-1 relative z-10">{title}</h3>
      <p className="text-sm text-slate-500 mb-4 relative z-10 h-10">{description}</p>
      
      <div className="flex items-center text-blue-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
        Manage <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );

  // Only render for Admins
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-slate-500">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const pendingChurchCount = churches.filter(c => c.status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto relative min-h-screen pb-20">
      {/* Notification Banner */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-900" /> Admin Dashboard
          </h1>
          <p className="text-slate-500 text-sm">Welcome back, Elder {user.name}</p>
        </div>
        {activeTab !== 'overview' && (
          <button 
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-bold"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard Home
          </button>
        )}
      </div>

      {/* MAIN OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <DashboardCard 
              title="Clerk Approvals" 
              count={pendingClerks.length}
              icon={Users} 
              description="Review and approve new clerk applications."
              alert={pendingClerks.length > 0}
              onClick={() => setActiveTab('clerks')}
            />
            <DashboardCard 
              title="Church Registry" 
              count={pendingChurchCount > 0 ? `${pendingChurchCount} Pending` : churches.length}
              icon={Building} 
              description="Manage local churches and approve new registrations."
              alert={pendingChurchCount > 0}
              onClick={() => setActiveTab('churches')}
            />
            <DashboardCard 
              title="Access Control" 
              icon={Key} 
              description="Generate secure login credentials for new staff."
              onClick={() => setActiveTab('create')}
            />
          </div>

          {/* Recent Activity Snapshot */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" /> Needs Attention
            </h3>
            {pendingClerks.length === 0 && pendingChurchCount === 0 ? (
               <div className="text-center py-8 text-slate-400">
                 <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                 <p>All clear! No pending items requiring attention.</p>
               </div>
            ) : (
              <div className="space-y-3">
                {pendingClerks.slice(0, 3).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">Pending Clerk Application</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('clerks')} className="text-xs text-blue-600 font-bold hover:underline">Review</button>
                  </div>
                ))}
                 {churches.filter(c => c.status === 'pending').slice(0, 3).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">New Church Registration</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('churches')} className="text-xs text-blue-600 font-bold hover:underline">Review</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEWS */}

      {/* CLERKS VIEW */}
      {activeTab === 'clerks' && (
        <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
             <div>
               <h2 className="text-xl font-bold text-slate-900">Clerk Applications</h2>
               <p className="text-sm text-slate-500">Review and vet new administrative access requests.</p>
             </div>
             <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
               {pendingClerks.length} Pending
             </span>
          </div>
          
          <div className="p-6">
            {pendingClerks.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-slate-500">No pending clerk applications.</p>
                <button onClick={() => setActiveTab('overview')} className="mt-4 text-blue-600 text-sm font-bold hover:underline">Return to Dashboard</button>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingClerks.map(clerk => (
                  <div key={clerk.id} className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-center gap-4">
                      <img src={clerk.avatar} alt={clerk.name} className="w-12 h-12 rounded-full bg-slate-100 object-cover" />
                      <div>
                        <h3 className="font-bold text-slate-900">{clerk.name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <Building className="w-3 h-3" /> {clerk.church}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {clerk.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button 
                        onClick={() => handleRejectClerk(clerk.id)}
                        className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button 
                        onClick={() => handleApproveClerk(clerk.id)}
                        className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHURCHES VIEW */}
      {activeTab === 'churches' && (
        <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
             <div>
               <h2 className="text-xl font-bold text-slate-900">Church Directory</h2>
               <p className="text-sm text-slate-500">Manage registered churches and districts.</p>
             </div>
             <button 
                onClick={openAddChurchModal}
                className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Church
              </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="p-4">Church Name</th>
                  <th className="p-4">District</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Members</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {churches.map(church => (
                  <tr key={church.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{church.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {church.location}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{church.district}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${church.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {church.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{church.memberCount}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditChurchModal(church)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" 
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {church.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleRejectChurch(church.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" 
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleApproveChurch(church.id)}
                              className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors" 
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE CLERK VIEW */}
      {activeTab === 'create' && (
        <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50">
             <h2 className="text-xl font-bold text-slate-900">Generate Credentials</h2>
             <p className="text-sm text-slate-500">Create secure access for a new clerk.</p>
           </div>

          <div className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8 p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-100">
              <div className="bg-white p-2 rounded-full">
                <Key className="w-6 h-6" />
              </div>
              <div className="text-sm">
                <p className="font-bold">Secure Generation</p>
                <p>Credentials are auto-generated and sent directly to the recipient's email. No manual password sharing required.</p>
              </div>
            </div>

            <form onSubmit={handleCreateClerk} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Clerk Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-900 outline-none bg-white"
                    placeholder="John Doe"
                    value={newClerk.name}
                    onChange={e => setNewClerk({...newClerk, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Assign Church</label>
                  <select 
                    required
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-900 outline-none bg-white"
                    value={newClerk.churchId}
                    onChange={e => setNewClerk({...newClerk, churchId: e.target.value})}
                  >
                    <option value="">Select Church...</option>
                    {churches.filter(c => c.status === 'active').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-900 outline-none bg-white"
                  placeholder="clerk@church.org"
                  value={newClerk.email}
                  onChange={e => setNewClerk({...newClerk, email: e.target.value})}
                />
              </div>

               <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Ministry Group (Optional)</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-900 outline-none bg-white"
                  placeholder="e.g. Secretariat, Treasury"
                  value={newClerk.ministry}
                  onChange={e => setNewClerk({...newClerk, ministry: e.target.value})}
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" /> Generate & Send Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Church Modal */}
      {showChurchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
             <div className="px-6 py-4 bg-blue-900 text-white flex justify-between items-center">
                <h3 className="font-bold text-lg">{churchModalMode === 'add' ? 'Register New Church' : 'Edit Church Details'}</h3>
                <button onClick={() => setShowChurchModal(false)} className="hover:text-amber-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleChurchFormSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Church Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 outline-none"
                    value={churchFormData.name || ''}
                    onChange={(e) => setChurchFormData({...churchFormData, name: e.target.value})}
                    placeholder="e.g. Central SDA Church"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">District</label>
                    <input 
                      type="text" 
                      required
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 outline-none"
                      value={churchFormData.district || ''}
                      onChange={(e) => setChurchFormData({...churchFormData, district: e.target.value})}
                      placeholder="e.g. Metro District"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
                    <input 
                      type="text" 
                      required
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 outline-none"
                      value={churchFormData.location || ''}
                      onChange={(e) => setChurchFormData({...churchFormData, location: e.target.value})}
                      placeholder="e.g. Cityville"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Member Count</label>
                  <input 
                    type="number" 
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 outline-none"
                    value={churchFormData.memberCount || ''}
                    onChange={(e) => setChurchFormData({...churchFormData, memberCount: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowChurchModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-bold flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> {churchModalMode === 'add' ? 'Add Church' : 'Save Changes'}
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}

    </div>
  );
};