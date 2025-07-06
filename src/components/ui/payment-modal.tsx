import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Figma, CreditCard, Lock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Stripe test publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: 'design-system' | 'figma';
  onSuccess: () => void;
}

const PaymentForm: React.FC<{
  exportType: 'design-system' | 'figma';
  onSuccess: () => void;
  onClose: () => void;
}> = ({ exportType, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setPaymentStatus('processing');

    try {
      // For test/demo mode, simulate payment processing
      // In a real app, you would create a PaymentIntent server-side and get the client_secret
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, just simulate a successful payment
      console.log('Demo payment successful');
      setPaymentStatus('success');
      
      toast({
        title: "Payment Successful!",
        description: `Your ${exportType === 'design-system' ? 'Design System' : 'Figma Export'} is being prepared.`,
      });

      // Wait a moment to show success state
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      toast({
        title: "Payment Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const exportDetails = {
    'design-system': {
      title: 'Design System Export',
      description: 'Complete design system with CSS variables, Tailwind config, and documentation',
      icon: FileText,
      features: [
        'CSS Custom Properties',
        'Tailwind CSS Configuration',
        'Component Documentation',
        'Token JSON Export',
        'Usage Guidelines'
      ]
    },
    'figma': {
      title: 'Figma Export',
      description: 'Design tokens and styles exported directly to your Figma workspace',
      icon: Figma,
      features: [
        'Color Styles',
        'Text Styles',
        'Effect Styles',
        'Component Library',
        'Auto-sync Updates'
      ]
    }
  };

  const details = exportDetails[exportType];
  const Icon = details.icon;

  if (paymentStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-4">
          Your {details.title.toLowerCase()} is being prepared and will be available shortly.
        </p>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
        <p className="text-muted-foreground mb-4">
          There was an issue processing your payment. Please try again.
        </p>
        <Button onClick={() => setPaymentStatus('idle')} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{details.title}</CardTitle>
              <CardDescription>{details.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm font-medium">What's included:</p>
            <ul className="space-y-2">
              {details.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{details.title}</p>
              <p className="text-sm text-muted-foreground">One-time export</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">$3.00</p>
              <Badge variant="secondary" className="text-xs">
                Test Mode
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

              {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Information
            </label>
            <div className="p-3 border rounded-lg">
              <PaymentElement
                options={{
                  layout: 'tabs'
                }}
              />
            </div>
          </div>

                  {/* Test Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900 mb-2">Demo Mode - Test Payment:</p>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Card:</strong> 4242 4242 4242 4242 (Visa)</p>
              <p><strong>Expiry:</strong> Any future date (e.g., 12/25)</p>
              <p><strong>CVC:</strong> Any 3 digits (e.g., 123)</p>
              <p><strong>ZIP:</strong> Any 5 digits (e.g., 12345)</p>
              <p><strong>Note:</strong> This is a demo - payment will be simulated</p>
            </div>
          </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          Your payment information is secure and encrypted
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={processing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!stripe || processing}
            className="flex-1"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay $3.00
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  exportType,
  onSuccess
}) => {
  // PaymentElement options
  const options = {
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Purchase
          </DialogTitle>
          <DialogDescription>
            Complete your purchase to export your design system
          </DialogDescription>
        </DialogHeader>
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm
            exportType={exportType}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}; 