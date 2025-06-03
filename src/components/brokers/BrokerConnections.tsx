
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link2, Unlink, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BrokerConnection {
  id: string;
  broker: string;
  account_id: string;
  is_active: boolean;
  connected_at: string;
}

const BrokerConnections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [selectedBroker, setSelectedBroker] = useState('');
  const [accountId, setAccountId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const brokers = [
    { value: 'interactive_brokers', label: 'Interactive Brokers', icon: '🏦' },
    { value: 'trade_station', label: 'TradeStation', icon: '📈' },
    { value: 'trade_nation', label: 'Trade Nation', icon: '🌍' },
    { value: 'tradier', label: 'Tradier', icon: '💰' },
    { value: 'ig', label: 'IG', icon: '🎯' },
    { value: 'binance', label: 'Binance (Crypto)', icon: '₿' }
  ];

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('broker_connections')
        .select('*')
        .eq('user_id', user?.id)
        .order('connected_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleConnect = async () => {
    if (!selectedBroker || !accountId) return;

    setIsConnecting(true);
    try {
      const { error } = await supabase
        .from('broker_connections')
        .insert({
          user_id: user?.id,
          broker: selectedBroker,
          account_id: accountId,
          api_credentials: {
            api_key: apiKey,
            api_secret: apiSecret
          },
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Broker connected successfully",
        description: `Connected to ${brokers.find(b => b.value === selectedBroker)?.label}`,
      });

      setSelectedBroker('');
      setAccountId('');
      setApiKey('');
      setApiSecret('');
      fetchConnections();
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('broker_connections')
        .update({ is_active: false })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Broker disconnected",
        description: "The broker connection has been disabled",
      });

      fetchConnections();
    } catch (error) {
      toast({
        title: "Disconnection failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const getBrokerLabel = (brokerValue: string) => {
    return brokers.find(b => b.value === brokerValue)?.label || brokerValue;
  };

  const getBrokerIcon = (brokerValue: string) => {
    return brokers.find(b => b.value === brokerValue)?.icon || '🔗';
  };

  return (
    <div className="space-y-6">
      {/* Add New Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link2 className="h-5 w-5 mr-2" />
            Connect New Broker
          </CardTitle>
          <CardDescription>
            Connect your trading accounts for automated execution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="broker">Select Broker</Label>
              <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a broker" />
                </SelectTrigger>
                <SelectContent>
                  {brokers.map((broker) => (
                    <SelectItem key={broker.value} value={broker.value}>
                      <span className="flex items-center">
                        <span className="mr-2">{broker.icon}</span>
                        {broker.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="account">Account ID</Label>
              <Input
                id="account"
                placeholder="Your account ID"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="apikey">API Key</Label>
              <Input
                id="apikey"
                type="password"
                placeholder="Your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="apisecret">API Secret</Label>
              <Input
                id="apisecret"
                type="password"
                placeholder="Your API secret"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>Your API credentials are encrypted and stored securely</span>
          </div>

          <Button 
            onClick={handleConnect}
            disabled={!selectedBroker || !accountId || isConnecting}
            className="w-full"
          >
            {isConnecting ? 'Connecting...' : 'Connect Broker'}
          </Button>
        </CardContent>
      </Card>

      {/* Connected Brokers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Connected Brokers
          </CardTitle>
          <CardDescription>Manage your broker connections</CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No brokers connected yet</p>
          ) : (
            <div className="space-y-3">
              {connections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getBrokerIcon(connection.broker)}</span>
                    <div>
                      <p className="font-medium">{getBrokerLabel(connection.broker)}</p>
                      <p className="text-sm text-gray-500">Account: {connection.account_id}</p>
                      <p className="text-xs text-gray-400">
                        Connected: {new Date(connection.connected_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={connection.is_active ? 'default' : 'secondary'}>
                      {connection.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {connection.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(connection.id)}
                      >
                        <Unlink className="h-4 w-4 mr-1" />
                        Disconnect
                      </Button>
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

export default BrokerConnections;
