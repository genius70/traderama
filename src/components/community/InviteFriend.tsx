
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { UserPlus, MessageCircle, X, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Friend {
  name: string;
  phoneNumber: string;
}

const InviteFriend: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [currentFriend, setCurrentFriend] = useState<Friend>({ name: '', phoneNumber: '' });
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const defaultMessage = "Hey! I've been using this amazing trading platform for iron condor strategies. You should check it out - it's helping me improve my trading performance significantly! 🚀📈";

  const addFriend = () => {
    if (!currentFriend.name.trim() || !currentFriend.phoneNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and phone number",
        variant: "destructive",
      });
      return;
    }

    if (friends.length >= 5) {
      toast({
        title: "Maximum Reached",
        description: "You can invite up to 5 friends at a time",
        variant: "destructive",
      });
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(currentFriend.phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates
    if (friends.some(friend => friend.phoneNumber === currentFriend.phoneNumber)) {
      toast({
        title: "Duplicate Number",
        description: "This phone number is already in your invite list",
        variant: "destructive",
      });
      return;
    }

    setFriends([...friends, { ...currentFriend }]);
    setCurrentFriend({ name: '', phoneNumber: '' });
    
    toast({
      title: "Friend Added",
      description: `${currentFriend.name} has been added to your invite list`,
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
        description: "Please add at least one friend to send invites",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const message = customMessage.trim() || defaultMessage;
      
      // Call Twilio WhatsApp API via Supabase Edge Function
      const response = await fetch('/api/send-whatsapp-invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          friends: friends,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invites');
      }

      const result = await response.json();
      
      toast({
        title: "Invites Sent Successfully!",
        description: `Sent ${friends.length} WhatsApp invite(s) to your friends`,
      });

      // Clear the form
      setFriends([]);
      setCustomMessage('');
      
    } catch (error) {
      console.error('Error sending invites:', error);
      toast({
        title: "Error Sending Invites",
        description: "There was an issue sending your invites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            Leave empty to use the default message
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
          <p>• Your friends will receive a WhatsApp message with your personal invitation</p>
          <p>• Make sure to include country codes in phone numbers (e.g., +1 for US)</p>
          <p>• Each friend can only be invited once per day</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InviteFriend;
