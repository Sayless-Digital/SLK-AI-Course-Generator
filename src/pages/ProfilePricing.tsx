
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown, Zap } from 'lucide-react';
import { serverURL } from '@/constants';
import axios from 'axios';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly' | 'forever';
  features: string[];
  isPopular?: boolean;
}

const ProfilePricing = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanSettings();
  }, []);

  const fetchPlanSettings = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/plan-settings`);
      if (response.data.success) {
        const apiPlans = response.data.plans;
        
        // Convert API plans to PricingPlan format
        const convertedPlans: PricingPlan[] = [
          {
            id: "free",
            name: apiPlans.free.name,
            description: "",
            price: apiPlans.free.price,
            features: apiPlans.free.features,
            isPopular: false,
            billingPeriod: "forever"
          },
          {
            id: "monthly",
            name: apiPlans.monthly.name,
            description: "",
            price: apiPlans.monthly.price,
            features: apiPlans.monthly.features,
            isPopular: true,
            billingPeriod: "monthly"
          },
          {
            id: "yearly",
            name: apiPlans.yearly.name,
            description: "",
            price: apiPlans.yearly.price,
            features: apiPlans.yearly.features,
            isPopular: false,
            billingPeriod: "yearly"
          }
        ];
        
        setPlans(convertedPlans);
      }
    } catch (error) {
      console.error('Error fetching plan settings:', error);
      // Fallback to default plans if API fails
      setPlans([
        {
          id: "free",
          name: "Free Plan",
          description: "",
          price: 0,
          features: [
            "Generate 5 Sub-Topics",
            "Lifetime access",
            "Theory & Image Course",
            "Ai Teacher Chat",
          ],
          isPopular: false,
          billingPeriod: "forever"
        },
        {
          id: "monthly",
          name: "Monthly Plan",
          description: "",
          price: 9,
          features: [
            "Generate 10 Sub-Topics",
            "1 Month Access",
            "Theory & Image Course",
            "Ai Teacher Chat",
            "Course In 23+ Languages",
            "Create Unlimited Course",
            "Video & Theory Course",
          ],
          isPopular: true,
          billingPeriod: "monthly"
        },
        {
          id: "yearly",
          name: "Yearly Plan",
          description: "",
          price: 99,
          features: [
            "Generate 10 Sub-Topics",
            "1 Year Access",
            "Theory & Image Course",
            "Ai Teacher Chat",
            "Course In 23+ Languages",
            "Create Unlimited Course",
            "Video & Theory Course",
          ],
          isPopular: false,
          billingPeriod: "yearly"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    if(sessionStorage.getItem('type') === 'forever'){
      return;
    }else if(sessionStorage.getItem('type') === planId){
      return;
    }
    navigate(`/dashboard/payment/${planId}`);
  };

  if (loading) {
    return (
      <div className="w-full px-2 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
          <p className="mt-3 text-muted-foreground">
            Loading plans...
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="mt-3 text-muted-foreground">
          Select the perfect plan to boost your course creation productivity
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`
              relative overflow-hidden transition-all duration-300 hover:shadow-lg
              ${plan.isPopular ? 'border-primary shadow-md shadow-primary/10' : 'border-border/50'}
            `}
          >
            <CardHeader>
              <div className="flex items-center">
                {plan.name === 'Professional' ? (
                  <Crown className="h-5 w-5 text-primary mr-2" />
                ) : plan.name === 'Enterprise' ? (
                  <Zap className="h-5 w-5 text-primary mr-2" />
                ) : null}
                <CardTitle>{plan.name}</CardTitle>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground ml-2">{plan.billingPeriod === 'monthly' ? '/mo' : plan.billingPeriod === 'yearly' ? '/yr' : ''}</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex">
                    <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full ${plan.isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                variant={plan.isPopular ? "default" : "outline"}
              >
                {sessionStorage.getItem('type') === plan.id ? 'Current Plan' : 'Change Plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProfilePricing;
