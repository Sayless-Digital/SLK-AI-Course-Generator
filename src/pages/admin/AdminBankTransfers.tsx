// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, Download, Clock } from "lucide-react";
import { serverURL } from '@/constants';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminBankTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingTransfers();
  }, []);

  const fetchPendingTransfers = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/pending-banktransfers`);
      if (response.data.success) {
        setTransfers(response.data.transfers);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending transfers",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transferId) => {
    setProcessing(true);
    try {
      const response = await axios.post(`${serverURL}/api/approve-banktransfer`, {
        paymentId: transferId,
        action: 'approve'
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Payment approved successfully",
        });
        fetchPendingTransfers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error approving transfer:', error);
      toast({
        title: "Error",
        description: "Failed to approve payment",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (transferId) => {
    setProcessing(true);
    try {
      const response = await axios.post(`${serverURL}/api/approve-banktransfer`, {
        paymentId: transferId,
        action: 'reject'
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Payment rejected successfully",
        });
        fetchPendingTransfers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error rejecting transfer:', error);
      toast({
        title: "Error",
        description: "Failed to reject payment",
      });
    } finally {
      setProcessing(false);
    }
  };

  const viewReceipt = (transfer) => {
    setSelectedTransfer(transfer);
  };

  const downloadReceipt = (receiptPath) => {
    const link = document.createElement('a');
    link.href = `${serverURL}/uploads/receipts/${receiptPath}`;
    link.download = receiptPath;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold leading-none">Bank Transfer Approvals</h1>
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
        <h1 className="text-3xl font-bold leading-none">Bank Transfer Approvals</h1>
        <Button onClick={fetchPendingTransfers} variant="outline">
          Refresh
        </Button>
      </div>

      {transfers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Pending Transfers</h3>
            <p className="text-muted-foreground">
              There are no pending bank transfer payments to review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <Card key={transfer.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {transfer.userName}
                      <Badge variant="outline" className="text-xs">
                        {transfer.planName}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {transfer.userEmail} • {formatDate(transfer.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${transfer.planPrice}</div>
                    <Badge variant="secondary" className="mt-1">
                      Pending Review
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium mb-2">Billing Address</h4>
                    <p className="text-sm text-muted-foreground">
                      {transfer.address}<br />
                      {transfer.city}, {transfer.state} {transfer.zipCode}<br />
                      {transfer.country}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Payment Details</h4>
                    <p className="text-sm text-muted-foreground">
                      Plan: {transfer.planName}<br />
                      Amount: ${transfer.planPrice}<br />
                      User ID: {transfer.userId}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewReceipt(transfer)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Receipt
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Payment Receipt</DialogTitle>
                          <DialogDescription>
                            Review the uploaded payment receipt for {transfer.userName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          {transfer.receiptPath && (
                            <div className="space-y-4">
                              <img 
                                src={`${serverURL}/uploads/receipts/${transfer.receiptPath}`}
                                alt="Payment Receipt"
                                className="w-full rounded-lg border"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <div style={{ display: 'none' }} className="text-center p-8 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Receipt image not available</p>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={() => downloadReceipt(transfer.receiptPath)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Receipt
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        <DialogFooter className="mt-6">
                          <Button
                            variant="outline"
                            onClick={() => downloadReceipt(transfer.receiptPath)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(transfer.id)}
                      disabled={processing}
                      className="text-destructive hover:text-destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(transfer.id)}
                      disabled={processing}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBankTransfers; 