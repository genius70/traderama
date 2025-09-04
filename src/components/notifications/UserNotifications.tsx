import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bell, BellOff, Check, Clock, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  content: string;
  notification_type: string;
  status: string | null;
  sent_at: string | null;
  created_at: string | null;
  is_read?: boolean;
  delivered_at?: string | null;
  read_at?: string | null;
}

const UserNotifications: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch notifications sent to this user
      const { data: notificationData, error } = await supabase
        .from('notifications')
        .select(`
          id,
          title,
          content,
          notification_type,
          status,
          sent_at,
          created_at,
          notification_recipients!inner(
            delivered_at,
            read_at,
            user_id
          )
        `)
        .eq('notification_recipients.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include read status
      const transformedNotifications = notificationData?.map(notification => ({
        ...notification,
        is_read: !!notification.notification_recipients?.[0]?.read_at,
        delivered_at: notification.notification_recipients?.[0]?.delivered_at,
        read_at: notification.notification_recipients?.[0]?.read_at,
      })) || [];

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error loading notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notification_recipients')
        .update({ read_at: new Date().toISOString() })
        .eq('notification_id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );

      toast({
        title: 'Notification marked as read',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error updating notification',
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      const notificationIds = unreadNotifications.map(n => n.id);

      if (notificationIds.length === 0) return;

      const { error } = await supabase
        .from('notification_recipients')
        .update({ read_at: new Date().toISOString() })
        .in('notification_id', notificationIds)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );

      toast({
        title: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error updating notifications',
        variant: 'destructive',
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'read') return notification.is_read;
    if (filter === 'unread') return !notification.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'admin_message':
        return <Mail className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Bell className="h-8 w-8 animate-pulse mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className="rounded-r-none"
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="rounded-none border-x"
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('read')}
              className="rounded-l-none"
            >
              Read
            </Button>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <Card key={notification.id} className={`transition-all ${notification.is_read ? 'opacity-75' : 'border-primary/20'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${notification.is_read ? 'bg-muted' : 'bg-primary/10'}`}>
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className={`font-medium ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 ${notification.is_read ? 'text-muted-foreground' : 'text-foreground/80'}`}>
                          {notification.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className={getStatusColor(notification.status)}>
                            {notification.status || 'pending'}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {notification.sent_at
                              ? format(new Date(notification.sent_at), 'MMM d, yyyy h:mm a')
                              : notification.created_at 
                                ? format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')
                                : 'Unknown date'
                            }
                          </span>
                        </div>
                      </div>
                      
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="flex-shrink-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'read' ? 'No read notifications' : 
                 'No notifications yet'}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'all' ? 
                  "You'll see admin messages and system notifications here." :
                  `Switch to ${filter === 'unread' ? 'read' : 'unread'} to see other notifications.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserNotifications;