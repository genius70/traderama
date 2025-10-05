
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { UserPlus, MessageCircle, X, Send, Users, Check, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Friend {
  name: string;
  phoneNumber: string;
}

interface ReferralStatus {
  phone: string;
  name: string;
  status: 'pending' | 'accepted';
  invitedAt: string;
}

const InviteFriend: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [currentFriend, setCurrentFriend] = useState<Friend>({ name: '', phoneNumber: '' });
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [referralHistory, setReferralHistory] = useState<ReferralStatus[]>([]);
  const [userReferralCode, setUserReferralCode] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const defaultMessage = "Hey! I recently join this amazing Expert Copy Trading Platform for Iron Condor Options Trading Strategies. Send your first 10 invites and earn $50 credited to your wallet. You should check it out. 🚀📈";

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchReferralHistory();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .single();
    
    if (data?.referral_code) {
      setUserReferralCode(data.referral_code);
    }
  };

  const fetchReferralHistory = async () => {
    // This would typically fetch from a referrals tracking table
    // For now, we'll use placeholder data
    setReferralHistory([
      { phone: '+1234567890', name: 'John Doe', status: 'accepted', invitedAt: '2024-01-15' },
      { phone: '+0987654321', name: 'Jane Smith', status: 'pending', invitedAt: '2024-01-20' }
    ]);
  };

  const addFriend = () => {
    if (!currentFriend.name.trim() || !currentFriend.phoneNumber.trim()) {
      toast({
        title: "Missing Information",
        variant: "destructive",
      });
      return;
    }

    if (friends.length >= 5) {
      toast({
        title: "Maximum Reached",
        variant: "destructive",
      });
      return;
    }

    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(currentFriend.phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        variant: "destructive",
      });
      return;
    }

    if (friends.some(friend => friend.phoneNumber === currentFriend.phoneNumber)) {
      toast({
        title: "Duplicate Number",
        variant: "destructive",
      });
      return;
    }

    setFriends([...friends, { ...currentFriend }]);
    setCurrentFriend({ name: '', phoneNumber: '' });
    
    toast({
      title: "Friend Added",
    });
  };

  const removeFriend = (index: number) => {
    const updatedFriends = friends.filter((_, i) => i !== index);
    setFriends(updatedFriends);
  };

  const sendInvites = async () => {
    if (friends.length === 0) {
      toast({
        title: "No Friends to Invite",
        variant: "destructive",
      });
      return;
    }

    if (!userReferralCode) {
      toast({
        title: "Referral Code Missing - Please complete your profile to get a referral code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const message = customMessage.trim() || defaultMessage;
      const messageWithReferral = `${message}\n\nJoin using my referral code: ${userReferralCode}\nhttps://traderama.pro`;
      
      // Extract phone numbers in the format the edge function expects
      const phoneNumbers = friends.map(friend => friend.phoneNumber);
      
      console.log('Sending WhatsApp invites:', { phoneNumbers, message: messageWithReferral });
      
      const response = await supabase.functions.invoke('send-whatsapp-invites', {
        body: JSON.stringify({
          phone_numbers: phoneNumbers,
          message: messageWithReferral
        })
      });

      console.log('WhatsApp invite response:', response);

      if (response.error) {
        console.error('WhatsApp invite error:', response.error);
        throw response.error;
      }

      const results = response.data?.results || [];
      const successCount = results.filter((r: any) => r.success).length;
      const failCount = results.length - successCount;

      toast({
        title: `Invites Sent! ${successCount} invite${successCount !== 1 ? 's' : ''} sent successfully${failCount > 0 ? `, ${failCount} failed` : ''}.`,
      });

      setFriends([]);
      setCustomMessage('');
      fetchReferralHistory();
      
    } catch (error: any) {
      console.error('Error sending invites:', error);
      toast({
        title: `Error Sending Invites: ${error.message || "Failed to send WhatsApp invites. Please try again."}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Referral Code Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input value={userReferralCode} readOnly className="font-mono" />
            <Button 
              variant="outline" 
              onClick={() => navigator.clipboard.writeText(userReferralCode)}
            >
              Copy
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Share this code with friends to earn 2 KEM credits when they join!
          </p>
        </CardContent>
      </Card>

      {/* Referral Status */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Status</CardTitle>
          <CardDescription>Track your invited friends</CardDescription>
        </CardHeader>
        <CardContent>
          {referralHistory.length === 0 ? (
            <p className="text-gray-500">No referrals yet. Start inviting friends!</p>
          ) : (
            <div className="space-y-2">
              {referralHistory.map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{referral.name}</span>
                    <span className="text-gray-600 ml-2">{referral.phone}</span>
                  </div>
                  <Badge variant={referral.status === 'accepted' ? 'default' : 'secondary'}>
                    {referral.status === 'accepted' ? (
                      <><Check className="h-3 w-3 mr-1" /> Accepted</>
                    ) : (
                      <><Clock className="h-3 w-3 mr-1" /> Pending</>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Friends Form */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Invite Friends via WhatsApp
          </CardTitle>
          <CardDescription>
            Invite up to 5 friends to join the platform via WhatsApp. They'll receive a personal invitation from you!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Add Friend Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Friend's Name</label>
                <Input
                  placeholder="Enter friend's name"
                  value={currentFriend.name}
                  onChange={(e) => setCurrentFriend({ ...currentFriend, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">WhatsApp Number</label>
                <Input
                  placeholder="+1234567890"
                  value={currentFriend.phoneNumber}
                  onChange={(e) => setCurrentFriend({ ...currentFriend, phoneNumber: e.target.value })}
                />
              </div>
            </div>
            
            <Button 
              onClick={addFriend}
              variant="outline"
              className="w-full sm:w-auto"
              disabled={friends.length >= 5}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Friend ({friends.length}/5)
            </Button>
          </div>

          {/* Friends List */}
          {friends.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Friends to Invite:</label>
              <div className="space-y-2">
                {friends.map((friend, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{friend.name}</span>
                      <span className="text-gray-600 ml-2">{friend.phoneNumber}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFriend(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Invitation Message (Optional)</label>
            <Textarea
              placeholder={defaultMessage}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500">
              Leave empty to use the default message. Your referral code will be automatically added.
            </p>
          </div>

          {/* Send Button */}
          <Button 
            onClick={sendInvites}
            disabled={friends.length === 0 || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Invites...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send {friends.length} WhatsApp Invite{friends.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>

          {/* Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Your friends will receive a WhatsApp message with your personal invitation and referral code</p>
            <p>• Make sure to include country codes in phone numbers (e.g., +1 for US)</p>
            <p>• You'll earn 2 KEM credits when each friend accepts your referral</p>
            <p>• Each friend can only be invited once per day</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteFriend;
