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
import { Loader2, Send, Clock, Upload, FileUp, Download, Mail, Users, Target } from 'lucide-react';
import { format, addDays } from 'date-fns';
import Papa from 'papaparse';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_premium: boolean;
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
      // Fetch profiles with all required fields
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, name, is_premium, created_at, subscription_tier');
      
      const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();

      if (profileError || userError) throw new Error('Error fetching data');

      const mergedUsers = usersData.users
        .filter(u => u.email) // Filter out users without email
        .map((u) => ({
          id: u.id,
          email: u.email!,
          name: profiles?.find((p) => p.id === u.id)?.name || null,
          role: profiles?.find((p) => p.id === u.id)?.role || 'user',
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at || null,
          is_premium: profiles?.find((p) => p.id === u.id)?.is_premium || false,
        }));
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
    if (!users.length) return;

    const now = new Date();
    const filtered = users.filter((u) => {
      const createdAt = new Date(u.created_at);
      const lastSignIn = u.last_sign_in_at ? new Date(u.last_sign_in_at) : null;
      const daysDiff = (now.getTime() - (lastSignIn?.getTime() || now.getTime())) / (1000 * 3600 * 24);

      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (subscriptionFilter !== 'all' && u.is_premium !== (subscriptionFilter === 'premium')) return false;

      switch (filterType) {
        case 'not-opened-30':
          return !lastSignIn || daysDiff >= 30;
        case 'joined-x-days':
          return (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24) <= days;
        case 'logged-in-x-days':
          return lastSignIn && daysDiff <= days;
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
    if (!subject || !message || (!isScheduled && !deliveryMethod)) {
      toast({
        title: 'Required fields missing',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const userIds = filteredUsers.map((u) => u.id);
      
      if (isScheduled) {
        // Save to scheduled_messages table
        const { error } = await supabase
          .from('scheduled_messages')
          .insert({
            user_ids: userIds,
            subject,
            message,
            delivery_method: deliveryMethod,
            scheduled_at: scheduleDate?.toISOString() || new Date().toISOString(),
            status: 'pending'
          });

        if (error) throw error;
        
        toast({
          title: 'Message scheduled successfully',
        });
      } else {
        // Save to messages table and invoke edge function
        const { error } = await supabase
          .from('messages')
          .insert({
            user_ids: userIds,
            subject,
            message,
            delivery_method: deliveryMethod,
            status: 'pending'
          });

        if (error) throw error;

        // Call edge function to send messages
        const { error: sendError } = await supabase.functions.invoke('send-notifications', {
          body: {
            user_ids: userIds,
            subject,
            message,
            delivery_method: deliveryMethod
          }
        });

        if (sendError) throw sendError;

        toast({
          title: 'Messages sent successfully',
        });
      }
      
      setSubject('');
      setMessage('');
      setTemplate('none');
      setScheduleDate(undefined);
      setIsDialogOpen(false);
      
      // Refresh data
      const fetchData = async () => {
        const { data: messageHistory } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (messageHistory) {
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
      };
      fetchData();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Failed to process message',
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{users.length} total users</span>
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
              Ready to send messages to filtered audience
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportUserList}
              disabled={!filteredUsers.length}
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
              onClick={() => setIsDialogOpen(true)}
              disabled={!filteredUsers.length}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Compose Message
            </Button>
          </div>
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
            <DialogTitle>Send Message to {filteredUsers.length} Users</DialogTitle>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
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
    </div>
  );
};

export default ContactManagement;
