
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Receipt, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'fee' | 'profit' | 'subscription';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

const WalletSettings = () => {
  const { toast } = useToast();
  const [balance, setBalance] = useState(1250.50);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');

  const [transactions] = useState<WalletTransaction[]>([
    {
      id: '1',
      type: 'deposit',
      amount: 1000,
      description: 'Initial deposit via Stripe',
      status: 'completed',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '2',
      type: 'subscription',
      amount: -30,
      description: 'Premium subscription payment',
      status: 'completed',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '3',
      type: 'profit',
      amount: 280.50,
      description: 'Iron Condor trade profit',
      status: 'completed',
      created_at: new Date().toISOString()
    }
  ]);

  const paymentProviders = [
    { value: 'stripe', label: 'Stripe (Credit/Debit Cards)' },
    { value: 'wise', label: 'Wise (Bank Transfer)' },
    { value: 'airtm', label: 'AirTM (Multiple Options)' }
  ];

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
    toast({
      title: "Invalid amount",
      variant: "destructive",
    });
      return;
    }

    if (!selectedProvider) {
    toast({
      title: "Payment provider required",
      variant: "destructive",
    });
      return;
    }

    // Simulate deposit processing
    setBalance(prev => prev + amount);
    setDepositAmount('');
    setSelectedProvider('');
    setShowDepositForm(false);

  toast({
    title: "Deposit initiated",
  });
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
    toast({
      title: "Invalid amount",
      variant: "destructive",
    });
      return;
    }

    if (amount > balance) {
    toast({
      title: "Insufficient funds",
      variant: "destructive",
    });
      return;
    }

    // Simulate withdrawal processing
    setBalance(prev => prev - amount);
    setWithdrawAmount('');
    setShowWithdrawForm(false);

  toast({
    title: "Withdrawal initiated",
  });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'profit':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'subscription':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-gray-600" />;
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
      <div>
        <h3 className="text-lg font-semibold">Wallet & Payments</h3>
        <p className="text-sm text-gray-600">Manage your funds and payment methods</p>
      </div>

      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            Account Balance
          </CardTitle>
          <CardDescription>Your current available balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 mb-4">
            ${balance.toFixed(2)} USD
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowDepositForm(true)} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Deposit
            </Button>
            <Button variant="outline" onClick={() => setShowWithdrawForm(true)}>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Form */}
      {showDepositForm && (
        <Card>
          <CardHeader>
            <CardTitle>Deposit Funds</CardTitle>
            <CardDescription>Add money to your trading account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="deposit-amount">Amount (USD)</Label>
              <Input
                id="deposit-amount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label htmlFor="payment-provider">Payment Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentProviders.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleDeposit}>Deposit Funds</Button>
              <Button variant="outline" onClick={() => setShowDepositForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdraw Form */}
      {showWithdrawForm && (
        <Card>
          <CardHeader>
            <CardTitle>Withdraw Funds</CardTitle>
            <CardDescription>Transfer money from your trading account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="withdraw-amount">Amount (USD)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                max={balance}
              />
              <p className="text-xs text-gray-500 mt-1">
                Available balance: ${balance.toFixed(2)}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleWithdraw}>Withdraw Funds</Button>
              <Button variant="outline" onClick={() => setShowWithdrawForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Transaction History
          </CardTitle>
          <CardDescription>Your recent wallet transactions</CardDescription>
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

export default WalletSettings;
