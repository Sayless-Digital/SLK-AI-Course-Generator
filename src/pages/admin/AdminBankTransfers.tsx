// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, Download, Clock, RefreshCw, Search, Filter } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminBankTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAllTransfers();
  }, []);

  useEffect(() => {
    filterTransfers();
  }, [transfers, searchTerm, statusFilter]);

  const filterTransfers = () => {
    let filtered = transfers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transfer =>
        transfer.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.planName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transfer => transfer.status === statusFilter);
    }

    setFilteredTransfers(filtered);
  };

  const fetchAllTransfers = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/all-banktransfers`);
      if (response.data.success) {
        setTransfers(response.data.transfers);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transfers",
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
        fetchAllTransfers(); // Refresh the list
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
        fetchAllTransfers(); // Refresh the list
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

  const handleStatusChange = async (transferId, newStatus) => {
    setProcessing(true);
    try {
      let action = 'approve';
      if (newStatus === 'rejected') {
        action = 'reject';
      } else if (newStatus === 'pending') {
        // For pending status, we might need a different endpoint or logic
        // For now, we'll just update the status directly
        const response = await axios.post(`${serverURL}/api/update-banktransfer-status`, {
          paymentId: transferId,
          status: newStatus
        });
        
        if (response.data.success) {
          toast({
            title: "Success",
            description: `Status updated to ${newStatus}`,
          });
          fetchAllTransfers();
        }
        setProcessing(false);
        return;
      }

      const response = await axios.post(`${serverURL}/api/approve-banktransfer`, {
        paymentId: transferId,
        action: action
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Status updated to ${newStatus}`,
        });
        fetchAllTransfers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold leading-none">Bank Transfer Management</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold leading-none">Bank Transfer Management</h1>
        <Button onClick={fetchAllTransfers} variant="outline" disabled={loading} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredTransfers.length} of {transfers.length} transfers
        </div>
      </div>

      {filteredTransfers.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-base font-medium mb-1">No Transfers Found</h3>
            <p className="text-sm text-muted-foreground">
              {transfers.length === 0 
                ? "There are no bank transfer payments in the system."
                : "No transfers match your search criteria."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3">Customer Name</TableHead>
                  <TableHead className="py-3 text-center">Subscription Plan</TableHead>
                  <TableHead className="py-3 text-center">Payment Amount</TableHead>
                  <TableHead className="py-3 text-center">Payment Status</TableHead>
                  <TableHead className="py-3 text-center">Transaction Date</TableHead>
                  <TableHead className="py-3 text-center">Payment Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="py-2">
                      <div>
                        <div className="font-medium text-sm">{transfer.userName}</div>
                        <div className="text-xs text-muted-foreground">{transfer.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      <Badge variant="outline" className="text-xs">
                        {transfer.planName}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium py-2 text-center">${transfer.planPrice}</TableCell>
                    <TableCell className="py-2 text-center">
                      <div className="flex justify-center">
                        <Select
                          value={transfer.status}
                          onValueChange={(newStatus) => handleStatusChange(transfer.id, newStatus)}
                          disabled={processing}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              Pending
                            </div>
                          </SelectItem>
                          <SelectItem value="approved">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Approved
                            </div>
                          </SelectItem>
                          <SelectItem value="rejected">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              Rejected
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                        </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground py-2 text-center">
                      <div className="flex justify-center">
                        {formatDate(transfer.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewReceipt(transfer)}
                            className="h-7 w-7 p-0"
                          >
                            <Eye className="h-3 w-3" />
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminBankTransfers; 