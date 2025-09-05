import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus } from 'lucide-react';

interface AddUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ open, onOpenChange, onUserAdded }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone_number: '',
    role: 'user',
    subscription_tier: 'free',
    password: '',
    whatsapp_number: '',
    bio: '',
    ethereum_wallet: '',
    referral_code: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.name || !formData.password) {
      toast({
        title: 'Missing required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          name: formData.name,
        }
      });

      if (authError) throw authError;

      // Update the profile with additional information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone_number: formData.phone_number || null,
          role: formData.role as any,
          subscription_tier: formData.subscription_tier as any,
          whatsapp_number: formData.whatsapp_number || null,
          bio: formData.bio || null,
          ethereum_wallet: formData.ethereum_wallet || null,
          referral_code: formData.referral_code || null,
          is_premium: formData.subscription_tier === 'premium'
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      toast({
        title: 'User added successfully',
      });

      // Reset form
      setFormData({
        email: '',
        name: '',
        phone_number: '',
        role: 'user',
        subscription_tier: 'free',
        password: '',
        whatsapp_number: '',
        bio: '',
        ethereum_wallet: '',
        referral_code: ''
      });

      onOpenChange(false);
      onUserAdded();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: 'Failed to add user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add New User
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role" className="text-sm font-medium">
                User Role
              </Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="strategy_creator">Strategy Creator</SelectItem>
                  <SelectItem value="premium_member">Premium Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subscription" className="text-sm font-medium">
                Subscription Tier
              </Label>
              <Select value={formData.subscription_tier} onValueChange={(value) => handleInputChange('subscription_tier', value)}>
                <SelectTrigger id="subscription">
                  <SelectValue placeholder="Select subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="whatsapp" className="text-sm font-medium">
                WhatsApp Number
              </Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp_number}
                onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="referral" className="text-sm font-medium">
                Referral Code
              </Label>
              <Input
                id="referral"
                value={formData.referral_code}
                onChange={(e) => handleInputChange('referral_code', e.target.value)}
                placeholder="REF123"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="wallet" className="text-sm font-medium">
              Ethereum Wallet Address
            </Label>
            <Input
              id="wallet"
              value={formData.ethereum_wallet}
              onChange={(e) => handleInputChange('ethereum_wallet', e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div>
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio
            </Label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full h-20 p-2 border border-input rounded-md resize-none"
              placeholder="Brief description about the user..."
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-primary text-primary-foreground">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding User...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserForm;