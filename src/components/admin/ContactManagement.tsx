import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, Clock, Upload, FileUp, Download, Mail, Users, Target, UserPlus } from 'lucide-react';
import { format, addDays } from 'date-fns';
import Papa from 'papaparse';
import AddUserForm from './AddUserForm';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_premium: boolean;
  phone_number: string | null;
  email_confirmed_at: string | null;
  wallet_balance: number;
  referral_code: string | null;
  total_referrals: number;
  membership_level: string;
  active_strategies: number;
  total_trades: number;
  platform_revenue: number;
  credits_earned: number;
  pending_strategies: number;
  profit_loss: number;
}

interface Message {
  id: string;
  subject: string;
  user_count: number;
  delivery_method: string;
  status: string;
  sent_at: string | null;
  error: string | null;
}

const TEMPLATES = {
  welcome: { subject: 'Welcome to Traderama!', message: 'Hello {user_name}, welcome to Traderama! Start trading with our powerful tools.' },
  reengage: { subject: 'We Miss You!', message: 'Hi {user_name}, it’s been a while! Check out new strategies on Traderama.' },
  premium: { subject: 'Upgrade to Premium', message: 'Hello {user_name}, unlock premium features with a Traderama subscription!' },
};

const ContactManagement: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filterType, setFilterType] = useState<string>('not-opened-30');
  const [days, setDays] = useState<number>(7);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<string>('email');
  const [template, setTemplate] = useState<string>('none');
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [singleUserAction, setSingleUserAction] = useState<string>('');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  // Check user authorization
  useEffect(() => {
    const checkAuthorization = async () => {
      if (authLoading) return;
      
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile to get role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, email')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setUserProfile(profile);
        
        // Check if user is super admin with correct email
        const authorized = profile?.role === 'super_admin' && user.email === 'royan.shaw@gmail.com';
        setIsAuthorized(authorized);

        if (!authorized) {
          toast({
            title: 'Access Denied',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        // If authorized, fetch data
        await fetchData();
      } catch (error) {
        console.error('Error checking authorization:', error);
        toast({
          title: 'Error',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [authLoading, user, toast]);

  // Fetch users and messages
  const fetchData = async () => {
    try {
      // Fetch all user-related data from multiple tables
      const [
        { data: profiles, error: profileError },
        { data: usersData, error: userError },
        { data: kemCredits, error: kemError },
        { data: analytics, error: analyticsError },
        { data: escrowAccounts, error: escrowError },
        { data: strategyCounts, error: strategyCountError },
        { data: tradeCounts, error: tradeCountError }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.auth.admin.listUsers(),
        supabase.from('kem_credits').select('user_id, credits_earned'),
        supabase.from('analytics').select('user_id, total_trades'),
        supabase.from('escrow_accounts').select('user_id, balance'),
        supabase.from('trading_strategies').select('creator_id, status').then(({ data, error }) => {
          const counts = data?.reduce((acc: any, strategy: any) => {
            if (!acc[strategy.creator_id]) {
              acc[strategy.creator_id] = { active: 0, pending: 0 };
            }
            if (strategy.status === 'approved') {
              acc[strategy.creator_id].active++;
            } else if (strategy.status === 'pending') {
              acc[strategy.creator_id].pending++;
            }
            return acc;
          }, {});
          return { data: counts, error };
        }),
        supabase.from('iron_condor_trades').select('user_id, current_pnl, status').then(({ data, error }) => {
          const counts = data?.reduce((acc: any, trade: any) => {
            if (!acc[trade.user_id]) {
              acc[trade.user_id] = { count: 0, totalPnl: 0 };
            }
            acc[trade.user_id].count++;
            acc[trade.user_id].totalPnl += trade.current_pnl || 0;
            return acc;
          }, {});
          return { data: counts, error };
        })
      ]);

      if (profileError || userError) throw new Error('Error fetching user data');

      const mergedUsers = usersData.users
        .filter(u => u.email) // Filter out users without email
        .map((u) => {
          const profile = profiles?.find((p) => p.id === u.id);
          const credits = kemCredits?.find((k) => k.user_id === u.id);
          const userAnalytics = analytics?.find((a) => a.user_id === u.id);
          const escrow = escrowAccounts?.find((e) => e.user_id === u.id);
          const strategies = strategyCounts?.[u.id] || { active: 0, pending: 0 };
          const trades = tradeCounts?.[u.id] || { count: 0, totalPnl: 0 };

          return {
            id: u.id,
            email: u.email!,
            name: profile?.name || null,
            role: profile?.role || 'user',
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at || null,
            is_premium: profile?.is_premium || false,
            phone_number: profile?.phone_number || null,
            email_confirmed_at: u.email_confirmed_at || null,
            wallet_balance: escrow?.balance || 0,
            referral_code: profile?.referral_code || null,
            total_referrals: 0, // Would need a separate query for referrals count
            membership_level: profile?.subscription_tier || 'free',
            active_strategies: strategies.active,
            total_trades: trades.count,
            platform_revenue: trades.totalPnl * 0.05, // Assuming 5% platform fee
            credits_earned: credits?.credits_earned || 0,
            pending_strategies: strategies.pending,
            profit_loss: trades.totalPnl
          };
        });
      setUsers(mergedUsers);

      // Fetch message history
      const { data: messageHistory, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!msgError && messageHistory) {
        setMessages(messageHistory.map(msg => ({
          id: msg.id,
          subject: msg.subject,
          user_count: Array.isArray(msg.user_ids) ? msg.user_ids.length : 0,
          delivery_method: msg.delivery_method,
          status: msg.status,
          sent_at: msg.sent_at,
          error: msg.error
        })));
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error loading data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    if (!users.length) {
      setFilteredUsers([]);
      return;
    }

    const now = new Date();
    let filtered = users.filter((u) => {
      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      
      // Subscription filter
      if (subscriptionFilter === 'premium' && !u.is_premium) return false;
      if (subscriptionFilter === 'non-premium' && u.is_premium) return false;
      
      // Time-based filters
      const createdAt = new Date(u.created_at);
      const lastSignIn = u.last_sign_in_at ? new Date(u.last_sign_in_at) : null;
      const daysSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
      const daysSinceLastSignIn = lastSignIn ? (now.getTime() - lastSignIn.getTime()) / (1000 * 3600 * 24) : Infinity;

      switch (filterType) {
        case 'not-opened-30':
          return !lastSignIn || daysSinceLastSignIn >= 30;
        case 'joined-x-days':
          return daysSinceCreated <= days;
        case 'logged-in-x-days':
          return lastSignIn && daysSinceLastSignIn <= days;
        default:
          return true;
      }
    });

    setFilteredUsers(filtered);
  }, [users, filterType, days, roleFilter, subscriptionFilter]);

  // Load template
  useEffect(() => {
    if (template === 'none') {
      setSubject('');
      setMessage('');
    } else {
      const selectedTemplate = TEMPLATES[template as keyof typeof TEMPLATES];
      setSubject(selectedTemplate.subject);
      setMessage(selectedTemplate.message);
    }
  }, [template]);

  // Send or schedule message
  const handleSendMessage = async (isScheduled: boolean = false) => {
    if (!subject.trim() && deliveryMethod !== 'whatsapp') {
      toast({
        title: 'Subject is required for email delivery',
        variant: 'destructive',
      });
      return;
    }
    
    if (!message.trim()) {
      toast({
        title: 'Message is required',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const targetUsers = selectedUser ? [selectedUser] : filteredUsers;
      const userIds = targetUsers.map(user => user.id);
      
      // Insert message record
      const messageData = {
        super_admin_id: user?.id,
        user_ids: userIds,
        subject,
        message,
        delivery_method: deliveryMethod,
        status: isScheduled ? 'scheduled' : 'processing',
        ...(isScheduled && { scheduled_at: scheduleDate?.toISOString() })
      };

      const tableName = isScheduled ? 'scheduled_messages' : 'messages';
      const { error: insertError } = await supabase
        .from(tableName)
        .insert([messageData]);

      if (insertError) throw insertError;

      if (!isScheduled) {
        // Send notifications via edge function
        const { error: sendError } = await supabase.functions.invoke('send-notifications', {
          body: {
            user_ids: userIds,
            subject,
            message,
            delivery_method: deliveryMethod,
          }
        });

        if (sendError) throw sendError;

        // If this is a notification action, also create notification record
        if (singleUserAction === 'notification') {
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              sender_id: user?.id,
              title: subject,
              content: message,
              notification_type: 'admin_message',
              status: 'sent',
              sent_at: new Date().toISOString(),
              target_audience: { user_ids: userIds }
            });

          if (notificationError) console.error('Error creating notification record:', notificationError);
        }
      }

      toast({
        title: isScheduled ? 'Message scheduled successfully!' : 'Message sent successfully!',
      });

      setIsDialogOpen(false);
      setSubject('');
      setMessage('');
      setScheduleDate(undefined);
      setSelectedUser(null);
      setSingleUserAction('');
      await fetchData();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle file import
  const handleFileImport = async () => {
    if (!importFile) {
      toast({
        title: 'No file selected',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileType = importFile.name.toLowerCase();
      let contacts: any[] = [];

      if (fileType.endsWith('.csv') || fileType.endsWith('.txt')) {
        // Parse CSV file
        Papa.parse(importFile, {
          header: true,
          complete: (results) => {
            contacts = results.data;
          },
          error: (error) => {
            throw new Error(`CSV parsing error: ${error.message}`);
          }
        });
      } else if (fileType.endsWith('.xls') || fileType.endsWith('.xlsx')) {
        toast({
          title: 'Excel files not supported yet',
          variant: 'destructive',
        });
        return;
      } else {
        throw new Error('Unsupported file format. Please use CSV, TXT, XLS, or XLSX files.');
      }

      // Wait for parsing to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (contacts.length === 0) {
        throw new Error('No contacts found in file');
      }

      // Call batch import function
      const { data, error } = await supabase.rpc('batch_import_contacts', {
        p_user_id: user?.id || '',
        p_contacts: contacts
      });

      if (error) throw error;

      toast({
        title: 'Contacts imported successfully',
      });

      setIsImportDialogOpen(false);
      setImportFile(null);
      
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast({
        title: 'Import failed',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  // Export user list
  const exportUserList = () => {
    const csvData = filteredUsers.map(user => ({
      email: user.email,
      name: user.name || '',
      role: user.role,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at || '',
      is_premium: user.is_premium
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `user_list_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSingleUserAction = (user: User, action: string) => {
    setSelectedUser(user);
    setSingleUserAction(action);
    
    // Pre-populate form based on action
    if (action === 'email') {
      setDeliveryMethod('email');
      setSubject(`Message for ${user.name || user.email}`);
      setMessage(`Hello ${user.name || 'there'},\n\nThis is a personal message from the Traderama team.\n\nBest regards,\nTraderama Team`);
    } else if (action === 'whatsapp') {
      setDeliveryMethod('whatsapp');
      setMessage(`Hello ${user.name || 'there'}, this is a message from Traderama!`);
    } else if (action === 'notification') {
      setDeliveryMethod('email');
      setSubject(`System Notification - ${user.name || user.email}`);
      setMessage(`Hello ${user.name || 'there'},\n\nYou have a new notification from Traderama.\n\nPlease check your dashboard for more details.\n\nBest regards,\nTraderama Team`);
    }
    
    setIsDialogOpen(true);
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading contact management...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Access Restricted</h3>
            <p className="text-muted-foreground">This section is restricted to super administrators.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Contact Management</h2>
          <p className="text-muted-foreground">Manage user communications and contact lists</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-2 rounded-lg">
            <Users className="h-4 w-4" />
            <span className="font-medium">{users.length} Total Users</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-accent/10 text-accent-foreground px-3 py-2 rounded-lg">
            <Target className="h-4 w-4" />
            <span className="font-medium">{filteredUsers.length} Filtered</span>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Filter Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="filter-type">Filter Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger id="filter-type">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-opened-30">Not opened in last 30 days</SelectItem>
                <SelectItem value="joined-x-days">Joined within last X days</SelectItem>
                <SelectItem value="logged-in-x-days">Logged in last X days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(filterType === 'joined-x-days' || filterType === 'logged-in-x-days') && (
            <div>
              <Label htmlFor="days">Days</Label>
              <Input
                id="days"
                type="number"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                min={1}
                max={365}
                placeholder="Enter days"
                className="w-full"
              />
            </div>
          )}
          <div>
            <Label htmlFor="role-filter">Role</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger id="role-filter">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="strategy_creator">Strategy Creator</SelectItem>
                <SelectItem value="premium_member">Premium Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subscription-filter">Subscription</Label>
            <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
              <SelectTrigger id="subscription-filter">
                <SelectValue placeholder="Select subscription" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="non-premium">Non-Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-sm font-medium text-foreground">
              {filteredUsers.length} users match the selected filters
            </p>
            <p className="text-xs text-muted-foreground">
              {filteredUsers.length > 0 ? 'Ready to send messages to filtered audience' : 'Adjust filters to see users'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportUserList}
              disabled={filteredUsers.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Contacts
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddUserDialogOpen(true)}
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
            <Button
              onClick={() => {
                setSelectedUser(null);
                setSingleUserAction('');
                setDeliveryMethod('email');
                setTemplate('none');
                setSubject('');
                setMessage('');
                setIsDialogOpen(true);
              }}
              disabled={filteredUsers.length === 0}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-4 w-4 mr-2" />
              Compose Message
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>

      {/* Comprehensive User Management Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Comprehensive User Management Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">UID</TableHead>
                  <TableHead className="min-w-[150px]">Display Name</TableHead>
                  <TableHead className="min-w-[120px]">Phone</TableHead>
                  <TableHead className="min-w-[120px]">Created At</TableHead>
                  <TableHead className="min-w-[100px]">Confirmed</TableHead>
                  <TableHead className="min-w-[120px]">Last Sign In</TableHead>
                  <TableHead className="min-w-[80px]">Active</TableHead>
                  <TableHead className="min-w-[120px]">Wallet Balance</TableHead>
                  <TableHead className="min-w-[120px]">Referral ID</TableHead>
                  <TableHead className="min-w-[120px]">Total Referrals</TableHead>
                  <TableHead className="min-w-[140px]">Membership Level</TableHead>
                  <TableHead className="min-w-[140px]">Active Strategies</TableHead>
                  <TableHead className="min-w-[120px]">Total Trades</TableHead>
                  <TableHead className="min-w-[140px]">Platform Revenue</TableHead>
                  <TableHead className="min-w-[140px]">Credits Earned</TableHead>
                  <TableHead className="min-w-[140px]">Pending Strategies</TableHead>
                  <TableHead className="min-w-[140px]">Profit/(Loss)</TableHead>
                  <TableHead className="min-w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-xs font-mono">{user.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground text-sm">{user.name || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{user.phone_number || '-'}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {user.email_confirmed_at ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">Yes</span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy') : 'Never'}
                      </TableCell>
                      <TableCell>
                        {user.last_sign_in_at && new Date(user.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">Active</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs">Inactive</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-mono">${user.wallet_balance.toFixed(2)}</TableCell>
                      <TableCell className="text-sm font-mono">{user.referral_code || '-'}</TableCell>
                      <TableCell className="text-sm text-center">{user.total_referrals}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          user.membership_level === 'premium' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {user.membership_level.charAt(0).toUpperCase() + user.membership_level.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-center">{user.active_strategies}</TableCell>
                      <TableCell className="text-sm text-center">{user.total_trades}</TableCell>
                      <TableCell className="text-sm font-mono">${user.platform_revenue.toFixed(2)}</TableCell>
                      <TableCell className="text-sm text-center">{user.credits_earned}</TableCell>
                      <TableCell className="text-sm text-center">{user.pending_strategies}</TableCell>
                      <TableCell className={`text-sm font-mono ${
                        user.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${user.profit_loss.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSingleUserAction(user, 'email')}
                            className="h-7 w-7 p-0"
                            title="Send Email"
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSingleUserAction(user, 'whatsapp')}
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                            title="Send WhatsApp"
                          >
                            📱
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSingleUserAction(user, 'notification')}
                            className="h-7 w-7 p-0"
                            title="Send Notification"
                          >
                            🔔
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={18} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No users match the selected filters.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Message History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Message History
          </CardTitle>
        </CardHeader>
        <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent/Scheduled At</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length ? (
              messages.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell>{msg.subject}</TableCell>
                  <TableCell>{msg.user_count}</TableCell>
                  <TableCell>{msg.delivery_method}</TableCell>
                  <TableCell>{msg.status}</TableCell>
                  <TableCell>{msg.sent_at ? format(new Date(msg.sent_at), 'PPp') : 'Scheduled'}</TableCell>
                  <TableCell>{msg.error || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No messages sent yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </CardContent>
      </Card>

      {/* Compose Message Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? `Send Message to ${selectedUser.name || selectedUser.email}` : `Send Message to ${filteredUsers.length} Users`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="template">Template</Label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Custom Message</SelectItem>
                  <SelectItem value="welcome">Welcome New User</SelectItem>
                  <SelectItem value="reengage">Re-engage Inactive</SelectItem>
                  <SelectItem value="premium">Premium Offer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subject (Email Only)</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
                disabled={deliveryMethod === 'whatsapp'}
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-40 p-2 border rounded"
                placeholder="Enter your message (use {user_name}, {user_email} for personalization)"
              />
            </div>
            <div>
              <Label htmlFor="delivery-method">Delivery Method</Label>
              <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                <SelectTrigger id="delivery-method">
                  <SelectValue placeholder="Select delivery method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Schedule Delivery</Label>
              <div className="flex items-center space-x-4">
                <Button
                  variant={scheduleDate ? 'outline' : 'default'}
                  onClick={() => setScheduleDate(undefined)}
                >
                  Send Now
                </Button>
                <Button
                  variant={scheduleDate ? 'default' : 'outline'}
                  onClick={() => setScheduleDate(addDays(new Date(), 1))}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
              {scheduleDate && (
                <Calendar
                  mode="single"
                  selected={scheduleDate}
                  onSelect={setScheduleDate}
                  className="mt-2"
                  disabled={(date) => date < new Date()}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(false);
              setSelectedUser(null);
              setSingleUserAction('');
            }}>
              Cancel
            </Button>
            <Button onClick={() => handleSendMessage(!!scheduleDate)} disabled={isSending}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {scheduleDate ? 'Schedule' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Contact List</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Supported File Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>CSV files (.csv)</li>
                  <li>Tab-delimited files (.txt)</li>
                  <li>Excel files (.xls, .xlsx) - Convert to CSV first</li>
                </ul>
              </CardContent>
            </Card>
            
            <div>
              <Label htmlFor="file-upload">Select File</Label>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.xls,.xlsx"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {importFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {importFile.name}
                </p>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Expected CSV Format</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Your CSV should have these columns:</p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  name,email,phone_number,whatsapp_number,company,notes
                </code>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleFileImport} 
              disabled={!importFile || isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileUp className="h-4 w-4 mr-2" />}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <AddUserForm
        open={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        onUserAdded={fetchData}
      />
    </div>
  );
};

export default ContactManagement;
