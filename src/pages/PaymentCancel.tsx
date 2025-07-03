import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import Header from "@/components/layout/Header";

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto p-4 sm:p-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-700">
              Payment Cancelled
            </CardTitle>
            <CardDescription>
              Your payment was cancelled. No charges have been made to your
              account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>
                If you experienced unknown issues during checkout, please try
                again or contact our support team.
              </p>
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/product-offers">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
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

export default PaymentCancel;
