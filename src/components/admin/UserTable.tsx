import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowUpDown, Mail, Phone, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_premium: boolean;
  phone_number: string | null;
  email_confirmed_at: string | null;
  wallet_balance: number;
  referral_code: string | null;
  total_referrals: number;
  membership_level: string;
  active_strategies: number;
  total_trades: number;
  platform_revenue: number;
  credits_earned: number;
  pending_strategies: number;
  profit_loss: number;
}

interface UserTableProps {
  filteredUsers: User[];
  selectedUsers: string[];
  handleSelectAll: () => void;
  handleSelectUser: (userId: string) => void;
  handleSort: (column: keyof User) => void;
  handleSingleUserAction: (user: User, action: string) => void;
  emailList: string[];
}

const UserTable: React.FC<UserTableProps> = ({
  filteredUsers,
  selectedUsers,
  handleSelectAll,
  handleSelectUser,
  handleSort,
  handleSingleUserAction,
  emailList,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Comprehensive User Management Table
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <Button variant="ghost" onClick={() => handleSort('id')}>
                    UID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[150px]">
                  <Button variant="ghost" onClick={() => handleSort('name')}>
                    Display Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort('phone_number')}>
                    Phone
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort('created_at')}>
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[100px]">
                  <Button variant="ghost" onClick={() => handleSort('email_confirmed_at')}>
                    Confirmed
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort('last_sign_in_at')}>
                    Last Sign In
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[80px]">Active</TableHead>
                <TableHead className="min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort('wallet_balance')}>
                    Wallet Balance
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort('referral_code')}>
                    Referral ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort('total_referrals')}>
                    Total Referrals
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[130px]">
                  <Button variant="ghost" onClick={() => handleSort('membership_level')}>
                    Membership Level
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[130px]">
                  <Button variant="ghost" onClick={() => handleSort('active_strategies')}>
                    Active Strategies
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort('total_trades')}>
                    Total Trades
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[130px]">
                  <Button variant="ghost" onClick={() => handleSort('platform_revenue')}>
                    Platform Revenue
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[130px]">
                  <Button variant="ghost" onClick={() => handleSort('credits_earned')}>
                    Credits Earned
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[140px]">
                  <Button variant="ghost" onClick={() => handleSort('pending_strategies')}>
                    Pending Strategies
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort('profit_loss')}>
                    Profit/(Loss)
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.name || 'No Name'}
                    </TableCell>
                    <TableCell>{user.phone_number || 'N/A'}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={user.email_confirmed_at ? 'default' : 'secondary'}>
                        {user.email_confirmed_at ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                    <TableCell>
                      <Badge variant={user.active_strategies > 0 ? 'default' : 'secondary'}>
                        {user.active_strategies > 0 ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(user.wallet_balance)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.referral_code || 'N/A'}
                    </TableCell>
                    <TableCell>{user.total_referrals}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_premium ? 'default' : 'secondary'}>
                        {user.membership_level}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.active_strategies}</TableCell>
                    <TableCell>{user.total_trades}</TableCell>
                    <TableCell>{formatCurrency(user.platform_revenue)}</TableCell>
                    <TableCell>{user.credits_earned}</TableCell>
                    <TableCell>{user.pending_strategies}</TableCell>
                    <TableCell className={user.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(user.profit_loss)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSingleUserAction(user, 'email')}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSingleUserAction(user, 'whatsapp')}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSingleUserAction(user, 'notification')}
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={19} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No users match the selected filters.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {emailList.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Selected Email List:</h4>
            <div className="text-sm text-muted-foreground">
              {emailList.join(', ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTable;