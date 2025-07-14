import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Crown, Check, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now subscribed to Premium!",
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600"
      >
        {isLoading ? "Processing..." : "Subscribe Now - $9.99/month"}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (isAuthenticated) {
      if (!stripePromise) {
        toast({
          title: "Payment Not Available",
          description: "Payment processing is not configured. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // Create subscription as soon as the page loads
      apiRequest("POST", "/api/create-subscription")
        .then((res) => res.json())
        .then((data) => {
          if (data.error || data.message) {
            toast({
              title: "Payment Not Available",
              description: data.message || "Payment processing is not configured.",
              variant: "destructive",
            });
          } else {
            setClientSecret(data.clientSecret);
          }
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        });
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Setting up your subscription...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2 ml-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">QuantumChecker</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Premium Features */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Crown className="w-6 h-6 mr-2" />
                Premium Features
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Unlimited Token Checks</div>
                    <div className="text-sm text-gray-600">No daily limits, check as many tokens as you need</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Bulk Token Processing</div>
                    <div className="text-sm text-gray-600">Process hundreds of tokens simultaneously</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Token Information Parser</div>
                    <div className="text-sm text-gray-600">Extract and organize token data automatically</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">File Upload Support</div>
                    <div className="text-sm text-gray-600">Upload token files directly for processing</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Priority Support</div>
                    <div className="text-sm text-gray-600">Get help faster with premium support</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Advanced Analytics</div>
                    <div className="text-sm text-gray-600">Detailed reports and statistics</div>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Complete Your Subscription</CardTitle>
              <p className="text-gray-600">
                Secure payment powered by Stripe. Cancel anytime.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm />
              </Elements>
              
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>💳 All major credit cards accepted</p>
                <p>🔒 Secure SSL encryption</p>
                <p>❌ Cancel anytime, no commitment</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
