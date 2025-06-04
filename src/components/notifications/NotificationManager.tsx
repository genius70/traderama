
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Users, Globe, MapPin, Calendar, Send, DollarSign } from 'lucide-react';

interface NotificationFilter {
  type: 'general' | 'strategy_creator' | 'country' | 'region' | 'activity_based';
  country?: string;
  region?: string;
  lastLoginDays?: number;
  lastCommentDays?: number;
  activityPeriod?: '30' | '60' | '90';
}

const NotificationManager: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [filter, setFilter] = useState<NotificationFilter>({ type: 'general' });
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    setNotifications(data || []);
  };

  const calculateCost = () => {
    if (filter.type === 'strategy_creator') {
      return 3000; // $3000 for emailing entire database
    }
    return 0; // Free for other notification types
  };

  const getEstimatedReach = () => {
    switch (filter.type) {
      case 'general':
        return '1,000 - 10,000 users';
      case 'strategy_creator':
        return '10,000+ users (entire database)';
      case 'country':
        return '500 - 2,000 users';
      case 'region':
        return '200 - 1,000 users';
      case 'activity_based':
        return '100 - 5,000 users';
      default:
        return 'Unknown';
    }
  };

  const handleSendNotification = async () => {
    if (!user || !title || !content) return;

    setLoading(true);

    try {
      const cost = calculateCost();
      
      const { error } = await supabase
        .from('notifications')
        .insert([{
          sender_id: user.id,
          title,
          content,
          notification_type: filter.type,
          target_audience: {
            country: filter.country,
            region: filter.region,
            lastLoginDays: filter.lastLoginDays,
            lastCommentDays: filter.lastCommentDays,
            activityPeriod: filter.activityPeriod
          },
          cost,
          status: cost > 0 ? 'draft' : 'sent',
          sent_at: cost > 0 ? null : new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: cost > 0 ? "Notification Created" : "Notification Sent",
        description: cost > 0 
          ? `Notification created. Payment of $${cost} required to send to entire database.`
          : "Notification has been sent to targeted users.",
      });

      // Reset form
      setTitle('');
      setContent('');
      setFilter({ type: 'general' });
      
      // Refresh notifications list
      await fetchNotifications();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, cost: number) => {
    if (status === 'sent') return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
    if (status === 'draft' && cost > 0) return <Badge className="bg-yellow-100 text-yellow-800">Pending Payment</Badge>;
    if (status === 'scheduled') return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Notification Management</h1>
        <p className="text-lg text-gray-600">Send targeted notifications to your trading community</p>
      </div>

      {/* Create Notification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-6 w-6 text-blue-600" />
            <span>Create New Notification</span>
          </CardTitle>
          <CardDescription>
            Target specific user groups with personalized messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Notification Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Message Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your message"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={filter.type} onValueChange={(value: any) => setFilter({ type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>General Users</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="strategy_creator">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Entire Database ($3,000)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="country">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <span>By Country</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="region">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>By Region</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="activity_based">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>By Activity</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional filters based on type */}
              {filter.type === 'country' && (
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={filter.country || ''}
                    onChange={(e) => setFilter({ ...filter, country: e.target.value })}
                    placeholder="Enter country name"
                  />
                </div>
              )}

              {filter.type === 'region' && (
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Input
                    value={filter.region || ''}
                    onChange={(e) => setFilter({ ...filter, region: e.target.value })}
                    placeholder="Enter region name"
                  />
                </div>
              )}

              {filter.type === 'activity_based' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Last Login Days</Label>
                    <Input
                      type="number"
                      value={filter.lastLoginDays || ''}
                      onChange={(e) => setFilter({ ...filter, lastLoginDays: parseInt(e.target.value) || 0 })}
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Activity Period</Label>
                    <Select 
                      value={filter.activityPeriod || ''} 
                      onValueChange={(value: any) => setFilter({ ...filter, activityPeriod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="60">Last 60 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Preview and Cost */}
            <div className="space-y-4">
              <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Preview & Cost</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Estimated Reach:</Label>
                    <p className="text-sm text-gray-600">{getEstimatedReach()}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Cost:</Label>
                    <p className="text-lg font-bold text-green-600">
                      {calculateCost() > 0 ? `$${calculateCost().toLocaleString()}` : 'Free'}
                    </p>
                  </div>

                  {calculateCost() > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Premium Service:</strong> This notification will be held for payment review before sending.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                onClick={handleSendNotification}
                disabled={loading || !title || !content}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : calculateCost() > 0 ? 'Create Notification' : 'Send Notification'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications History */}
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>View your previously sent notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {getStatusBadge(notification.status, notification.cost)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.content}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Type: {notification.notification_type}</span>
                    <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                    {notification.cost > 0 && (
                      <span className="font-medium">Cost: ${notification.cost.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManager;
