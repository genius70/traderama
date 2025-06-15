
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Crown } from 'lucide-react';
import Header from '@/components/layout/Header';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Optional: Verify payment status here if needed
    if (sessionId) {
      console.log('Payment session ID:', sessionId);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-4 sm:p-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              Payment Successful!
            </CardTitle>
            <CardDescription>
              Thank you for your purchase. Your payment has been processed successfully.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {sessionId && (
              <div className="text-sm text-gray-600">
                <p>Session ID: {sessionId}</p>
              </div>
            )}
            
            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
              <Crown className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                Your premium features are now active!
              </span>
            </div>
            
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PaymentSuccess;
