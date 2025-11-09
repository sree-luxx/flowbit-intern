'use client';

import { Home, FileText, Folder, Building, Users, Settings, MessageSquare } from 'lucide-react';
import { FlowbitLogo } from './flowbit-logo';

interface SidebarProps {
  activeView: 'dashboard' | 'chat' | 'invoice' | 'files' | 'departments' | 'users' | 'settings';
  setActiveView: (view: 'dashboard' | 'chat' | 'invoice' | 'files' | 'departments' | 'users' | 'settings') => void;
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as const, icon: Home, label: 'Dashboard' },
    { id: 'invoice' as const, icon: FileText, label: 'Invoice' },
    { id: 'files' as const, icon: Folder, label: 'Other files' },
    { id: 'departments' as const, icon: Building, label: 'Departments' },
    { id: 'users' as const, icon: Users, label: 'Users' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  return (
    <div 
      className="w-64 h-screen fixed left-0 top-0 flex flex-col z-10 shadow-xl bg-gray-50" 
    >
      {/* Top Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-400 rounded flex items-center justify-center text-purple-900 font-bold text-lg shadow-md relative">
              <div className="absolute inset-0 bg-blue-600 rounded" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></div>
              <span className="relative z-10 text-white">B</span>
            </div>
            <div>
              <div className="font-bold text-base text-gray-900">Buchhaltung</div>
              <div className="text-xs text-gray-500">12 members</div>
            </div>
          </div>
          <svg className="w-5 h-5 cursor-pointer text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs uppercase mb-3 px-2 font-semibold tracking-wider text-gray-500">GENERAL</div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-purple-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-gray-600'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section - Chat with Data & Flowbit AI */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <button
          onClick={() => setActiveView('chat')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
            activeView === 'chat'
              ? 'bg-purple-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">Chat with Data</span>
        </button>
        <div className="flex items-center space-x-3 pt-2">
          <FlowbitLogo width={100} height={16} />
        </div>
      </div>
    </div>
  );
}

