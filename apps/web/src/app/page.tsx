'use client';

import { useState } from 'react';
import { Dashboard } from '@/components/dashboard';
import { ChatWithData } from '@/components/chat-with-data';
import { Sidebar } from '@/components/sidebar';
import { InvoicesTable } from '@/components/invoices-table';
import { Settings } from '@/components/settings';
import { Files } from '@/components/files';
import { Departments } from '@/components/departments';
import { Users } from '@/components/users';
import { Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [activeView, setActiveView] = useState<'dashboard' | 'chat' | 'invoice' | 'files' | 'departments' | 'users' | 'settings'>('dashboard');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Amit Jadhav',
    role: 'Admin',
    initials: 'AJ',
  });

  const getTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Dashboard';
      case 'chat':
        return 'Chat with Data';
      case 'invoice':
        return 'Invoices';
      case 'files':
        return 'Other Files';
      case 'departments':
        return 'Departments';
      case 'users':
        return 'Users';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'chat':
        return <ChatWithData />;
      case 'invoice':
        return <InvoicesTable />;
      case 'files':
        return <Files />;
      case 'departments':
        return <Departments />;
      case 'users':
        return <Users />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const handleSaveProfile = () => {
    // Update initials based on name
    const initials = profile.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    setProfile({ ...profile, initials });
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 ml-64 flex flex-col bg-white">
        {/* Header Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">{getTitle()}</h1>
          <div className="flex items-center space-x-4">
            {isEditingProfile ? (
              <div className="flex items-center space-x-2">
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-40"
                  placeholder="Name"
                />
                <Input
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="w-32"
                  placeholder="Role"
                />
                <Button size="sm" onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            ) : (
              <>
            <div className="text-right">
                  <div className="font-semibold text-gray-800">{profile.name}</div>
                  <div className="text-sm text-gray-500">{profile.role}</div>
            </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center border-2 border-purple-200 cursor-pointer hover:bg-purple-200 transition-colors relative group">
                  <span className="text-purple-600 font-semibold text-sm">{profile.initials}</span>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-full transition-opacity"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-4 h-4 text-white" />
                  </button>
            </div>
              </>
            )}
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 p-8 bg-white overflow-y-auto" style={{ overflowX: 'hidden', maxWidth: 'calc(100vw - 16rem)' }}>
          <div className="w-full max-w-full">
          {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

