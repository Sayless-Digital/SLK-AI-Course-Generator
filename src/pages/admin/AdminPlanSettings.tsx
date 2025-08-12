// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Save, DollarSign, Calendar, Crown, CheckCircle } from "lucide-react";
import { serverURL } from '@/constants';
import axios from 'axios';

const AdminPlanSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState({
    free: {
      name: 'Free Plan',
      price: 0,
      period: 'forever',
      features: [
        "Generate 5 Sub-Topics",
        "Lifetime access",
        "Theory & Image Course",
        "Ai Teacher Chat",
      ]
    },
    monthly: {
      name: 'Monthly Plan',
      price: 9,
      period: 'monthly',
      features: [
        "Generate 10 Sub-Topics",
        "1 Month Access",
        "Theory & Image Course",
        "Ai Teacher Chat",
        "Course In 23+ Languages",
        "Create Unlimited Course",
        "Video & Theory Course",
      ]
    },
    yearly: {
      name: 'Yearly Plan',
      price: 99,
      period: 'yearly',
      features: [
        "Generate 10 Sub-Topics",
        "1 Year Access",
        "Theory & Image Course",
        "Ai Teacher Chat",
        "Course In 23+ Languages",
        "Create Unlimited Course",
        "Video & Theory Course",
      ]
    }
  });

  useEffect(() => {
    fetchPlanSettings();
  }, []);

  const fetchPlanSettings = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/plan-settings`);
      if (response.data.success) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      console.error('Error fetching plan settings:', error);
      // Use default plans if API fails
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (planKey, field, value) => {
    setPlans(prev => ({
      ...prev,
      [planKey]: {
        ...prev[planKey],
        [field]: value
      }
    }));
  };

  const handleFeatureChange = (planKey, index, value) => {
    setPlans(prev => ({
      ...prev,
      [planKey]: {
        ...prev[planKey],
        features: prev[planKey].features.map((feature, i) => 
          i === index ? value : feature
        )
      }
    }));
  };

  const addFeature = (planKey) => {
    setPlans(prev => ({
      ...prev,
      [planKey]: {
        ...prev[planKey],
        features: [...prev[planKey].features, "New Feature"]
      }
    }));
  };

  const removeFeature = (planKey, index) => {
    setPlans(prev => ({
      ...prev,
      [planKey]: {
        ...prev[planKey],
        features: prev[planKey].features.filter((_, i) => i !== index)
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await axios.post(`${serverURL}/api/plan-settings`, {
        plans
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Plan settings updated successfully",
        });
      }
    } catch (error) {
      console.error('Error saving plan settings:', error);
      toast({
        title: "Error",
        description: "Failed to save plan settings",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold leading-none">Plan Settings</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold leading-none">Plan Settings</h1>
        <Button onClick={saveSettings} disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Plan 1 (Free)
            </CardTitle>
            <CardDescription>
              Configure the first plan. Set price to 0 for a free plan, or any amount for a paid plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="free-name">Plan Name</Label>
                <Input
                  id="free-name"
                  value={plans.free.name}
                  onChange={(e) => handlePlanChange('free', 'name', e.target.value)}
                  placeholder="Free Plan"
                />
              </div>
              <div>
                <Label htmlFor="free-price">Price ($) - Set to 0 for free plan</Label>
                <Input
                  id="free-price"
                  type="number"
                  value={plans.free.price}
                  onChange={(e) => handlePlanChange('free', 'price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="free-period">Billing Period</Label>
                <Select
                  value={plans.free.period}
                  onValueChange={(value) => handlePlanChange('free', 'period', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forever">Forever (Lifetime)</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="flex items-center justify-between">
                Features
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addFeature('free')}
                >
                  Add Feature
                </Button>
              </Label>
              <div className="space-y-2 mt-2">
                {plans.free.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange('free', index, e.target.value)}
                      placeholder="Feature description"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature('free', index)}
                      className="text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Plan 2 (Monthly)
            </CardTitle>
            <CardDescription>
              Configure the second plan. Set price to 0 for a free plan, or any amount for a paid plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="monthly-name">Plan Name</Label>
                <Input
                  id="monthly-name"
                  value={plans.monthly.name}
                  onChange={(e) => handlePlanChange('monthly', 'name', e.target.value)}
                  placeholder="Monthly Plan"
                />
              </div>
              <div>
                <Label htmlFor="monthly-price">Price ($) - Set to 0 for free plan</Label>
                <Input
                  id="monthly-price"
                  type="number"
                  value={plans.monthly.price}
                  onChange={(e) => handlePlanChange('monthly', 'price', parseFloat(e.target.value) || 0)}
                  placeholder="9"
                />
              </div>
              <div>
                <Label htmlFor="monthly-period">Billing Period</Label>
                <Select
                  value={plans.monthly.period}
                  onValueChange={(value) => handlePlanChange('monthly', 'period', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forever">Forever (Lifetime)</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="flex items-center justify-between">
                Features
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addFeature('monthly')}
                >
                  Add Feature
                </Button>
              </Label>
              <div className="space-y-2 mt-2">
                {plans.monthly.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange('monthly', index, e.target.value)}
                      placeholder="Feature description"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature('monthly', index)}
                      className="text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Yearly Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Plan 3 (Yearly)
            </CardTitle>
            <CardDescription>
              Configure the third plan. Set price to 0 for a free plan, or any amount for a paid plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="yearly-name">Plan Name</Label>
                <Input
                  id="yearly-name"
                  value={plans.yearly.name}
                  onChange={(e) => handlePlanChange('yearly', 'name', e.target.value)}
                  placeholder="Yearly Plan"
                />
              </div>
              <div>
                <Label htmlFor="yearly-price">Price ($) - Set to 0 for free plan</Label>
                <Input
                  id="yearly-price"
                  type="number"
                  value={plans.yearly.price}
                  onChange={(e) => handlePlanChange('yearly', 'price', parseFloat(e.target.value) || 0)}
                  placeholder="99"
                />
              </div>
              <div>
                <Label htmlFor="yearly-period">Billing Period</Label>
                <Select
                  value={plans.yearly.period}
                  onValueChange={(value) => handlePlanChange('yearly', 'period', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forever">Forever (Lifetime)</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="flex items-center justify-between">
                Features
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addFeature('yearly')}
                >
                  Add Feature
                </Button>
              </Label>
              <div className="space-y-2 mt-2">
                {plans.yearly.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange('yearly', index, e.target.value)}
                      placeholder="Feature description"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature('yearly', index)}
                      className="text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPlanSettings; 