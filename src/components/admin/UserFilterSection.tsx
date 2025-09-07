import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Target, Mail, Upload, UserPlus } from 'lucide-react';

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

interface UserFilterSectionProps {
  filterType: string;
  setFilterType: (value: string) => void;
  days: number;
  setDays: (value: number) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  subscriptionFilter: string;
  setSubscriptionFilter: (value: string) => void;
  filteredUsers: User[] | undefined; // Allow undefined
  selectedUsers: string[];
  handleGenerateEmailList: () => void;
  setIsDialogOpen: (value: boolean) => void;
  setIsImportDialogOpen: (value: boolean) => void;
  setIsAddUserDialogOpen: (value: boolean) => void;
  exportUserList: () => void;
}

const UserFilterSection: React.FC<UserFilterSectionProps> = ({
  filterType,
  setFilterType,
  days,
  setDays,
  roleFilter,
  setRoleFilter,
  subscriptionFilter,
  setSubscriptionFilter,
  filteredUsers = [], // Default to empty array
  selectedUsers,
  handleGenerateEmailList,
  setIsDialogOpen,
  setIsImportDialogOpen,
  setIsAddUserDialogOpen,
  exportUserList,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Filter Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="filter-type">Filter Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger id="filter-type">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-opened-30">Not opened in last 30 days</SelectItem>
                <SelectItem value="joined-x-days">Joined within last X days</SelectItem>
                <SelectItem value="logged-in-x-days">Logged in last X days</SelectItem>
                <SelectItem value="active-in-last-x-days">Active in Last X days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(filterType === 'joined-x-days' || filterType === 'logged-in-x-days' || filterType === 'active-in-last-x-days') && (
            <div>
              <Label htmlFor="days">Days</Label>
              <Input
                id="days"
                type="number"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 7)}
                placeholder="Number of days"
              />
            </div>
          )}

          <div>
            <Label htmlFor="role-filter">Role</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger id="role-filter">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subscription-filter">Subscription</Label>
            <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
              <SelectTrigger id="subscription-filter">
                <SelectValue placeholder="All subscriptions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="premium">Premium Only</SelectItem>
                <SelectItem value="non-premium">Non-Premium Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-sm font-medium text-foreground">
              {filteredUsers.length} users match the selected filters
            </p>
            <p className="text-xs text-muted-foreground">
              {filteredUsers.length > 0 ? 'Ready to send messages to filtered audience' : 'Adjust filters to see users'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateEmailList}
              disabled={selectedUsers.length === 0}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email List Below
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
              Compose Message
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsAddUserDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
            <Button variant="outline" size="sm" onClick={exportUserList}>
              Export List
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserFilterSection;
