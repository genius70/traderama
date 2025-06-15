
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowUpRight, ArrowDownLeft, Wallet, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useKemCredits } from '@/hooks/useKemCredits';

interface PlatformWalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer_to_platform' | 'transfer_from_platform' | 'kem_conversion';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

const PlatformWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { credits } = useKemCredits();
  const [platformBalance, setPlatformBalance] = useState(0);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDirection, setTransferDirection] = useState<'to_platform' | 'from_platform'>('to_platform');
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [transactions] = useState<PlatformWalletTransaction[]>([
    {
      id: '1',
      type: 'deposit',
      amount: 500,
      description: 'Initial platform wallet deposit',
      status: 'completed',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '2',
      type: 'kem_conversion',
      amount: -50,
      description: 'Converted 1000 KEM credits to USD',
      status: 'completed',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '3',
      type: 'transfer_to_platform',
      amount: -100,
      description: 'Transfer to platform wallet',
      status: 'completed',
      created_at: new Date().toISOString()
    }
  ]);

  useEffect(() => {
    fetchPlatformBalance();
  }, [user]);

  const fetchPlatformBalance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('escrow_accounts')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setPlatformBalance(data?.balance || 0);
    } catch (error) {
      console.error('Error fetching platform balance:', error);
    }
  };

  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid transfer amount",
        variant: "destructive",
      });
      return;
    }

    if (transferDirection === 'from_platform' && amount > platformBalance) {
      toast({
        title: "Insufficient platform balance",
        description: "You don't have enough balance in your platform wallet",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const newBalance = transferDirection === 'to_platform' 
        ? platformBalance + amount 
        : platformBalance - amount;

      const { error } = await supabase
        .from('escrow_accounts')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (error) throw error;

      setPlatformBalance(newBalance);
      setTransferAmount('');
      setShowTransferForm(false);

      toast({
        title: "Transfer completed",
        description: `Successfully ${transferDirection === 'to_platform' ? 'deposited' : 'withdrew'} $${amount.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Error processing transfer:', error);
      toast({
        title: "Transfer failed",
        description: "Failed to process transfer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const convertKemCreditsToUSD = async () => {
    if (credits.available < 100) {
      toast({
        title: "Insufficient KEM credits",
        description: "You need at least 100 KEM credits to convert",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Convert 100 KEM credits to $5 USD (example rate)
      const usdAmount = 5;
      const kemCreditsUsed = 100;
      const newBalance = platformBalance + usdAmount;

      const { error } = await supabase
        .from('escrow_accounts')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (error) throw error;

      setPlatformBalance(newBalance);

      toast({
        title: "Conversion completed",
        description: `Converted ${kemCreditsUsed} KEM credits to $${usdAmount}`,
      });
    } catch (error) {
      console.error('Error converting KEM credits:', error);
      toast({
        title: "Conversion failed",
        description: "Failed to convert KEM credits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'transfer_from_platform':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
      case 'transfer_to_platform':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'kem_conversion':
        return <Coins className="h-4 w-4 text-purple-600" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Wallet Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            Platform Wallet
          </CardTitle>
          <CardDescription>Your platform wallet balance and KEM credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                ${platformBalance.toFixed(2)} USD
              </div>
              <div className="text-sm text-green-700">Platform Balance</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {credits.available}
              </div>
              <div className="text-sm text-purple-700">KEM Credits Available</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowTransferForm(true)}>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Transfer Funds
            </Button>
            <Button 
              variant="outline" 
              onClick={convertKemCreditsToUSD}
              disabled={credits.available < 100 || loading}
            >
              <Coins className="h-4 w-4 mr-2" />
              Convert KEM to USD
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Form */}
      {showTransferForm && (
        <Card>
          <CardHeader>
            <CardTitle>Transfer Funds</CardTitle>
            <CardDescription>Transfer money between your wallets and platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="transfer-direction">Transfer Direction</Label>
              <div className="flex space-x-2 mt-1">
                <Button
                  variant={transferDirection === 'to_platform' ? 'default' : 'outline'}
                  onClick={() => setTransferDirection('to_platform')}
                  className="flex-1"
                >
                  To Platform
                </Button>
                <Button
                  variant={transferDirection === 'from_platform' ? 'default' : 'outline'}
                  onClick={() => setTransferDirection('from_platform')}
                  className="flex-1"
                >
                  From Platform
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="transfer-amount">Amount (USD)</Label>
              <Input
                id="transfer-amount"
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
              {transferDirection === 'from_platform' && (
                <p className="text-xs text-gray-500 mt-1">
                  Available platform balance: ${platformBalance.toFixed(2)}
                </p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleTransfer} disabled={loading} className="flex-1">
                {loading ? 'Processing...' : 'Transfer Funds'}
              </Button>
              <Button variant="outline" onClick={() => setShowTransferForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Wallet Transactions</CardTitle>
          <CardDescription>Recent platform wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div key={transaction.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
                {index < transactions.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformWallet;
