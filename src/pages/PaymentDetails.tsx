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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { amountInZarOne, amountInZarTwo, appLogo, appName, companyName, flutterwaveEnabled, flutterwavePlanIdOne, flutterwavePlanIdTwo, flutterwavePublicKey, paypalEnabled, paypalPlanIdOne, paypalPlanIdTwo, paystackEnabled, paystackPlanIdOne, paystackPlanIdTwo, razorpayEnabled, razorpayPlanIdOne, razorpayPlanIdTwo, serverURL, stripeEnabled, stripePlanIdOne, stripePlanIdTwo } from '@/constants';
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


const PaymentDetails = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('banktransfer');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [plans, setPlans] = useState({
    free: { name: 'Free Plan', price: 0 },
    monthly: { name: 'Monthly Plan', price: 9 },
    yearly: { name: 'Yearly Plan', price: 99 }
  });
  const [plansFeatures, setPlansFeatures] = useState([]);

  useEffect(() => {
    fetchPlanSettings();
  }, []);

  const fetchPlanSettings = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/plan-settings`);
      if (response.data.success) {
        const apiPlans = response.data.plans;
        
        // Update plans object
        setPlans({
          free: { name: apiPlans.free.name, price: apiPlans.free.price, period: apiPlans.free.period },
          monthly: { name: apiPlans.monthly.name, price: apiPlans.monthly.price, period: apiPlans.monthly.period },
          yearly: { name: apiPlans.yearly.name, price: apiPlans.yearly.price, period: apiPlans.yearly.period }
        });

        // Update plans features
        setPlansFeatures([
          {
            name: apiPlans.free.name,
            features: apiPlans.free.features,
          },
          {
            name: apiPlans.monthly.name,
            features: apiPlans.monthly.features,
          },
          {
            name: apiPlans.yearly.name,
            features: apiPlans.yearly.features,
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching plan settings:', error);
      // Use default plans if API fails
      setPlansFeatures([
        {
          name: 'Free Plan',
          features: [
            "Generate 5 Sub-Topics",
            "Lifetime access",
            "Theory & Image Course",
            "Ai Teacher Chat",
          ],
        },
        {
          name: 'Monthly Plan',
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
          name: 'Yearly Plan',
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
      ]);
    }
  };

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
      console.log('Submitting to:', postURL);
      console.log('Form data:', formData);
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
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to submit payment receipt.",
        });
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit payment receipt. Please try again.",
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
                  <CardTitle className="text-center">
                    Billing Information
                  </CardTitle>
                  <CardDescription className="text-center">
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
                          <FormControl>
                            <Input placeholder="First Name" {...field} />
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
                          <FormControl>
                            <Input placeholder="Last Name" {...field} />
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
                        <FormControl>
                          <Input type="email" placeholder="Email" {...field} />
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
                        <FormControl>
                          <Input placeholder="Address" {...field} />
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
                          <FormControl>
                            <Input placeholder="City" {...field} />
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
                          <FormControl>
                            <Input placeholder="State/Province" {...field} />
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
                          <FormControl>
                            <Input placeholder="ZIP/Postal Code" {...field} />
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
                          <FormControl>
                            <Input placeholder="Country" {...field} />
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
                  <CardTitle className="text-center">
            Upload Payment Receipt
                  </CardTitle>
                  <CardDescription className="text-center">
                    Upload your payment receipt for manual verification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="bank-details" className="border-none">
                      <AccordionTrigger className="text-left bg-muted/50 rounded-lg px-4 py-3 hover:bg-muted/70 no-underline focus:no-underline focus-visible:no-underline">
                        Bank Transfer Details
                      </AccordionTrigger>
                      <AccordionContent className="bg-muted/30 rounded-lg mt-2 p-4">
                        <div className="space-y-2 text-sm">
                          <p><strong>Bank:</strong> <span className="text-purple-600 dark:text-purple-400">First Citizens</span></p>
                          <p><strong>Account Number:</strong> <span className="text-purple-600 dark:text-purple-400">2614969</span></p>
                          <p><strong>Branch:</strong> <span className="text-purple-600 dark:text-purple-400">Independence Square</span></p>
                          <p><strong>Account Name:</strong> <span className="text-purple-600 dark:text-purple-400">Dallas Alejandro Ferdinand</span></p>
                          <p><strong>Amount:</strong> <span className="text-purple-600 dark:text-purple-400">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span></p>
                          <p><strong>Email:</strong> <span className="text-purple-600 dark:text-purple-400">{sessionStorage.getItem('email')}</span></p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {plan.price > 0 ? (
                    <div className="space-y-4">
                      <div>
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
                              Upload Payment Receipt
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
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-green-800 dark:text-green-200">
                        This is a free plan! No payment required.
                      </p>
                    </div>
                  )}

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

                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Important:</h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Include your email as reference: {sessionStorage.getItem('email')}</li>
                        <li>• Upload a clear payment receipt</li>
                        <li>• You'll be notified once approved</li>
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
          type="submit"
                    className="bg-primary"
                    disabled={isProcessing || (plan.price > 0 && !receiptFile)}
                  >
                    {isProcessing ? "Submitting..." : plan.price === 0 ? "Get Free Plan" : "Pay Now"}
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
                <span>{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
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
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground">
          You're upgrading to the {plan.name}
        </p>
      </div>

      {renderStepIndicator()}

      <div className="grid md:grid-cols-3 gap-4">
        {/* Left Column: Form Steps */}
        <div className="md:col-span-2">
          <Form {...form}>
                         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
