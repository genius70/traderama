import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Send, Clock } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
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
  selectedUser: User | null;
  isSending: boolean;
  handleSendMessage: (isScheduled?: boolean) => void;
}

const TEMPLATES = {
  welcome: { 
    subject: 'Welcome to Traderama!', 
    message: 'Hello {user_name}, welcome to Traderama! Start trading with our powerful tools.' 
  },
  reengage: { 
    subject: 'We Miss You!', 
    message: 'Hi {user_name}, it has been a while! Check out new strategies on Traderama.' 
  },
  premium: { 
    subject: 'Upgrade to Premium', 
    message: 'Hello {user_name}, unlock premium features with a Traderama subscription!' 
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
  selectedUser,
  isSending,
  handleSendMessage,
}) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedUser ? `Send Message to ${selectedUser.name || selectedUser.email}` : 'Compose Message'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template">Template</Label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Choose template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Template</SelectItem>
                  <SelectItem value="welcome">Welcome Message</SelectItem>
                  <SelectItem value="reengage">Re-engagement</SelectItem>
                  <SelectItem value="premium">Premium Upgrade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="delivery-method">Delivery Method</Label>
              <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                <SelectTrigger id="delivery-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="notification">In-App Notification</SelectItem>
                </SelectContent>
              </Select>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          {scheduleDate && (
            <Button
              onClick={() => handleSendMessage(true)}
              disabled={isSending}
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
            disabled={isSending}
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