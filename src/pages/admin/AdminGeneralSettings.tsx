// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Save, Globe, Mail, Phone, MapPin } from "lucide-react";
import { serverURL } from '@/constants';
import axios from 'axios';

const AdminGeneralSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'AI Course Generator',
    siteDescription: 'Create comprehensive courses with AI assistance',
    contactEmail: 'support@aicoursegenerator.com',
    contactPhone: '+1 (555) 123-4567',
    address: '123 Main Street, Port of Spain, Trinidad and Tobago',
    bankDetails: {
      bank: 'First Citizens',
      accountNumber: '2614969',
      branch: 'Independence Square',
      accountName: 'Dallas Alejandro Ferdinand'
    }
  });

  useEffect(() => {
    fetchGeneralSettings();
  }, []);

  const fetchGeneralSettings = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/general-settings`);
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error fetching general settings:', error);
      // Use default settings if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBankDetailChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await axios.post(`${serverURL}/api/general-settings`, {
        settings
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "General settings updated successfully",
        });
      }
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast({
        title: "Error",
        description: "Failed to save general settings",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold leading-none">General Settings</h1>
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
        <h1 className="text-2xl font-bold leading-none">General Settings</h1>
        <Button onClick={saveSettings} disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Site Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Site Information
            </CardTitle>
            <CardDescription>
              Configure basic site information and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site-name">Site Name</Label>
                <Input
                  id="site-name"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  placeholder="AI Course Generator"
                />
              </div>
              <div>
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                  placeholder="support@aicoursegenerator.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="site-description">Site Description</Label>
              <Textarea
                id="site-description"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                placeholder="Create comprehensive courses with AI assistance"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-500" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Update contact details and business information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-phone">Phone Number</Label>
                <Input
                  id="contact-phone"
                  value={settings.contactPhone}
                  onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleSettingChange('address', e.target.value)}
                  placeholder="123 Main Street, Port of Spain, Trinidad and Tobago"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              Bank Transfer Details
            </CardTitle>
            <CardDescription>
              Configure bank transfer information for payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  value={settings.bankDetails.bank}
                  onChange={(e) => handleBankDetailChange('bank', e.target.value)}
                  placeholder="First Citizens"
                />
              </div>
              <div>
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  value={settings.bankDetails.accountNumber}
                  onChange={(e) => handleBankDetailChange('accountNumber', e.target.value)}
                  placeholder="2614969"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={settings.bankDetails.branch}
                  onChange={(e) => handleBankDetailChange('branch', e.target.value)}
                  placeholder="Independence Square"
                />
              </div>
              <div>
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  value={settings.bankDetails.accountName}
                  onChange={(e) => handleBankDetailChange('accountName', e.target.value)}
                  placeholder="Dallas Alejandro Ferdinand"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminGeneralSettings; 