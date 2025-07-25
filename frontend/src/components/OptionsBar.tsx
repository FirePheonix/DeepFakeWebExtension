import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  User, 
  LogOut, 
  Crown, 
  Shield, 
  Zap, 
  Brain, 
  Clock, 
  Download,
  History,
  Bell,
  Moon,
  Sun,
  Globe,
  HelpCircle,
  ChevronDown,
  CheckCircle
} from 'lucide-react';

interface OptionsBarProps {
  onSettingsChange?: (settings: any) => void;
}

export default function OptionsBar({ onSettingsChange }: OptionsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoAnalysis, setAutoAnalysis] = useState(false);
  const [sensitivity, setSensitivity] = useState([75]);
  const [selectedModel, setSelectedModel] = useState('balanced');
  const [language, setLanguage] = useState('en');

  // Mock user data
  const user = {
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    plan: 'Pro',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    creditsUsed: 47,
    creditsTotal: 100,
    isSignedIn: true
  };

  const handleSettingsChange = (newSettings: any) => {
    onSettingsChange?.(newSettings);
  };

  return (
    <div className="w-full bg-white border-b border-slate-200 shadow-sm">
      {/* Main Options Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - User Info */}
          <div className="flex items-center gap-4">
            {user.isSignedIn ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-blue-200"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{user.name}</span>
                    <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200">
                      <Crown className="w-3 h-3 mr-1" />
                      {user.plan}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500">
                    {user.creditsUsed}/{user.creditsTotal} credits used
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600">Not signed in</span>
              </div>
            )}
          </div>

          {/* Center Section - Quick Stats */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-slate-600">Security: High</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-slate-600">Speed: Optimized</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-slate-600">Model: {selectedModel}</span>
            </div>
          </div>

          {/* Right Section - Always Visible Actions */}
          <div className="flex items-center gap-2">
            {/* History Button */}
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 hover:text-white">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
            
            {/* Notifications Button */}
            <Button variant="ghost" size="sm" className="relative text-white bg-green-600 hover:bg-green-700 hover:text-white">
              <Bell className="w-4 h-4" />
              {notifications && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
              <span className="hidden sm:inline ml-2">Alerts</span>
            </Button>

            {/* Settings Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-white bg-purple-600 hover:bg-purple-700 hover:text-white"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>

            {/* Logout Button - Only if signed in */}
            {user.isSignedIn && (
              <Button variant="ghost" size="sm" className="text-white bg-red-600 hover:bg-red-700 hover:text-white flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            )}
          </div>
        </div>

        {/* Credits Progress Bar - Mobile */}
        {user.isSignedIn && (
          <div className="mt-3 md:hidden">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>API Credits</span>
              <span>{user.creditsUsed}/{user.creditsTotal}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(user.creditsUsed / user.creditsTotal) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Settings Panel */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-slate-50/80">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white">
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="interface">Interface</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="mt-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Detection Model
                          </label>
                          <Select value={selectedModel} onValueChange={setSelectedModel}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fast">Fast (Lower accuracy)</SelectItem>
                              <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                              <SelectItem value="accurate">Accurate (Slower)</SelectItem>
                              <SelectItem value="enterprise">Enterprise (Best quality)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Detection Sensitivity: {sensitivity[0]}%
                          </label>
                          <Slider
                            value={sensitivity}
                            onValueChange={setSensitivity}
                            max={100}
                            min={10}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Conservative</span>
                            <span>Aggressive</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Auto-Analysis</label>
                            <p className="text-xs text-slate-500">Analyze files immediately on upload</p>
                          </div>
                          <Switch checked={autoAnalysis} onCheckedChange={setAutoAnalysis} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Detailed Reports</label>
                            <p className="text-xs text-slate-500">Include technical analysis details</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Save Results</label>
                            <p className="text-xs text-slate-500">Keep analysis history</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="mt-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Processing Priority
                          </label>
                          <Select defaultValue="standard">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low (Cheaper)</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="high">High (Faster)</SelectItem>
                              <SelectItem value="realtime">Real-time (Premium)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-slate-700">GPU Acceleration</label>
                            <p className="text-xs text-slate-500">Use GPU for faster processing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Parallel Processing</label>
                            <p className="text-xs text-slate-500">Process multiple files simultaneously</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Cache Results</label>
                            <p className="text-xs text-slate-500">Store results for faster re-analysis</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="interface" className="mt-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Dark Mode</label>
                            <p className="text-xs text-slate-500">Switch to dark theme</p>
                          </div>
                          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Language
                          </label>
                          <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="de">Deutsch</SelectItem>
                              <SelectItem value="zh">中文</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Notifications</label>
                            <p className="text-xs text-slate-500">Get alerts for completed analyses</p>
                          </div>
                          <Switch checked={notifications} onCheckedChange={setNotifications} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Sound Effects</label>
                            <p className="text-xs text-slate-500">Play sounds for actions</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Animations</label>
                            <p className="text-xs text-slate-500">Enable UI animations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="mt-4">
                <Card>
                  <CardContent className="pt-4">
                    {user.isSignedIn ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-16 h-16 rounded-full border-2 border-blue-200"
                          />
                          <div>
                            <h3 className="font-semibold text-slate-800">{user.name}</h3>
                            <p className="text-slate-600">{user.email}</p>
                            <Badge variant="secondary" className="mt-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200">
                              <Crown className="w-3 h-3 mr-1" />
                              {user.plan} Plan
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-slate-700 mb-3">Usage Statistics</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Credits Used:</span>
                                <span className="font-medium">{user.creditsUsed}/{user.creditsTotal}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Files Analyzed:</span>
                                <span className="font-medium">127</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Accuracy Rate:</span>
                                <span className="font-medium">94.2%</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-700 mb-3">Quick Actions</h4>
                            <div className="space-y-2">
                              <Button variant="outline" size="sm" className="w-full justify-start">
                                <Download className="w-4 h-4 mr-2" />
                                Export Data
                              </Button>
                              <Button variant="outline" size="sm" className="w-full justify-start">
                                <Clock className="w-4 h-4 mr-2" />
                                View History
                              </Button>
                              <Button variant="outline" size="sm" className="w-full justify-start">
                                <HelpCircle className="w-4 h-4 mr-2" />
                                Get Support
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="font-semibold text-slate-800 mb-2">Sign in to access your account</h3>
                        <p className="text-slate-600 mb-4">Get access to advanced features, history, and more credits</p>
                        <div className="flex gap-2 justify-center">
                          <Button>Sign In</Button>
                          <Button variant="outline">Create Account</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}