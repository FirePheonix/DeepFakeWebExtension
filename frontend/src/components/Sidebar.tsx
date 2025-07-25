import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Upload, 
  History, 
  Settings, 
  FileText, 
  Shield, 
  BarChart3, 
  HelpCircle, 
  Star,
  Zap,
  Crown,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Sidebar({ activeTab = 'upload', onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'upload', label: 'Upload & Analyze', icon: Upload, badge: null },
    { id: 'history', label: 'Analysis History', icon: History, badge: '12' },
    { id: 'reports', label: 'Reports', icon: FileText, badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 'New' },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-full flex flex-col shadow-sm">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
              DeepShield
            </h2>
            <p className="text-xs text-slate-500">AI Detection Suite</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b border-slate-100">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
            <div className="text-lg font-bold text-green-700">94.2%</div>
            <div className="text-xs text-green-600">Accuracy</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
            <div className="text-lg font-bold text-blue-700">127</div>
            <div className="text-xs text-blue-600">Files Analyzed</div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
            Main Features
          </div>
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start h-10 ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'hover:bg-slate-50'
              }`}
              onClick={() => onTabChange?.(item.id)}
            >
              <item.icon className="w-4 h-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    item.badge === 'New' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
              {activeTab === item.id && (
                <ChevronRight className="w-3 h-3 ml-1" />
              )}
            </Button>
          ))}
        </div>

        {/* Pro Features */}
        <div className="mt-8">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
            Pro Features
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-amber-800">Premium Models</span>
            </div>
            <p className="text-xs text-amber-700 mb-3">
              Access enterprise-grade detection models with 98.9% accuracy
            </p>
            <Button size="sm" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              <Star className="w-3 h-3 mr-1" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-slate-100">
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start h-9 hover:bg-slate-50"
              onClick={() => onTabChange?.(item.id)}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          ))}
        </div>

        {/* Performance Indicator */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600">System Status</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-blue-600" />
            <span className="text-xs text-slate-600">All models operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}