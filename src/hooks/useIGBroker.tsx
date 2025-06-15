
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IGBrokerCredentials {
  username: string;
  password: string;
  apiKey: string;
  accountId: string;
}

interface IGBrokerConnection {
  id: string;
  username: string;
  account_id: string;
  is_active: boolean;
  last_connected_at: string | null;
  created_at: string;
}

export const useIGBroker = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connection, setConnection] = useState<IGBrokerConnection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const connectToBroker = useCallback(async (credentials: IGBrokerCredentials) => {
    setIsConnecting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ig-broker-connect', {
        body: credentials,
      });

      if (error) {
        throw new Error(error.message || 'Failed to connect to IG Broker');
      }

      if (data?.success) {
        setConnection(data.connection);
        toast({
          title: "Connection Successful",
          description: "Your IG Broker account has been connected successfully.",
        });
        return { success: true };
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('IG Broker connection error:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to IG Broker. Please check your credentials and try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const fetchConnection = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ig-broker-connect', {
        body: null,
      });

      if (error) {
        throw new Error(error.message);
      }

      setConnection(data?.connection || null);
    } catch (error) {
      console.error('Failed to fetch IG Broker connection:', error);
      setConnection(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    connectToBroker,
    fetchConnection,
    connection,
    isConnecting,
    isLoading,
  };
};
