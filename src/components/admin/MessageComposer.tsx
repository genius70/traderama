import React from 'react';
import Select from 'react-select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select as ShadcnSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Send, Clock } from 'lucide-react';

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

interface MessageComposerProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  subject: string;
  setSubject: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  deliveryMethod: string;
  setDeliveryMethod: (value: string) => void;
  template: string;
  setTemplate: (value: string) => void;
  scheduleDate: Date | undefined;
  setScheduleDate: (value: Date | undefined) => void;
  selectedUsers: User[];
  filteredUsers: User[];
  emailList: string[];
  setEmailList: (value: string[]) => void;
  sendProgress: number;
  isSending: boolean;
  handleSendMessage: (isScheduled?: boolean) => void;
}

const TEMPLATES = {
  welcome: {
    subject: 'Welcome to Traderama!',
    message: 'Hello {user_name}, welcome to Traderama! Start trading with our powerful tools.',
  },
  reengage: {
    subject: 'We Miss You!',
    message: 'Hi {user_name}, it has been a while! Check out new strategies on Traderama.',
  },
  premium: {
    subject: 'Upgrade to Premium',
    message: 'Hello {user_name}, unlock premium features with a Traderama subscription!',
  },
};

const MessageComposer: React.FC<MessageComposerProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  subject,
  setSubject,
  message,
  setMessage,
  deliveryMethod,
  setDeliveryMethod,
  template,
  setTemplate,
  scheduleDate,
  setScheduleDate,
  selectedUsers,
  filteredUsers,
  emailList,
  setEmailList,
  sendProgress,
  isSending,
  handleSendMessage,
}) => {
  // Handle template selection
  React.useEffect(() => {
    if (template !== 'none' && TEMPLATES[template as keyof typeof TEMPLATES]) {
      const selectedTemplate = TEMPLATES[template as keyof typeof TEMPLATES];
      setSubject(selectedTemplate.subject);
      setMessage(selectedTemplate.message);
    } else {
      setSubject('');
      setMessage('');
    }
  }, [template, setSubject, setMessage]);

  // Sync selectedUsers with emailList
  React.useEffect(() => {
    if (selectedUsers.length > 0 && emailList.length === 0) {
      setEmailList(selectedUsers.map(user => user.email));
    }
  }, [selectedUsers, emailList, setEmailList]);

  // Map filteredUsers to react-select options
  const userOptions = filteredUsers.map(user => ({
    value: user.email,
    label: user.name ? `${user.name} (${user.email})` : user.email,
  }));

  // Map emailList to react-select value
  const selectedOptions = emailList.map(email => {
    const user = filteredUsers.find(u => u.email === email);
    return {
      value: email,
      label: user?.name ? `${user.name} (${user.email})` : email,
    };
  });

  // Display recipient names or emails
  const getRecipientDisplay = () => {
    if (emailList.length === 0) return 'Compose Message';
    if (emailList.length === 1) {
      const user = filteredUsers.find(u => u.email === emailList[0]);
      return `Send Message to ${user?.name || user?.email || emailList[0]}`;
    }
    return `Send Message to ${emailList.length} Recipients`;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getRecipientDisplay()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="recipients">Recipients</Label>
            {typeof Select !== 'undefined' ? (
              <Select
                isMulti
                options={userOptions}
                value={selectedOptions}
                onChange={(selected) => setEmailList(selected ? selected.map(option => option.value) : [])}
                placeholder="Select recipients..."
                id="recipients"
                className="basic-multi-select"
                classNamePrefix="select"
              />
            ) : (
              <div className="text-red-500 text-sm">
                Error: Recipient selector unavailable. Please ensure all dependencies are installed.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template">Template</Label>
              <ShadcnSelect value={template} onValueChange={setTemplate}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Choose template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Template</SelectItem>
                  <SelectItem value="welcome">Welcome Message</SelectItem>
                  <SelectItem value="reengage">Re-engagement</SelectItem>
                  <SelectItem value="premium">Premium Upgrade</SelectItem>
                </SelectContent>
              </ShadcnSelect>
            </div>

            <div>
              <Label htmlFor="delivery-method">Delivery Method</Label>
              <ShadcnSelect value={deliveryMethod} onValueChange={setDeliveryMethod}>
                <SelectTrigger id="delivery-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="notification">In-App Notification</SelectItem>
                </SelectContent>
              </ShadcnSelect>
            </div>
          </div>

          {deliveryMethod !== 'whatsapp' && (
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
                disabled={emailList.length === 0}
              />
            </div>
          )}

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here... Use {user_name} for personalization"
              rows={6}
              disabled={emailList.length === 0}
            />
          </div>

          <div>
            <Label>Schedule Message (Optional)</Label>
            <div className="mt-2">
              <Calendar
                mode="single"
                selected={scheduleDate}
                onSelect={setScheduleDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
          </div>

          {sendProgress > 0 && (
            <div>
              <Label>Sending Progress</Label>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${sendProgress}%` }}
                ></div>
              </div>
              <span className="text-xs text-muted-foreground">{sendProgress}%</span>
            </div>
          )}

          {emailList.length > 1 && (
            <div>
              <Label>Selected Recipients</Label>
              <div className="mt-2 text-sm text-gray-600">
                {emailList.map(email => {
                  const user = filteredUsers.find(u => u.email === email);
                  return (
                    <div key={email}>{user?.name ? `${user.name} (${user.email})` : email}</div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          {scheduleDate && (
            <Button
              onClick={() => handleSendMessage(true)}
              disabled={isSending || emailList.length === 0}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Schedule Message
                </>
              )}
            </Button>
          )}
          <Button
            onClick={() => handleSendMessage(false)}
            disabled={isSending || emailList.length === 0}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageComposer;
