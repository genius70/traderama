
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Link as LinkIcon, Unlink, Shield, ExternalLink, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BrokerConnection {
  id: string;
  broker: string;
  account_id: string;
  is_active: boolean;
  connected_at: string;
}

const BrokerConnections = () => {
  const { toast } = useToast();
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConnection, setNewConnection] = useState({
    broker: '',
    account_id: '',
    api_key: '',
    secret_key: ''
  });

  const availableBrokers = [
    { value: 'ig', label: 'IG Trading' },
    { value: 'interactive_brokers', label: 'Interactive Brokers' },
    { value: 'trade_station', label: 'TradeStation' },
    { value: 'trade_nation', label: 'Trade Nation' },
    { value: 'tradier', label: 'Tradier' },
    { value: 'binance', label: 'Binance (Crypto)' }
  ];

  const handleConnect = () => {
    if (!newConnection.broker || !newConnection.account_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const connection: BrokerConnection = {
      id: Date.now().toString(),
      broker: newConnection.broker,
      account_id: newConnection.account_id,
      is_active: true,
      connected_at: new Date().toISOString()
    };

    setConnections([...connections, connection]);
    setNewConnection({
      broker: '',
      account_id: '',
      api_key: '',
      secret_key: ''
    });
    setShowAddForm(false);

    toast({
      title: "Broker connected successfully",
      description: `Connected to ${availableBrokers.find(b => b.value === newConnection.broker)?.label}`,
    });
  };

  const handleDisconnect = (connectionId: string) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
    toast({
      title: "Broker disconnected",
      description: "Broker connection has been removed",
    });
  };

  const handleIGSignup = () => {
    window.open('https://refer.ig.com/royanuriens-3', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Broker Connections</h3>
          <p className="text-sm text-gray-600">Connect your trading accounts</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Broker
        </Button>
      </div>

      {/* Recommended Broker Card */}
      <Card className="border-2 border-red-500 bg-gradient-to-br from-red-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-700">
            <Star className="h-5 w-5 mr-2 text-red-600" />
            Our Recommended Broker
          </CardTitle>
          <CardDescription className="text-red-600">
            Professional options trading with IG - Perfect for iron condor strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-red-800">IG Trading Platform</h4>
              <p className="text-sm text-red-600 mb-4">
                Advanced options trading platform with competitive spreads and professional tools
              </p>
              <ul className="text-xs text-red-600 space-y-1">
                <li>• Options trading with real-time data</li>
                <li>• Advanced charting and analysis tools</li>
                <li>• API integration for automated trading</li>
                <li>• Professional risk management</li>
              </ul>
            </div>
            <Button 
              onClick={handleIGSignup}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300 font-bold px-6 py-3 rounded-lg border-2 border-red-800"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open IG Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add New Connection Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Connect New Broker
            </CardTitle>
            <CardDescription>
              Your credentials are encrypted and stored securely
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="broker">Broker *</Label>
              <Select
                value={newConnection.broker}
                onValueChange={(value) => setNewConnection({...newConnection, broker: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a broker" />
                </SelectTrigger>
                <SelectContent>
                  {availableBrokers.map((broker) => (
                    <SelectItem key={broker.value} value={broker.value}>
                      {broker.label}
                      {broker.value === 'ig' && <Badge className="ml-2 bg-red-100 text-red-800">Recommended</Badge>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="account_id">Account ID *</Label>
              <Input
                id="account_id"
                value={newConnection.account_id}
                onChange={(e) => setNewConnection({...newConnection, account_id: e.target.value})}
                placeholder="Your account ID"
              />
            </div>

            <div>
              <Label htmlFor="api_key">API Key *</Label>
              <Input
                id="api_key"
                type="password"
                value={newConnection.api_key}
                onChange={(e) => setNewConnection({...newConnection, api_key: e.target.value})}
                placeholder="Your API key"
              />
            </div>

            <div>
              <Label htmlFor="secret_key">Secret Key *</Label>
              <Input
                id="secret_key"
                type="password"
                value={newConnection.secret_key}
                onChange={(e) => setNewConnection({...newConnection, secret_key: e.target.value})}
                placeholder="Your secret key"
              />
            </div>

            {newConnection.broker === 'ig' && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">IG API Integration Steps:</h4>
                <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
                  <li>Open an IG trading account using our referral link above</li>
                  <li>Apply for API access in your IG account settings</li>
                  <li>Generate your API key and credentials</li>
                  <li>Enter your credentials here to connect</li>
                </ol>
              </div>
            )}

            <div className="flex space-x-2">
              <Button onClick={handleConnect}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Connect
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected Brokers */}
      <div className="space-y-4">
        {connections.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <LinkIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No brokers connected</h3>
              <p className="text-gray-600 mb-4">Connect your trading accounts to start trading</p>
              <Button onClick={() => setShowAddForm(true)}>
                Connect Your First Broker
              </Button>
            </CardContent>
          </Card>
        ) : (
          connections.map((connection) => (
            <Card key={connection.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">
                          {availableBrokers.find(b => b.value === connection.broker)?.label}
                        </h4>
                        <Badge variant={connection.is_active ? "default" : "secondary"}>
                          {connection.is_active ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Account: {connection.account_id}</p>
                      <p className="text-xs text-gray-500">
                        Connected: {new Date(connection.connected_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(connection.id)}
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BrokerConnections;
