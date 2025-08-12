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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Save, DollarSign, Calendar, Crown, CheckCircle, Settings, Zap, Globe } from "lucide-react";
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
      ],
      // Functional limits
      maxSubtopics: 5,
      maxTopics: 4,
      courseTypes: ["Text & Image Course"],
      languages: ["English"],
      unlimitedCourses: false,
      aiTeacherChat: true,
      videoCourses: false,
      theoryCourses: true,
      imageCourses: true
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
      ],
      // Functional limits
      maxSubtopics: 10,
      maxTopics: 8,
      courseTypes: ["Text & Image Course", "Video & Text Course"],
      languages: ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Bengali", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Czech", "Hungarian", "Romanian", "Bulgarian"],
      unlimitedCourses: true,
      aiTeacherChat: true,
      videoCourses: true,
      theoryCourses: true,
      imageCourses: true
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
      ],
      // Functional limits
      maxSubtopics: 10,
      maxTopics: 8,
      courseTypes: ["Text & Image Course", "Video & Text Course"],
      languages: ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Bengali", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Czech", "Hungarian", "Romanian", "Bulgarian"],
      unlimitedCourses: true,
      aiTeacherChat: true,
      videoCourses: true,
      theoryCourses: true,
      imageCourses: true
    }
  });

  const allLanguages = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", 
    "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Bengali", "Dutch", 
    "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Czech", "Hungarian", 
    "Romanian", "Bulgarian", "Croatian", "Slovak", "Slovenian", "Estonian", 
    "Latvian", "Lithuanian", "Greek", "Hebrew", "Turkish", "Thai", "Vietnamese", 
    "Indonesian", "Malay", "Filipino", "Swahili"
  ];

  const allCourseTypes = ["Text & Image Course", "Video & Text Course"];

  useEffect(() => {
    fetchPlanSettings();
  }, []);

  const fetchPlanSettings = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/plan-settings`);
      if (response.data.success) {
        // Ensure all plans have the required fields with defaults
        const fetchedPlans = response.data.plans;
        const updatedPlans = {};
        
        ['free', 'monthly', 'yearly'].forEach(planKey => {
          const plan = fetchedPlans[planKey] || {};
          updatedPlans[planKey] = {
            name: plan.name || 'Plan',
            price: plan.price || 0,
            period: plan.period || 'forever',
            features: plan.features || [],
            maxSubtopics: plan.maxSubtopics || 5,
            maxTopics: plan.maxTopics || 4,
            courseTypes: plan.courseTypes || ["Text & Image Course"],
            languages: plan.languages || ["English"],
            unlimitedCourses: plan.unlimitedCourses || false,
            aiTeacherChat: plan.aiTeacherChat !== false,
            videoCourses: plan.videoCourses || false,
            theoryCourses: plan.theoryCourses !== false,
            imageCourses: plan.imageCourses !== false
          };
        });
        
        setPlans(updatedPlans);
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

  const handleLanguageToggle = (planKey, language) => {
    setPlans(prev => {
      const currentLanguages = prev[planKey].languages;
      const newLanguages = currentLanguages.includes(language)
        ? currentLanguages.filter(l => l !== language)
        : [...currentLanguages, language];
      
      return {
        ...prev,
        [planKey]: {
          ...prev[planKey],
          languages: newLanguages
        }
      };
    });
  };

  const handleCourseTypeToggle = (planKey, courseType) => {
    setPlans(prev => {
      const currentTypes = prev[planKey].courseTypes;
      const newTypes = currentTypes.includes(courseType)
        ? currentTypes.filter(t => t !== courseType)
        : [...currentTypes, courseType];
      
      return {
        ...prev,
        [planKey]: {
          ...prev[planKey],
          courseTypes: newTypes
        }
      };
    });
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

  const renderPlanCard = (planKey, planData, planTitle, planIcon, planColor) => (
    <Card key={planKey}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 text-${planColor}`}>
          {planIcon}
          {planTitle}
        </CardTitle>
        <CardDescription>
          Configure both display features and functional limits for this plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Plan Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Basic Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor={`${planKey}-name`}>Plan Name</Label>
              <Input
                id={`${planKey}-name`}
                value={planData.name}
                onChange={(e) => handlePlanChange(planKey, 'name', e.target.value)}
                placeholder="Plan Name"
              />
            </div>
            <div>
              <Label htmlFor={`${planKey}-price`}>Price ($)</Label>
              <Input
                id={`${planKey}-price`}
                type="number"
                value={planData.price}
                onChange={(e) => handlePlanChange(planKey, 'price', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor={`${planKey}-period`}>Billing Period</Label>
              <Select
                value={planData.period}
                onValueChange={(value) => handlePlanChange(planKey, 'period', value)}
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
        </div>

        <Separator />

        {/* Functional Limits */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Functional Limits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Generation Limits */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Course Generation</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`${planKey}-maxSubtopics`}>Max Sub-Topics</Label>
                  <Input
                    id={`${planKey}-maxSubtopics`}
                    type="number"
                    value={planData.maxSubtopics || 5}
                    onChange={(e) => handlePlanChange(planKey, 'maxSubtopics', parseInt(e.target.value) || 0)}
                    placeholder="5"
                  />
                </div>
                <div>
                  <Label htmlFor={`${planKey}-maxTopics`}>Max Main Topics</Label>
                  <Select
                    value={(planData.maxTopics || 4).toString()}
                    onValueChange={(value) => handlePlanChange(planKey, 'maxTopics', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select max topics" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 Topics</SelectItem>
                      <SelectItem value="8">8 Topics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Feature Access</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${planKey}-unlimitedCourses`}>Unlimited Courses</Label>
                  <Switch
                    id={`${planKey}-unlimitedCourses`}
                    checked={planData.unlimitedCourses || false}
                    onCheckedChange={(checked) => handlePlanChange(planKey, 'unlimitedCourses', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${planKey}-aiTeacherChat`}>AI Teacher Chat</Label>
                  <Switch
                    id={`${planKey}-aiTeacherChat`}
                    checked={planData.aiTeacherChat !== false}
                    onCheckedChange={(checked) => handlePlanChange(planKey, 'aiTeacherChat', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${planKey}-videoCourses`}>Video Courses</Label>
                  <Switch
                    id={`${planKey}-videoCourses`}
                    checked={planData.videoCourses || false}
                    onCheckedChange={(checked) => handlePlanChange(planKey, 'videoCourses', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${planKey}-theoryCourses`}>Theory Courses</Label>
                  <Switch
                    id={`${planKey}-theoryCourses`}
                    checked={planData.theoryCourses !== false}
                    onCheckedChange={(checked) => handlePlanChange(planKey, 'theoryCourses', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${planKey}-imageCourses`}>Image Courses</Label>
                  <Switch
                    id={`${planKey}-imageCourses`}
                    checked={planData.imageCourses !== false}
                    onCheckedChange={(checked) => handlePlanChange(planKey, 'imageCourses', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Course Types */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Available Course Types
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allCourseTypes.map((courseType) => (
              <div key={courseType} className="flex items-center space-x-2">
                <Checkbox
                  id={`${planKey}-${courseType}`}
                  checked={(planData.courseTypes || []).includes(courseType)}
                  onCheckedChange={() => handleCourseTypeToggle(planKey, courseType)}
                />
                <Label htmlFor={`${planKey}-${courseType}`}>{courseType}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Languages */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Available Languages
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {allLanguages.map((language) => (
              <div key={language} className="flex items-center space-x-2">
                <Checkbox
                  id={`${planKey}-${language}`}
                  checked={(planData.languages || []).includes(language)}
                  onCheckedChange={() => handleLanguageToggle(planKey, language)}
                />
                <Label htmlFor={`${planKey}-${language}`} className="text-sm">{language}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Display Features */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Display Features (Text shown to users)
          </h3>
          <div>
            <Label className="flex items-center justify-between">
              Features
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addFeature(planKey)}
              >
                Add Feature
              </Button>
            </Label>
            <div className="space-y-2 mt-2">
              {(planData.features || []).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(planKey, index, e.target.value)}
                    placeholder="Feature description"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFeature(planKey, index)}
                    className="text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
        {renderPlanCard('free', plans.free, 'Plan 1 (Free)', <Crown className="h-5 w-5 text-yellow-500" />, 'yellow-500')}
        {renderPlanCard('monthly', plans.monthly, 'Plan 2 (Monthly)', <Calendar className="h-5 w-5 text-blue-500" />, 'blue-500')}
        {renderPlanCard('yearly', plans.yearly, 'Plan 3 (Yearly)', <DollarSign className="h-5 w-5 text-green-500" />, 'green-500')}
      </div>
    </div>
  );
};

export default AdminPlanSettings; 