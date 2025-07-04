import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Settings } from "lucide-react";

const NotificationManager = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim() || !recipient.trim()) {
      toast({
        title: "Validation Error",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/rest/v1/rpc/send_notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_title: title,
          p_body: body,
          p_recipient_id: recipient,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      toast({
        title: "Notification sent successfully!"
      });
      
      setTitle("");
      setBody("");
      setRecipient("");
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Failed to send notification"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-blue-600" />
          <span>Notification Manager</span>
        </CardTitle>
        <CardDescription>Send notifications to users</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Notification Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body">Body</Label>
          <Textarea
            id="body"
            placeholder="Notification Body"
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient User ID</Label>
          <Input
            id="recipient"
            placeholder="User ID"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
          />
        </div>
        <Button onClick={handleSendNotification} disabled={sending}>
          {sending ? "Sending..." : "Send Notification"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationManager;
