import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Eye, 
  MousePointerClick, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle,
  BarChart3,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Campaign {
  id: string;
  subject: string;
  message: string;
  total_recipients: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  failed_count: number;
  status: string;
  sent_at: string | null;
  created_at: string;
}

interface EmailTracking {
  id: string;
  email: string;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  open_count: number;
  click_count: number;
  error_message: string | null;
  created_at: string;
}

export const CampaignReporting: React.FC = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [emailTracking, setEmailTracking] = useState<EmailTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: 'Error loading campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignTracking = async (campaignId: string) => {
    try {
      const { data, error } = await supabase
        .from('email_tracking')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmailTracking(data || []);
    } catch (error) {
      console.error('Error fetching tracking:', error);
      toast({
        title: 'Error loading tracking data',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCampaigns();
    if (selectedCampaign) {
      await fetchCampaignTracking(selectedCampaign.id);
    }
    setRefreshing(false);
    toast({
      title: 'Data refreshed',
    });
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchCampaignTracking(selectedCampaign.id);
    }
  }, [selectedCampaign]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      queued: { variant: 'default' as const, label: 'Queued' },
      sending: { variant: 'default' as const, label: 'Sending' },
      sent: { variant: 'default' as const, label: 'Sent' },
      completed: { variant: 'default' as const, label: 'Completed' },
      failed: { variant: 'destructive' as const, label: 'Failed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateEngagementRate = (opened: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((opened / total) * 100);
  };

  const calculateClickRate = (clicked: number, opened: number) => {
    if (opened === 0) return 0;
    return Math.round((clicked / opened) * 100);
  };

  const getQueuedEmails = () => {
    return emailTracking.filter(t => t.status === 'queued').length;
  };

  const getSendingEmails = () => {
    return emailTracking.filter(t => t.status === 'sending').length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading campaign data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campaign Reporting</h2>
          <p className="text-muted-foreground">Track email campaign performance and engagement</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      {selectedCampaign && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedCampaign.sent_count}</div>
              <p className="text-xs text-muted-foreground">
                of {selectedCampaign.total_recipients} recipients
              </p>
              <Progress 
                value={(selectedCampaign.sent_count / selectedCampaign.total_recipients) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateEngagementRate(selectedCampaign.opened_count, selectedCampaign.sent_count)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedCampaign.opened_count} opened
              </p>
              <Progress 
                value={calculateEngagementRate(selectedCampaign.opened_count, selectedCampaign.sent_count)} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateClickRate(selectedCampaign.clicked_count, selectedCampaign.opened_count)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedCampaign.clicked_count} clicked
              </p>
              <Progress 
                value={calculateClickRate(selectedCampaign.clicked_count, selectedCampaign.opened_count)} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedCampaign.failed_count}</div>
              <p className="text-xs text-muted-foreground">
                {selectedCampaign.bounced_count} bounced
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign List and Details */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">
            <BarChart3 className="mr-2 h-4 w-4" />
            All Campaigns
          </TabsTrigger>
          {selectedCampaign && (
            <TabsTrigger value="details">
              <Mail className="mr-2 h-4 w-4" />
              Campaign Details
            </TabsTrigger>
          )}
          {selectedCampaign && (
            <TabsTrigger value="queue">
              <Clock className="mr-2 h-4 w-4" />
              Email Queue
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>View all email campaigns and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Open Rate</TableHead>
                    <TableHead>Click Rate</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.subject}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>{campaign.total_recipients}</TableCell>
                      <TableCell>{campaign.sent_count}</TableCell>
                      <TableCell>
                        {calculateEngagementRate(campaign.opened_count, campaign.sent_count)}%
                      </TableCell>
                      <TableCell>
                        {calculateClickRate(campaign.clicked_count, campaign.opened_count)}%
                      </TableCell>
                      <TableCell>
                        {campaign.sent_at 
                          ? format(new Date(campaign.sent_at), 'MMM dd, yyyy')
                          : format(new Date(campaign.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCampaign(campaign)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedCampaign && (
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{selectedCampaign.subject}</CardTitle>
                <CardDescription>Campaign details and recipient tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Message Preview</h4>
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap">{selectedCampaign.message}</pre>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Campaign Info</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Status:</dt>
                          <dd>{getStatusBadge(selectedCampaign.status)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Created:</dt>
                          <dd>{format(new Date(selectedCampaign.created_at), 'PPp')}</dd>
                        </div>
                        {selectedCampaign.sent_at && (
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Sent:</dt>
                            <dd>{format(new Date(selectedCampaign.sent_at), 'PPp')}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Performance Metrics</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Delivery Rate:</dt>
                          <dd className="font-medium">
                            {calculateEngagementRate(
                              selectedCampaign.sent_count - selectedCampaign.failed_count,
                              selectedCampaign.sent_count
                            )}%
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Bounce Rate:</dt>
                          <dd className="font-medium">
                            {calculateEngagementRate(selectedCampaign.bounced_count, selectedCampaign.sent_count)}%
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Engagement Score:</dt>
                          <dd className="font-medium">
                            {Math.round(
                              (selectedCampaign.opened_count + selectedCampaign.clicked_count * 2) /
                              selectedCampaign.sent_count * 100
                            )}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recipient Tracking</CardTitle>
                <CardDescription>Individual email delivery and engagement status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Opened</TableHead>
                      <TableHead>Clicked</TableHead>
                      <TableHead>Opens</TableHead>
                      <TableHead>Clicks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailTracking.map((tracking) => (
                      <TableRow key={tracking.id}>
                        <TableCell className="font-medium">{tracking.email}</TableCell>
                        <TableCell>{getStatusBadge(tracking.status)}</TableCell>
                        <TableCell>
                          {tracking.sent_at ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              {format(new Date(tracking.sent_at), 'MMM dd, HH:mm')}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {tracking.opened_at ? (
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-blue-500" />
                              {format(new Date(tracking.opened_at), 'MMM dd, HH:mm')}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {tracking.clicked_at ? (
                            <div className="flex items-center gap-1">
                              <MousePointerClick className="h-3 w-3 text-purple-500" />
                              {format(new Date(tracking.clicked_at), 'MMM dd, HH:mm')}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{tracking.open_count}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{tracking.click_count}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {selectedCampaign && (
          <TabsContent value="queue" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Queue</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getQueuedEmails()}</div>
                  <p className="text-xs text-muted-foreground">Waiting to send</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sending</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getSendingEmails()}</div>
                  <p className="text-xs text-muted-foreground">Currently processing</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedCampaign.sent_count}
                  </div>
                  <p className="text-xs text-muted-foreground">Successfully sent</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Email Queue Status</CardTitle>
                <CardDescription>Real-time status of emails in the sending queue</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Queued At</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailTracking
                      .filter(t => ['queued', 'sending', 'failed'].includes(t.status))
                      .map((tracking) => (
                        <TableRow key={tracking.id}>
                          <TableCell className="font-medium">{tracking.email}</TableCell>
                          <TableCell>{getStatusBadge(tracking.status)}</TableCell>
                          <TableCell>
                            {format(new Date(tracking.created_at), 'MMM dd, HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            {tracking.sent_at ? format(new Date(tracking.sent_at), 'MMM dd, HH:mm:ss') : '-'}
                          </TableCell>
                          <TableCell>
                            {tracking.error_message ? (
                              <span className="text-xs text-destructive">{tracking.error_message}</span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default CampaignReporting;
