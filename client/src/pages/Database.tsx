import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Shield, 
  Network, 
  Search, 
  FileText, 
  Activity,
  Users,
  HardDrive,
  Cpu,
  ArrowLeft,
  Plus,
  Download,
  Upload,
  Eye,
  Link,
  Key,
  Globe,
  Archive,
  Zap,
  UserPlus,
  TrendingUp,
  Mail,
  Crown,
  CheckCircle,
  Star,
  Home
} from 'lucide-react';

const DatabasePanel = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('database');
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [queryResult, setQueryResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newDbName, setNewDbName] = useState('');
  const [newNameValue, setNewNameValue] = useState('');
  const [newDataValue, setNewDataValue] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showAddValueModal, setShowAddValueModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addValueInput, setAddValueInput] = useState('');
  const [addNameValue, setAddNameValue] = useState('');
  const [addDataValueInput, setAddDataValueInput] = useState('');
  const [userType, setUserType] = useState('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [privilege, setPrivilege] = useState('read');
  const [ipAddress, setIpAddress] = useState('');
  const [backupDatabases, setBackupDatabases] = useState([]);
  const [selectedBackupDb, setSelectedBackupDb] = useState('');
  const [realtimeRegion, setRealtimeRegion] = useState('us-east-1');
  
  // Navbar and invite states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Reader');
  const [isFirstTimeVisit, setIsFirstTimeVisit] = useState(false);
  
  // System monitoring
  const [systemStats, setSystemStats] = useState({
    ramUsage: 245.6,
    ramMax: 512,
    storageUsage: 1.2,
    storageMax: 1024,
    diskUsage: 15.8,
    diskMax: 1024,
    cpuUsage: 23.4,
    uptime: 86400
  });

  // Database lists - empty by default, populated by manual creation
  const [databases, setDatabases] = useState([]);

  const [realTimeLogs, setRealTimeLogs] = useState([]);
  const [allowedIps, setAllowedIps] = useState(['0.0.0.0/0']);
  const [authorizedUsers, setAuthorizedUsers] = useState([]);
  
  // Check for first-time visit
  useEffect(() => {
    const hasVisitedDatabase = localStorage.getItem('hasVisitedDatabase');
    if (!hasVisitedDatabase) {
      setIsFirstTimeVisit(true);
      setShowFirstTimeModal(true);
      localStorage.setItem('hasVisitedDatabase', 'true');
    }
  }, []);

  // Real-time monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        ramUsage: Math.min(prev.ramMax, Math.max(100, prev.ramUsage + (Math.random() - 0.5) * 8)),
        cpuUsage: Math.max(5, Math.min(95, prev.cpuUsage + (Math.random() - 0.5) * 15)),
        diskUsage: Math.min(prev.diskMax, Math.max(5, prev.diskUsage + (Math.random() - 0.5) * 2)),
        uptime: prev.uptime + 1
      }));
      
      // Add random log
      if (Math.random() < 0.2) {
        const logLevels = ['INFO', 'DEBUG', 'WARN', 'ERROR'];
        const messages = [
          'Database connection established',
          'Query executed successfully',
          'User authentication completed',
          'Backup process initiated',
          'Network access granted',
          'SQL query optimized',
          'Real-time sync completed'
        ];
        
        const newLog = {
          timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
          level: logLevels[Math.floor(Math.random() * logLevels.length)],
          message: messages[Math.floor(Math.random() * messages.length)]
        };
        
        setRealTimeLogs(prev => [newLog, ...prev.slice(0, 99)]);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle invite user
  const handleInviteUser = async () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/database/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Invitation Sent",
          description: result.message
        });
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteRole('Reader');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send invitation",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle upgrade database plan
  const handleUpgradePlan = async (plan: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/database-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      if (response.ok) {
        toast({
          title: "Upgrade Successful",
          description: `Successfully upgraded to ${plan} plan`
        });
        setShowUpgradeModal(false);
        setShowFirstTimeModal(false);
        window.location.reload(); // Refresh to show new features
      } else {
        toast({
          title: "Upgrade Failed",
          description: "Failed to upgrade database plan",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upgrade database plan",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user databases
  const fetchDatabases = async () => {
    try {
      const response = await fetch('/api/database/list');
      const data = await response.json();
      
      if (response.status === 401) {
        // User not authenticated, show empty state
        setDatabases([]);
        return;
      }
      
      if (data.success) {
        const dbList = data.databases || [];
        setDatabases(dbList);
      } else {
        console.error('Failed to fetch databases:', data.error);
        setDatabases([]);
      }
    } catch (error) {
      console.error('Error fetching databases:', error);
      setDatabases([]);
    }
  };

  // Fetch authorized users from MongoDB
  const fetchAuthorizedUsers = async () => {
    try {
      const response = await fetch('/api/database/authorized-users');
      const data = await response.json();
      
      if (response.status === 401) {
        setAuthorizedUsers([]);
        return;
      }
      
      if (data.success) {
        setAuthorizedUsers(data.users || []);
      } else {
        console.error('Failed to fetch authorized users:', data.error);
        setAuthorizedUsers([]);
      }
    } catch (error) {
      console.error('Error fetching authorized users:', error);
      setAuthorizedUsers([]);
    }
  };

  // Fetch databases on component mount and when user changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchDatabases();
      fetchAuthorizedUsers();
    }
  }, [isAuthenticated]);

  // Load database data when selected
  useEffect(() => {
    if (selectedDatabase) {
      loadDatabaseData();
    }
  }, [selectedDatabase]);

  // Load database data for editing
  const loadDatabaseData = async () => {
    if (!selectedDatabase) return;
    
    try {
      const response = await fetch('/api/database/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `SELECT * FROM ${selectedDatabase};`,
          database: selectedDatabase
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.result) {
        // Parse JSON result and format for editing
        try {
          const jsonData = JSON.parse(result.result);
          setQueryInput(JSON.stringify(jsonData, null, 2));
        } catch {
          setQueryInput(result.result);
        }
      }
    } catch (error) {
      console.error('Error loading database data:', error);
    }
  };

  // Save database changes
  const executeQuery = async () => {
    if (!queryInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter database code to save",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedDatabase) {
      toast({
        title: "Error", 
        description: "Please select a database first",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Try to parse as JSON to validate
      let dataToSave;
      try {
        dataToSave = JSON.parse(queryInput);
      } catch {
        // If not JSON, treat as simple text value
        dataToSave = { data1: queryInput.trim() };
      }

      const response = await fetch('/api/database/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database: selectedDatabase,
          data: dataToSave
        })
      });
      
      const result = await response.json();
      
      if (response.status === 401) {
        setQueryResult('-- Authentication Required\n-- Please login to save changes\n-- Timestamp: ' + new Date().toISOString());
        toast({
          title: "Authentication Required",
          description: "Please login to save database changes",
          variant: "destructive"
        });
        return;
      }
      
      if (result.success) {
        setQueryResult(JSON.stringify(dataToSave, null, 2));
        toast({
          title: "Changes Saved",
          description: "Database changes saved successfully to MongoDB"
        });
        fetchDatabases(); // Refresh database list
      } else {
        setQueryResult(`-- Save Failed
-- Error: ${result.error}
-- Timestamp: ${new Date().toISOString()}`);
        
        toast({
          title: "Save Failed",
          description: result.error || "Failed to save changes",
          variant: "destructive"
        });
      }
    } catch (error) {
      setQueryResult(`-- Connection Error
-- Failed to save changes
-- Timestamp: ${new Date().toISOString()}`);
      
      toast({
        title: "Connection Error",
        description: "Failed to connect to database",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Queit Found search
  const executeSearch = async () => {
    if (!searchInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter search criteria",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/database/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery: searchInput })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSearchResults(result.results);
        toast({
          title: "Search Complete",
          description: `Found ${result.results.length} matches`
        });
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to execute search",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create new database with name-value pair storage
  const createDatabase = async () => {
    if (!newDbName.trim()) {
      toast({
        title: "Error",
        description: "Please enter database name",
        variant: "destructive"
      });
      return;
    }
    
    // Use name-value pair or defaults
    let nameValue = newNameValue.trim() || "username";
    let dataValue = newDataValue.trim() || "admin123";
    
    try {
      const response = await fetch('/api/database/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDbName,
          nameValue: nameValue,
          dataValue: dataValue
        })
      });
      
      const result = await response.json();
      
      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please login to create databases",
          variant: "destructive"
        });
        return;
      }
      
      if (result.success) {
        // Refresh database list
        fetchDatabases();
        
        // Auto-select the first database if none selected
        if (!selectedDatabase) {
          setSelectedDatabase(newDbName);
        }
        
        setNewDbName('');
        setNewNameValue('');
        setNewDataValue('');
        setShowCreateModal(false);
        
        toast({
          title: "Database Created",
          description: `Database '${newDbName}' created with field "${nameValue}": "${dataValue}"`
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create database",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Database creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create database",
        variant: "destructive"
      });
    }
  };

  // Delete database function
  const deleteDatabase = async () => {
    if (!selectedDatabase) {
      toast({
        title: "Error",
        description: "Please select a database to delete",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch('/api/database/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ database: selectedDatabase })
      });
      
      const result = await response.json();
      
      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please login to delete databases",
          variant: "destructive"
        });
        return;
      }
      
      if (result.success) {
        // Refresh database list
        fetchDatabases();
        
        // Clear selected database
        setSelectedDatabase('');
        setQueryInput('');
        setQueryResult('');
        setShowDeleteModal(false);
        
        toast({
          title: "Database Deleted",
          description: `Database '${selectedDatabase}' and all its data have been permanently deleted`
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete database",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Delete database error:', error);
      toast({
        title: "Error",
        description: "Failed to delete database",
        variant: "destructive"
      });
    }
  };

  // Add value to existing database
  const addValueToDatabase = async () => {
    if (!addNameValue.trim() || !addDataValueInput.trim() || !selectedDatabase) {
      toast({
        title: "Error",
        description: "Please enter both name value and data value, and select a database",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch('/api/database/add-value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database: selectedDatabase,
          nameValue: addNameValue.trim(),
          dataValue: addDataValueInput.trim()
        })
      });
      
      const result = await response.json();
      
      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please login to add values to database",
          variant: "destructive"
        });
        return;
      }
      
      if (result.success) {
        // Refresh database list to update record count
        fetchDatabases();
        
        // Force refresh the database data by reloading
        if (selectedDatabase) {
          loadDatabaseData();
        }
        
        setAddNameValue('');
        setAddDataValueInput('');
        setShowAddValueModal(false);
        
        toast({
          title: "Value Added",
          description: `Added "${addNameValue}": "${addDataValueInput}" to database "${selectedDatabase}"`
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add value",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Add value error:', error);
      toast({
        title: "Error",
        description: "Failed to add value to database",
        variant: "destructive"
      });
    }
  };

  // Create new user
  const createUser = async () => {
    if (!username.trim() || (userType === 'password' && !password.trim()) || !selectedDatabase) {
      toast({
        title: "Error",
        description: "Please select a database and fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch('/api/database/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database: selectedDatabase,
          username,
          password: userType === 'password' ? password : null,
          authType: userType,
          privilege
        })
      });
      
      const result = await response.json();
      
      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please login to create users",
          variant: "destructive"
        });
        return;
      }
      
      if (result.success) {
        // Refresh authorized users list from database
        fetchAuthorizedUsers();
        
        setUsername('');
        setPassword('');
        setShowUserModal(false);
        
        toast({
          title: "User Created",
          description: `User '${username}' created successfully`
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create user",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  };

  // Add network IP
  const addNetwork = async () => {
    if (!ipAddress.trim() || !selectedDatabase) {
      toast({
        title: "Error",
        description: "Please select a database and enter IP address",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch('/api/database/network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          database: selectedDatabase,
          ipAddress 
        })
      });
      
      const result = await response.json();
      
      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please login to manage network access",
          variant: "destructive"
        });
        return;
      }
      
      if (result.success) {
        setAllowedIps(prev => [...prev, ipAddress]);
        setIpAddress('');
        setShowNetworkModal(false);
        
        toast({
          title: "Network Added",
          description: `IP ${ipAddress} added to allowed list`
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add network",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add network",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Enhanced Navbar */}
      <div className="bg-black border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 relative">
                  <div className="absolute top-0 w-8 h-3 bg-blue-500 rounded-full opacity-80"></div>
                  <div className="absolute top-1.5 w-8 h-3 bg-blue-400 rounded-full opacity-60"></div>
                  <div className="absolute top-3 w-8 h-3 bg-blue-300 rounded-full opacity-40"></div>
                </div>
              </div>
              <h1 className="text-xl font-bold">Queit DB</h1>
            </div>
            
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                {/* Invite Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInviteModal(true)}
                  className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
                
                {/* Upgrade Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-400 border-orange-400 hover:bg-orange-400/10"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Upgrade
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                    <DropdownMenuItem 
                      onClick={() => setShowUpgradeModal(true)}
                      className="hover:bg-gray-800"
                    >
                      <Crown className="w-4 h-4 mr-2 text-purple-400" />
                      Inter+ DB Plan
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowUpgradeModal(true)}
                      className="hover:bg-gray-800"
                    >
                      <Star className="w-4 h-4 mr-2 text-cyan-400" />
                      Pro++ DB Plan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.firstName || 'User'}</span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Connected</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { window.location.href = '/' }}
                className="text-white hover:bg-gray-800"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="text-white border-gray-600 hover:bg-gray-800"
                onClick={() => window.location.href = '/auth'}
              >
                Login to Queit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { window.location.href = '/' }}
                className="text-white hover:bg-gray-800"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Made shorter and gray */}
        <div className="w-48 bg-gray-800 text-white min-h-screen border-r border-gray-700">
          <div className="p-3">
            <div className="space-y-2">
              <Button
                variant={activeTab === 'database' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('database')}
                className="w-full justify-start text-sm"
                size="sm"
              >
                <Database className="w-4 h-4 mr-2" />
                Database
              </Button>
              <Button
                variant={activeTab === 'access' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('access')}
                className="w-full justify-start text-sm"
                size="sm"
              >
                <Shield className="w-4 h-4 mr-2" />
                Access
              </Button>
            </div>

            {/* Sub-navigation */}
            <div className="mt-4 pt-3 border-t border-gray-700">
              {activeTab === 'database' && (
                <div className="space-y-1">
                  <Button
                    variant={activeSubTab === 'overview' ? 'secondary' : 'ghost'}
                    onClick={() => setActiveSubTab('overview')}
                    className="w-full justify-start text-xs"
                    size="sm"
                  >
                    Overview
                  </Button>
                </div>
              )}

              {activeTab === 'access' && (
                <div className="space-y-1">
                  <Button
                    variant={activeSubTab === 'security' ? 'secondary' : 'ghost'}
                    onClick={() => setActiveSubTab('security')}
                    className="w-full justify-start text-xs"
                    size="sm"
                  >
                    Security
                  </Button>
                  <Button
                    variant={activeSubTab === 'network' ? 'secondary' : 'ghost'}
                    onClick={() => setActiveSubTab('network')}
                    className="w-full justify-start text-xs"
                    size="sm"
                  >
                    Network
                  </Button>
                  <Button
                    variant={activeSubTab === 'connect' ? 'secondary' : 'ghost'}
                    onClick={() => setActiveSubTab('connect')}
                    className="w-full justify-start text-xs"
                    size="sm"
                  >
                    Connect DB
                  </Button>
                  <Button
                    variant={activeSubTab === 'backup' ? 'secondary' : 'ghost'}
                    onClick={() => setActiveSubTab('backup')}
                    className="w-full justify-start text-xs"
                    size="sm"
                  >
                    Backup DB
                  </Button>
                  <Button
                    variant={activeSubTab === 'realtime' ? 'secondary' : 'ghost'}
                    onClick={() => setActiveSubTab('realtime')}
                    className="w-full justify-start text-xs"
                    size="sm"
                  >
                    Realtime Access
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Database Overview */}
          {activeTab === 'database' && activeSubTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Database Overview</h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">SQL Database</Badge>
                  <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Create New DB
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 text-white">
                      <DialogHeader>
                        <DialogTitle>Create New Database</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Database Name</Label>
                          <Input
                            value={newDbName}
                            onChange={(e) => setNewDbName(e.target.value)}
                            placeholder="Enter database name"
                            className="bg-black text-white border-gray-600"
                          />
                        </div>
                        <div>
                          <Label>Name Value</Label>
                          <p className="text-sm text-gray-400 mb-2">
                            Enter the field name (e.g., "username", "password", "email")
                          </p>
                          <Input
                            value={newNameValue}
                            onChange={(e) => setNewNameValue(e.target.value)}
                            placeholder="username"
                            className="bg-black text-white border-gray-600"
                          />
                        </div>
                        <div>
                          <Label>Data Value</Label>
                          <p className="text-sm text-gray-400 mb-2">
                            Enter the actual data for this field
                          </p>
                          <Input
                            value={newDataValue}
                            onChange={(e) => setNewDataValue(e.target.value)}
                            placeholder="admin123"
                            className="bg-black text-white border-gray-600"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                            Cancel
                          </Button>
                          <Button onClick={createDatabase}>
                            Create Database
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* SQL Data Overview */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    SQL Data Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Select Database</Label>
                    <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                      <SelectTrigger className="bg-black text-white border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {databases.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No databases available - Create one first
                          </SelectItem>
                        ) : (
                          databases.map((db) => (
                            <SelectItem key={db.name} value={db.name}>
                              {db.name} ({db.records} records)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Database Code (Direct Edit)</Label>
                    <Textarea
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      placeholder="Select database to view and edit data directly&#10;Changes will be reflected in MongoDB&#10;JSON format: { data1: 'value1', data2: 'value2' }"
                      className="bg-black text-white border-gray-600 h-32 font-mono"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={executeQuery} 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Confirm Changes'}
                    </Button>
                    <Button 
                      onClick={() => setQueryInput('')} 
                      className="bg-red-600 hover:bg-red-700"
                      disabled={!selectedDatabase}
                    >
                      Cancel Changes
                    </Button>
                    <Button 
                      onClick={() => setShowAddValueModal(true)} 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!selectedDatabase}
                    >
                      Add Value
                    </Button>
                    <Button 
                      onClick={() => setShowDeleteModal(true)} 
                      className="bg-red-600 hover:bg-red-700"
                      disabled={!selectedDatabase}
                    >
                      Delete Database
                    </Button>
                  </div>
                  
                  {queryResult && (
                    <div className="bg-black p-4 rounded-lg">
                      <pre className="text-green-400 text-sm overflow-auto max-h-96">
                        {queryResult}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monitoring */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    System Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-black p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Cpu className="w-5 h-5 mr-2 text-blue-400" />
                          <span className="text-white">RAM Usage</span>
                        </div>
                        <span className="text-green-400">
                          {systemStats.ramUsage.toFixed(1)}/{systemStats.ramMax}MB
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full" 
                          style={{ width: `${(systemStats.ramUsage / systemStats.ramMax) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-black p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <HardDrive className="w-5 h-5 mr-2 text-green-400" />
                          <span className="text-white">Storage</span>
                        </div>
                        <span className="text-green-400">
                          {systemStats.storageUsage.toFixed(1)}/{systemStats.storageMax}GB
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full" 
                          style={{ width: `${(systemStats.storageUsage / systemStats.storageMax) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-black p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Activity className="w-5 h-5 mr-2 text-yellow-400" />
                          <span className="text-white">Disk Usage</span>
                        </div>
                        <span className="text-green-400">
                          {systemStats.diskUsage.toFixed(1)}/{systemStats.diskMax}MB
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${(systemStats.diskUsage / systemStats.diskMax) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Queit Found */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Queit Found
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Search Command</Label>
                    <Input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="FOUND('username':'admin')"
                      className="bg-black text-white border-gray-600 font-mono"
                    />
                  </div>
                  <Button 
                    onClick={executeSearch} 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {isLoading ? 'Searching...' : 'Execute Search'}
                  </Button>
                  
                  {searchResults.length > 0 && (
                    <div className="bg-black p-4 rounded-lg">
                      <div className="text-green-400 text-sm mb-2">
                        Search Results: {searchResults.length} matches found
                      </div>
                      {searchResults.map((result: any, index) => (
                        <div key={index} className="mb-2 p-2 border-l-2 border-green-500">
                          <div className="text-white font-mono text-sm">
                            Database: <span className="text-blue-400">{result.database}</span>
                          </div>
                          <div className="text-gray-300 text-sm">
                            Value: <span className="text-green-400">{JSON.stringify(result.value)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Logs */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    System Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black p-4 rounded-lg max-h-96 overflow-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-400 text-sm">
                        Real-time Logs ({realTimeLogs.length})
                      </span>
                      <Button size="sm" variant="outline" onClick={() => setRealTimeLogs([])}>
                        Clear Logs
                      </Button>
                    </div>
                    {realTimeLogs.map((log, index) => (
                      <div key={index} className="mb-2 text-sm">
                        <span className="text-gray-400">{log.timestamp}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          log.level === 'ERROR' ? 'bg-red-600' :
                          log.level === 'WARN' ? 'bg-yellow-600' :
                          log.level === 'INFO' ? 'bg-blue-600' :
                          'bg-gray-600'
                        }`}>
                          {log.level}
                        </span>
                        <span className="ml-2 text-gray-300">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Access - Security */}
          {activeTab === 'access' && activeSubTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Database Security</h2>
                <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      New User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 text-white">
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Authentication Type</Label>
                        <Select value={userType} onValueChange={setUserType}>
                          <SelectTrigger className="bg-black text-white border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="password">Password</SelectItem>
                            <SelectItem value="authentication">Authentication</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Username</Label>
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter username"
                          className="bg-black text-white border-gray-600"
                        />
                      </div>
                      {userType === 'password' && (
                        <div>
                          <Label>Password</Label>
                          <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="bg-black text-white border-gray-600"
                          />
                        </div>
                      )}
                      <div>
                        <Label>Privilege Level</Label>
                        <Select value={privilege} onValueChange={setPrivilege}>
                          <SelectTrigger className="bg-black text-white border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="readwrite">Read and Write Only</SelectItem>
                            <SelectItem value="admin">Administration</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowUserModal(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createUser}>
                          Create User
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Authorized Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {authorizedUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                      <p className="text-gray-400">No authorized users found</p>
                      <p className="text-sm text-gray-500">Click "New User" to create admin accounts</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {authorizedUsers.map((user, index) => (
                        <div key={index} className="bg-black p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-medium">{user.username}</div>
                              <div className="text-sm text-gray-400">
                                {user.privilege} • {user.authType}
                              </div>
                            </div>
                            <Badge variant={
                              user.privilege === 'admin' ? 'destructive' :
                              user.privilege === 'readwrite' ? 'default' : 'secondary'
                            }>
                              {user.privilege}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Access - Network */}
          {activeTab === 'access' && activeSubTab === 'network' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Network Configuration</h2>
                <Dialog open={showNetworkModal} onOpenChange={setShowNetworkModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Network
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 text-white">
                    <DialogHeader>
                      <DialogTitle>Add Network IP</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>IP Address</Label>
                        <Input
                          value={ipAddress}
                          onChange={(e) => setIpAddress(e.target.value)}
                          placeholder="192.168.1.100 or 0.0.0.0/0"
                          className="bg-black text-white border-gray-600"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowNetworkModal(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addNetwork}>
                          Add Network
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Network className="w-5 h-5 mr-2" />
                    IP Whitelist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allowedIps.map((ip, index) => (
                      <div key={index} className="bg-black p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{ip}</div>
                            <div className="text-sm text-gray-400">
                              {ip === '0.0.0.0/0' ? 'Allow all IPs' : 'Specific IP address'}
                            </div>
                          </div>
                          <Badge variant={ip === '0.0.0.0/0' ? 'destructive' : 'default'}>
                            {ip === '0.0.0.0/0' ? 'Open' : 'Restricted'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Access - Connect DB */}
          {activeTab === 'access' && activeSubTab === 'connect' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Database Connection</h2>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Link className="w-5 h-5 mr-2" />
                    Connection URLs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {databases.map((db) => (
                    <div key={db.name} className="bg-black p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white font-medium">{db.name}</div>
                        <Badge variant="secondary">{db.type}</Badge>
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        API Endpoint for {db.name} database
                      </div>
                      <div className="bg-gray-800 p-3 rounded font-mono text-sm">
                        <div className="text-green-400">
                          https://queit.site/api/db/{user?.username || 'account'}[connect]{db.name}
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(`https://queit.site/api/db/${user?.username || 'account'}[connect]${db.name}`);
                            toast({ title: "Copied!", description: "Connection URL copied to clipboard" });
                          }}
                        >
                          Copy URL
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Access - Backup DB */}
          {activeTab === 'access' && activeSubTab === 'backup' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Database Backup</h2>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Archive className="w-5 h-5 mr-2" />
                    Create Backup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Select Database</Label>
                    <Select value={selectedBackupDb} onValueChange={setSelectedBackupDb}>
                      <SelectTrigger className="bg-black text-white border-gray-600">
                        <SelectValue placeholder="Choose database to backup" />
                      </SelectTrigger>
                      <SelectContent>
                        {databases.map((db) => (
                          <SelectItem key={db.name} value={db.name}>
                            {db.name} ({db.size})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Download className="w-4 h-4 mr-2" />
                      Create Backup
                    </Button>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Restore Backup
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Backups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Archive className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400">No backups found</p>
                    <p className="text-sm text-gray-500">Create your first backup to get started</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Access - Realtime Access */}
          {activeTab === 'access' && activeSubTab === 'realtime' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Realtime Access</h2>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Database Triggers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Database</Label>
                    <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                      <SelectTrigger className="bg-black text-white border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {databases.map((db) => (
                          <SelectItem key={db.name} value={db.name}>
                            {db.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Deployment Region</Label>
                    <Select value={realtimeRegion} onValueChange={setRealtimeRegion}>
                      <SelectTrigger className="bg-black text-white border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                        <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                        <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                        <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-black p-4 rounded-lg">
                    <div className="text-white font-medium mb-2">Realtime Configuration</div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>Database: <span className="text-green-400">{selectedDatabase}</span></div>
                      <div>Region: <span className="text-blue-400">{realtimeRegion}</span></div>
                      <div>Status: <span className="text-yellow-400">Ready to Deploy</span></div>
                    </div>
                  </div>
                  <Button className="bg-orange-600 hover:bg-orange-700 w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Deploy Realtime Triggers
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Add Value Modal */}
      <Dialog open={showAddValueModal} onOpenChange={setShowAddValueModal}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add Value to Database</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Database</Label>
              <div className="bg-black p-2 rounded text-white">
                {selectedDatabase || 'No database selected'}
              </div>
            </div>
            <div>
              <Label className="text-white">Name Value</Label>
              <Input
                value={addNameValue}
                onChange={(e) => setAddNameValue(e.target.value)}
                placeholder="email"
                className="bg-black text-white border-gray-600"
              />
            </div>
            <div>
              <Label className="text-white">Data Value</Label>
              <Textarea
                value={addDataValueInput}
                onChange={(e) => setAddDataValueInput(e.target.value)}
                placeholder="user@example.com"
                className="bg-black text-white border-gray-600"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddValueModal(false)}>
                Cancel
              </Button>
              <Button onClick={addValueToDatabase} className="bg-green-600 hover:bg-green-700">
                Add Value
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Database Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Database</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Database Name</Label>
              <Input
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                placeholder="Enter database name"
                className="bg-black text-white border-gray-600"
              />
            </div>
            <div>
              <Label className="text-white">Name Value</Label>
              <Input
                value={newNameValue}
                onChange={(e) => setNewNameValue(e.target.value)}
                placeholder="username"
                className="bg-black text-white border-gray-600"
              />
            </div>
            <div>
              <Label className="text-white">Data Value</Label>
              <Textarea
                value={newDataValue}
                onChange={(e) => setNewDataValue(e.target.value)}
                placeholder="admin123"
                className="bg-black text-white border-gray-600"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={createDatabase} className="bg-blue-600 hover:bg-blue-700">
                Create Database
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create Database User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Database</Label>
              <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                <SelectTrigger className="bg-black text-white border-gray-600">
                  <SelectValue placeholder="Select database" />
                </SelectTrigger>
                <SelectContent>
                  {databases.map((db) => (
                    <SelectItem key={db.name} value={db.name}>
                      {db.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-black text-white border-gray-600"
              />
            </div>
            <div>
              <Label className="text-white">Authentication Type</Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger className="bg-black text-white border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="token">API Token</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {userType === 'password' && (
              <div>
                <Label className="text-white">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-black text-white border-gray-600"
                />
              </div>
            )}
            <div>
              <Label className="text-white">Privilege Level</Label>
              <Select value={privilege} onValueChange={setPrivilege}>
                <SelectTrigger className="bg-black text-white border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read Only</SelectItem>
                  <SelectItem value="write">Read/Write</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowUserModal(false)}>
                Cancel
              </Button>
              <Button onClick={createUser} className="bg-purple-600 hover:bg-purple-700">
                Create User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Network Modal */}
      <Dialog open={showNetworkModal} onOpenChange={setShowNetworkModal}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add IP to Whitelist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Database</Label>
              <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                <SelectTrigger className="bg-black text-white border-gray-600">
                  <SelectValue placeholder="Select database" />
                </SelectTrigger>
                <SelectContent>
                  {databases.map((db) => (
                    <SelectItem key={db.name} value={db.name}>
                      {db.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">IP Address</Label>
              <Input
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="Enter IP address (e.g., 192.168.1.1 or 0.0.0.0/0)"
                className="bg-black text-white border-gray-600"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNetworkModal(false)}>
                Cancel
              </Button>
              <Button onClick={addNetwork} className="bg-green-600 hover:bg-green-700">
                Add IP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Database Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Database</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-900 border border-red-700 p-4 rounded-lg">
              <p className="text-red-100 text-sm">
                <strong>Warning:</strong> This action cannot be undone. Deleting this database will permanently remove:
              </p>
              <ul className="text-red-200 text-sm mt-2 space-y-1 list-disc list-inside">
                <li>All data stored in the database</li>
                <li>All authorized users and IP addresses</li>
                <li>All database configurations</li>
                <li>All backup data</li>
              </ul>
            </div>
            <div>
              <Label className="text-white">Database to Delete</Label>
              <div className="bg-black p-2 rounded text-white border border-red-600">
                {selectedDatabase || 'No database selected'}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button onClick={deleteDatabase} className="bg-red-600 hover:bg-red-700">
                Delete Database
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite User Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-blue-400" />
              Invite Collaborator
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Email Address</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter collaborator's email"
                className="bg-black text-white border-gray-600"
              />
              <p className="text-gray-400 text-sm mt-1">
                We'll verify if this user is registered with Queit and send them a database invitation.
              </p>
            </div>
            <div>
              <Label className="text-white">Access Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="bg-black text-white border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="Reader" className="text-white hover:bg-gray-800">
                    <div>
                      <div className="font-medium">Reader</div>
                      <div className="text-gray-400 text-sm">View databases and execute read queries</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Writer" className="text-white hover:bg-gray-800">
                    <div>
                      <div className="font-medium">Writer</div>
                      <div className="text-gray-400 text-sm">Read + Create and modify data</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Admin" className="text-white hover:bg-gray-800">
                    <div>
                      <div className="font-medium">Admin</div>
                      <div className="text-gray-400 text-sm">Full access + User management</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleInviteUser}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-400" />
              Upgrade Database Plan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Inter+ DB Plan */}
            <div className="border border-purple-500/30 rounded-lg p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Crown className="w-6 h-6 text-purple-400 mr-2" />
                  <h3 className="text-xl font-bold text-white">Inter+ DB Plan</h3>
                </div>
                <Badge className="bg-purple-600 text-white">Popular</Badge>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Enhanced storage up to 10GB
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Advanced query optimization
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Real-time collaboration tools
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Advanced backup & recovery
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Priority support
                </div>
              </div>
              <Button 
                onClick={() => handleUpgradePlan('inter')}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? 'Processing...' : 'Upgrade to Inter+ DB'}
              </Button>
            </div>

            {/* Pro++ DB Plan */}
            <div className="border border-cyan-500/30 rounded-lg p-6 bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Star className="w-6 h-6 text-cyan-400 mr-2" />
                  <h3 className="text-xl font-bold text-white">Pro++ DB Plan</h3>
                </div>
                <Badge className="bg-cyan-600 text-white">Premium</Badge>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Unlimited storage & bandwidth
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Advanced AI-powered insights
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Custom database schemas
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Advanced security features
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  24/7 dedicated support
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  White-label database solutions
                </div>
              </div>
              <Button 
                onClick={() => handleUpgradePlan('pro')}
                disabled={isLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                {isLoading ? 'Processing...' : 'Upgrade to Pro++ DB'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* First Time Visit Modal */}
      <Dialog open={showFirstTimeModal} onOpenChange={setShowFirstTimeModal}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Welcome to Queit DB!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-gray-300">
              <p className="mb-3">
                Get started with a better database experience! Upgrade your plan for enhanced features and performance.
              </p>
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-medium mb-2">Recommended for first-time users:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Enhanced storage and performance</li>
                  <li>• Advanced configuration options</li>
                  <li>• Real-time collaboration features</li>
                  <li>• Better monitoring and analytics</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowFirstTimeModal(false)}>
                Maybe Later
              </Button>
              <Button 
                onClick={() => {
                  setShowFirstTimeModal(false);
                  setShowUpgradeModal(true);
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                View Upgrade Options
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DatabasePanel;