import React, { useState, useEffect } from 'react';
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
import { Loader2, Send, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';

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

  // Restrict to super admin
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.email !== 'royan.shaw@gmail.com' || user.role !== 'super_admin') {
      toast({
        title: 'Access Denied',
        variant: 'destructive',
      });
      return;
    }

    // Fetch users and messages
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, role, name, is_premium');
        const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();

        if (profileError || userError) throw new Error('Error fetching data');

        const mergedUsers = usersData.users.map((u) => ({
          id: u.id,
          email: u.email,
          name: profiles.find((p) => p.id === u.id)?.name || null,
          role: profiles.find((p) => p.id === u.id)?.role || 'user',
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          is_premium: profiles.find((p) => p.id === u.id)?.is_premium || false,
        }));
        setUsers(mergedUsers);

        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('id, subject, user_ids, delivery_method, status, sent_at, error')
          .order('sent_at', { ascending: false });
        if (messagesError) throw new Error('Error fetching messages');

        setMessages(
          messagesData.map((m) => ({
            id: m.id,
            subject: m.subject,
            user_count: m.user_ids.length,
            delivery_method: m.delivery_method,
            status: m.status,
            sent_at: m.sent_at,
            error: m.error,
          }))
        );

        // Real-time subscription for message updates
        supabase
          .channel('messages')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
            setMessages((prev) => [
              ...prev.filter((m) => m.id !== payload.new.id),
              {
                id: payload.new.id,
                subject: payload.new.subject,
                user_count: payload.new.user_ids.length,
                delivery_method: payload.new.delivery_method,
                status: payload.new.status,
                sent_at: payload.new.sent_at,
                error: payload.new.error,
              },
            ]);
          })
          .subscribe();
      } catch (error) {
        toast({
          title: 'Error loading data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user, toast]);

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
      const payload = {
        user_ids: userIds,
        subject,
        message,
        delivery_method: deliveryMethod,
        scheduled_at: isScheduled ? scheduleDate?.toISOString() : null,
      };

      const table = isScheduled ? 'scheduled_messages' : 'messages';
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notifications`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to process notifications');

      const { error } = await supabase.from(table).insert({
        super_admin_id: user.id,
        user_ids: userIds,
        subject,
        message,
        delivery_method: deliveryMethod,
        status: isScheduled ? 'scheduled' : 'queued',
        sent_at: isScheduled ? null : new Date().toISOString(),
        scheduled_at: isScheduled ? scheduleDate?.toISOString() : null,
      });

      if (error) throw new Error('Error logging message');

      toast({
        title: isScheduled ? 'Message scheduled' : 'Message sent',
      });
      setSubject('');
      setMessage('');
      setTemplate('none');
      setScheduleDate(undefined);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Failed to process message',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || user.email !== 'royan.shaw@gmail.com' || user.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Access restricted to super admin.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Contact Management</h2>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Filter Users</h3>
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
        <p className="text-sm text-gray-600">
          {filteredUsers.length} users match the selected filters.
        </p>
        <Button
          onClick={() => setIsDialogOpen(true)}
          disabled={!filteredUsers.length}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-4 w-4 mr-2" />
          Compose Message
        </Button>
      </div>

      {/* Message History Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Message History</h3>
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
      </div>

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
    </div>
  );
};

export default ContactManagement;
