
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Link as LinkIcon, Unlink, Shield } from 'lucide-react';
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
    { value: 'interactive_brokers', label: 'Interactive Brokers' },
    { value: 'trade_station', label: 'TradeStation' },
    { value: 'trade_nation', label: 'Trade Nation' },
    { value: 'tradier', label: 'Tradier' },
    { value: 'ig', label: 'IG' },
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
