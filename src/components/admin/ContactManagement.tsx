import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, Clock, Upload, FileUp, Download, Mail, Users, Target, UserPlus, Phone, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format, addDays } from 'date-fns';
import Papa from 'papaparse';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown } from 'lucide-react';
import AddUserForm from './AddUserForm';
import UserFilterSection from './UserFilterSection';
import UserTable from './UserTable';
import MessageComposer from './MessageComposer';

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
  welcome: { 
    subject: 'Welcome to Traderama!', 
    message: 'Hello {user_name}, welcome to Traderama! Start trading with our powerful tools.' 
  },
  reengage: { 
    subject: 'We Miss You!', 
    message: 'Hi {user_name}, it has been a while! Check out new strategies on Traderama.' 
  },
  premium: { 
    subject: 'Upgrade to Premium', 
    message: 'Hello {user_name}, unlock premium features with a Traderama subscription!' 
  },
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
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof User | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [emailList, setEmailList] = useState<string[]>([]);
  const [sendProgress, setSendProgress] = useState<number>(0);
  const [recipientMode, setRecipientMode] = useState<'all' | 'selected' | 'single'>('selected');

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
        { data: kemCredits, error: kemError },
        { data: analytics, error: analyticsError },
        { data: escrowAccounts, error: escrowError },
        { data: strategyCounts, error: strategyCountError },
        { data: tradeCounts, error: tradeCountError },
        { data: referralCounts, error: referralError }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
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
        }),
        // Count referrals by grouping profiles by referred_by
        supabase.from('profiles').select('referred_by').then(({ data, error }) => {
          const counts = data?.reduce((acc: any, profile: any) => {
            if (profile.referred_by) {
              acc[profile.referred_by] = (acc[profile.referred_by] || 0) + 1;
            }
            return acc;
          }, {});
          return { data: counts, error };
        })
      ]);

      if (profileError) throw new Error('Error fetching user profiles');

      // Use profiles as the main data source instead of auth users
      const mergedUsers = profiles
        ?.filter(profile => profile.email) // Filter out profiles without email
        .map((profile) => {
          const credits = kemCredits?.find((k) => k.user_id === profile.id);
          const userAnalytics = analytics?.find((a) => a.user_id === profile.id);
          const escrow = escrowAccounts?.find((e) => e.user_id === profile.id);
          const strategies = strategyCounts?.[profile.id] || { active: 0, pending: 0 };
          const trades = tradeCounts?.[profile.id] || { count: 0, totalPnl: 0 };
          const referrals = referralCounts?.[profile.referral_code || ''] || 0;

          return {
            id: profile.id,
            email: profile.email,
            name: profile.name || null,
            role: profile.role || 'user',
            created_at: profile.created_at,
            last_sign_in_at: null, // Not available from profiles table
            is_premium: profile.is_premium || false,
            phone_number: profile.phone_number || null,
            email_confirmed_at: profile.profile_completed_at || null, // Using profile completion as proxy
            wallet_balance: escrow?.balance || 0,
            referral_code: profile.referral_code || null,
            total_referrals: referrals,
            membership_level: profile.subscription_tier || 'free',
            active_strategies: strategies.active,
            total_trades: trades.count,
            platform_revenue: trades.totalPnl * 0.05, // Assuming 5% platform fee
            credits_earned: credits?.credits_earned || 0,
            pending_strategies: strategies.pending,
            profit_loss: trades.totalPnl
          };
        }) || [];
      
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

  // Apply filters with enhanced filtering including active-in-last-x-days
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
        case 'active-in-last-x-days':
          return lastSignIn && daysSinceLastSignIn <= days && u.active_strategies > 0;
        default:
          return true;
      }
    });

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
        if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return sortDirection === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
    }

    setFilteredUsers(filtered);
  }, [users, filterType, days, roleFilter, subscriptionFilter, sortColumn, sortDirection]);

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

  // Handle checkbox selection
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle column sorting
  const handleSort = (column: keyof User) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle email list generation
  const handleGenerateEmailList = () => {
    let emails: string[] = [];
    
    if (recipientMode === 'all') {
      emails = users.map(user => user.email);
    } else if (recipientMode === 'selected' && selectedUsers.length > 0) {
      emails = filteredUsers.filter(u => selectedUsers.includes(u.id)).map(u => u.email);
    } else if (recipientMode === 'single' && selectedUser) {
      emails = [selectedUser.email];
    } else {
      const selectedEmails = filteredUsers
        .filter(user => selectedUsers.includes(user.id))
        .map(user => user.email);
      emails = selectedEmails;
    }
    
    setEmailList(emails);
    
    if (emails.length > 0) {
      setIsDialogOpen(true);
      toast({
        title: `${emails.length} ${emails.length === 1 ? 'user' : 'users'} selected`,
      });
    } else {
      toast({
        title: 'Please select at least one user',
        variant: 'destructive',
      });
    }
  };

  // Send or schedule message with enhanced targeting
  const handleSendMessage = async (isScheduled: boolean = false) => {
    // Validate inputs
    if (!subject.trim() && deliveryMethod === 'email') {
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

    if (emailList.length === 0) {
      toast({
        title: 'No recipients selected',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    setSendProgress(0);
    
    try {
      const targetUsers = emailList.length > 0 
        ? filteredUsers.filter(user => emailList.includes(user.email))
        : filteredUsers;

      const userIds = targetUsers.map(user => user.id);
      
      setSendProgress(10);
      
      // Insert message record
      const messageData = {
        super_admin_id: user?.id,
        user_ids: userIds,
        subject: subject.trim(),
        message: message.trim(),
        delivery_method: deliveryMethod,
        status: isScheduled ? 'scheduled' : 'processing',
        ...(isScheduled && { scheduled_at: scheduleDate?.toISOString() })
      };

      const tableName = isScheduled ? 'scheduled_messages' : 'messages';
      const { error: insertError } = await supabase
        .from(tableName)
        .insert([messageData]);

      if (insertError) throw insertError;
      
      setSendProgress(30);

      if (!isScheduled) {
        // Send notifications via edge function
        const { data, error: sendError } = await supabase.functions.invoke('send-notifications', {
          body: {
            user_ids: userIds,
            subject: subject.trim(),
            message: message.trim(),
            delivery_method: deliveryMethod,
          }
        });

        if (sendError) throw sendError;
        
        setSendProgress(80);

        // Create notification records for in-app notifications
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            sender_id: user?.id,
            title: subject.trim(),
            content: message.trim(),
            notification_type: 'admin_message',
            status: 'sent',
            sent_at: new Date().toISOString(),
            target_audience: { user_ids: userIds },
          });

        if (notificationError) console.error('Notification record error:', notificationError);
        
        setSendProgress(100);

        toast({
          title: `Delivered to ${emailList.length} ${emailList.length === 1 ? 'user' : 'users'}`,
        });
      } else {
        toast({
          title: `Will be sent to ${emailList.length} users on ${format(scheduleDate || new Date(), 'PPP at p')}`,
        });
      }

      // Reset form
      setIsDialogOpen(false);
      setSubject('');
      setMessage('');
      setEmailList([]);
      setSelectedUsers([]);
      setSelectedUser(null);
      setRecipientMode('selected');
      setSendProgress(0);
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      setSendProgress(0);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Contact Management & Messaging
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Manage users and send targeted messages to your audience.
          </p>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <UserFilterSection
        filterType={filterType}
        setFilterType={setFilterType}
        days={days}
        setDays={setDays}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        subscriptionFilter={subscriptionFilter}
        setSubscriptionFilter={setSubscriptionFilter}
        filteredUsers={filteredUsers}
        selectedUsers={selectedUsers}
        handleGenerateEmailList={handleGenerateEmailList}
        setIsDialogOpen={setIsDialogOpen}
        setIsImportDialogOpen={setIsImportDialogOpen}
        setIsAddUserDialogOpen={setIsAddUserDialogOpen}
        exportUserList={exportUserList}
      />

      {/* User Management Table */}
      <UserTable
        filteredUsers={filteredUsers}
        selectedUsers={selectedUsers}
        handleSelectAll={handleSelectAll}
        handleSelectUser={handleSelectUser}
        handleSort={handleSort}
        handleSingleUserAction={handleSingleUserAction}
        emailList={emailList}
      />

      {/* Message Composer Dialog */}
      <MessageComposer
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        subject={subject}
        setSubject={setSubject}
        message={message}
        setMessage={setMessage}
        deliveryMethod={deliveryMethod}
        setDeliveryMethod={setDeliveryMethod}
        template={template}
        setTemplate={setTemplate}
        scheduleDate={scheduleDate}
        setScheduleDate={setScheduleDate}
        selectedUsers={selectedUser ? [selectedUser] : filteredUsers.filter(user => selectedUsers.includes(user.id))}
        filteredUsers={filteredUsers}
        emailList={emailList}
        setEmailList={setEmailList}
        sendProgress={sendProgress}
        isSending={isSending}
        handleSendMessage={handleSendMessage}
      />

      {/* File Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Contacts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.txt,.xls,.xlsx"
                onChange={handleFileSelect}
                ref={fileInputRef}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Supported formats: CSV, TXT, XLS, XLSX
              </p>
            </div>
            {importFile && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Selected file:</strong> {importFile.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Size: {(importFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFileImport} disabled={!importFile || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-4 w-4" />
                  Import Contacts
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <AddUserForm 
            open={isAddUserDialogOpen}
            onOpenChange={setIsAddUserDialogOpen}
            onUserAdded={() => {
              fetchData();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactManagement;
