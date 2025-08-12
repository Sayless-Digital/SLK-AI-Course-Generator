// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  Wallet,
  Building,
  MapPin,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  Banknote,
  User,
  Mail
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { amountInZarOne, amountInZarTwo, appLogo, appName, companyName, flutterwaveEnabled, flutterwavePlanIdOne, flutterwavePlanIdTwo, flutterwavePublicKey, FreeCost, FreeType, MonthCost, MonthType, paypalEnabled, paypalPlanIdOne, paypalPlanIdTwo, paystackEnabled, paystackPlanIdOne, paystackPlanIdTwo, razorpayEnabled, razorpayPlanIdOne, razorpayPlanIdTwo, serverURL, stripeEnabled, stripePlanIdOne, stripePlanIdTwo, YearCost, YearType } from '@/constants';
import axios from 'axios';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

// Form validation schema
const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(3, "ZIP code is required"),
  country: z.string().min(2, "Country is required")
});

type FormValues = z.infer<typeof formSchema>;

const plans = {
  free: { name: FreeType, price: FreeCost },
  monthly: { name: MonthType, price: MonthCost },
  yearly: { name: YearType, price: YearCost }
};

const plansFeatures = [
  {
    name: FreeType,
    features: [
      "Generate 5 Sub-Topics",
      "Lifetime access",
      "Theory & Image Course",
      "Ai Teacher Chat",
    ],
  },
  {
    name: MonthType,
    features: [
      "Generate 10 Sub-Topics",
      "1 Month Access",
      "Theory & Image Course",
      "Ai Teacher Chat",
      "Course In 23+ Languages",
      "Create Unlimited Course",
      "Video & Theory Course",
    ],
  },
  {
    name: YearType,
    features: [
      "Generate 10 Sub-Topics",
      "1 Year Access",
      "Theory & Image Course",
      "Ai Teacher Chat",
      "Course In 23+ Languages",
      "Create Unlimited Course",
      "Video & Theory Course",
    ],
  }
];

const PaymentMethodButton = ({
  icon: Icon,
  name,
  onClick,
  isSelected
}: {
  icon: React.ElementType,
  name: string,
  onClick: () => void,
  isSelected: boolean
}) => (
  <Button
    variant="outline"
    className={`flex items-center justify-start h-auto px-4 py-3 w-full ${isSelected ? 'border-primary bg-primary/5' : 'border-border'
      }`}
    onClick={onClick}
  >
    <Icon className={`mr-2 h-5 w-5 ${isSelected ? 'text-primary' : ''}`} />
    <span>{name}</span>
    {isSelected && <CheckCircle className="ml-auto h-4 w-4 text-primary" />}
  </Button>
);

const PaymentDetails = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('banktransfer');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const plan = planId && plans[planId as keyof typeof plans]
    ? plans[planId as keyof typeof plans]
    : { name: 'Unknown Plan', price: 0 };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: (() => {
        const fullName = sessionStorage.getItem('mName') || '';
        return fullName.split(' ')[0] || '';
      })(),
      lastName: (() => {
        const fullName = sessionStorage.getItem('mName') || '';
        const nameParts = fullName.split(' ');
        return nameParts.slice(1).join(' ') || '';
      })(),
      email: sessionStorage.getItem('email'),
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
  });

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsProcessing(true);
    
    if (paymentMethod === 'banktransfer') {
      await submitBankTransfer(data);
    } else {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Invalid payment method selected.",
      });
    }
  };

  const submitBankTransfer = async (data: FormValues) => {
    if (!receiptFile) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Please upload a payment receipt.",
      });
      return;
    }

    const formData = new FormData();
    formData.append('receipt', receiptFile);
    formData.append('planId', planId || '');
    formData.append('planName', plan.name);
    formData.append('planPrice', plan.price.toString());
    formData.append('userId', sessionStorage.getItem('uid') || '');
    formData.append('userEmail', data.email);
    formData.append('userName', `${data.firstName} ${data.lastName}`);
    formData.append('address', data.address);
    formData.append('city', data.city);
    formData.append('state', data.state);
    formData.append('zipCode', data.zipCode);
    formData.append('country', data.country);

    try {
      const postURL = serverURL + '/api/banktransfer';
      const response = await axios.post(postURL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(progress);
        },
      });

      if (response.data.success) {
        toast({
          title: "Payment Receipt Submitted",
          description: "Your payment receipt has been submitted for review. You will be notified once approved.",
        });
        navigate('/payment-pending', { 
          state: { 
            sub: response.data.paymentId, 
            planName: plan.name, 
            planCost: plan.price,
            method: 'banktransfer'
          } 
        });
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to submit payment receipt.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to submit payment receipt. Please try again.",
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {step}
            </div>
            {step < 2 && (
              <div className={`w-12 h-0.5 mx-2 ${
                currentStep > step ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Billing Information
                  </CardTitle>
                  <CardDescription>
                    Please enter your billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="San Francisco" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input placeholder="California" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP/Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="94103" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="United States" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

      <div className="flex justify-end">
        <Button onClick={nextStep} className="flex items-center">
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );



  const renderStep2 = () => (
    <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload Payment Receipt
                  </CardTitle>
                  <CardDescription>
                    Upload your payment receipt for manual verification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Bank Transfer Instructions:</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Bank Name:</strong> Your Bank Name</p>
                      <p><strong>Account Number:</strong> 1234567890</p>
                      <p><strong>Account Holder:</strong> Your Company Name</p>
                      <p><strong>Amount:</strong> ${plan.price}</p>
                      <p><strong>Reference:</strong> {sessionStorage.getItem('uid')}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Upload Payment Receipt
                      </label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="receipt-upload"
                        />
                        <label htmlFor="receipt-upload" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, PDF up to 10MB
                          </p>
                        </label>
                      </div>
                      {receiptFile && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/30 rounded text-sm">
                          ✓ {receiptFile.name} selected
                        </div>
                      )}
                    </div>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Important:</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Please include your user ID as reference: {sessionStorage.getItem('uid')}</li>
                      <li>• Upload a clear screenshot or PDF of your payment receipt</li>
                      <li>• Your subscription will be activated after manual verification</li>
                      <li>• You will receive an email notification once approved</li>
                    </ul>
                  </div>
                </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
                  <Button
          onClick={form.handleSubmit(onSubmit)}
                    className="w-full bg-primary"
                    disabled={isProcessing || !receiptFile}
                  >
                    {isProcessing ? "Submitting..." : "Submit Payment Receipt"}
                  </Button>
      </div>
        </div>
  );

  const renderOrderSummary = () => (
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">{plan.name}</span>
                <span>${plan.price}</span>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg mt-6">
                <h4 className="font-medium mb-2">What's included:</h4>
                <ul className="space-y-2 text-sm">
            {plansFeatures.map((item, index) =>
                  (
                    <>
                      {item.name === plan.name ?
                        <>
                    {plansFeatures[index].features.map((feature, featureIndex) =>
                          (
                      <li key={featureIndex} className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                            </li>
                          ))}
                        </>
                        :
                        <></>
                      }
                    </>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
  );

  return (
    <div className="w-full px-2 pt-2">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Complete Your Purchase</h1>
        <p className="text-muted-foreground">
          You're upgrading to the {plan.name}
        </p>
      </div>

      {renderStepIndicator()}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Form Steps */}
        <div className="md:col-span-2">
          <Form {...form}>
                         <form className="space-y-8">
               {currentStep === 1 && renderStep1()}
               {currentStep === 2 && renderStep2()}
             </form>
          </Form>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          {renderOrderSummary()}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
