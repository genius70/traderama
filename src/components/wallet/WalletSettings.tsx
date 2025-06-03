
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Wallet, CreditCard, Receipt, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WalletData {
  id: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

const WalletSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWalletData();
      fetchTransactions();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user?.id)
        .eq('currency', 'USD')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setWallet(data);
      } else {
        // Create wallet if it doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('user_wallets')
          .insert({
            user_id: user?.id,
            balance: 0,
            currency: 'USD'
          })
          .select()
          .single();

        if (createError) throw createError;
        setWallet(newWallet);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast({
        title: "Error loading wallet",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          wallet_id!inner(user_id)
        `)
        .eq('wallet_id.user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || !wallet) return;
    
    setIsLoading(true);
    try {
      // In a real app, this would integrate with payment providers
      const amount = parseFloat(depositAmount);
      
      // Add transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          transaction_type: 'deposit',
          amount: amount,
          description: 'Wallet deposit',
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      // Update wallet balance
      const { error: updateError } = await supabase
        .from('user_wallets')
        .update({ balance: wallet.balance + amount })
        .eq('id', wallet.id);

      if (updateError) throw updateError;

      toast({
        title: "Deposit successful",
        description: `$${amount} has been added to your wallet`,
      });

      setDepositAmount('');
      fetchWalletData();
      fetchTransactions();
    } catch (error) {
      toast({
        title: "Deposit failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'withdrawal': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'fee': return <CreditCard className="h-4 w-4 text-orange-500" />;
      case 'profit': return <DollarSign className="h-4 w-4 text-green-500" />;
      default: return <Wallet className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            Wallet Balance
          </CardTitle>
          <CardDescription>Manage your trading funds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 mb-4">
            ${wallet?.balance?.toFixed(2) || '0.00'} USD
          </div>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="deposit">Deposit Amount</Label>
              <Input
                id="deposit"
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleDeposit} 
              disabled={!depositAmount || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Processing...' : 'Deposit'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Your latest wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <p className="font-medium capitalize">
                        {transaction.transaction_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-500">{transaction.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.transaction_type === 'deposit' || transaction.transaction_type === 'profit' 
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'profit' ? '+' : '-'}
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                      {transaction.status}
                    </Badge>
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

export default WalletSettings;
