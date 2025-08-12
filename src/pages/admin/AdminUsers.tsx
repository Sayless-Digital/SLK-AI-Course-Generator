
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash, 
  Crown, 
  Calendar, 
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  RefreshCw
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { serverURL } from '@/constants';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const AdminUsers = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isManagePlanDialogOpen, setIsManagePlanDialogOpen] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);

  // Plan management form states
  const [selectedPlanType, setSelectedPlanType] = useState('');
  const [subscriptionStartDate, setSubscriptionStartDate] = useState('');
  const [subscriptionEndDate, setSubscriptionEndDate] = useState('');
  const [actionType, setActionType] = useState('change'); // change, extend, cancel

  // Filtered data using memoization for better performance
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return data.filter((user) => {
      const nameMatch = user.mName?.toLowerCase().includes(query);
      const emailMatch = user.email?.toLowerCase().includes(query);
      const typeDisplay = user.type !== 'free' ? 'paid' : 'free';
      const typeMatch = typeDisplay.includes(query);
      const planMatch = user.planInfo?.name?.toLowerCase().includes(query);
      return nameMatch || emailMatch || typeMatch || planMatch;
    });
  }, [data, searchQuery]);

  useEffect(() => {
    fetchUsers();
    fetchPlanSettings();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/getusers`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlanSettings = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/plan-settings`);
      if (response.data.success) {
        setAvailablePlans(response.data.plans);
      }
    } catch (error) {
      console.error('Error fetching plan settings:', error);
    }
  };

  const handleManagePlan = async () => {
    if (!selectedUser) return;
    
    setLoadingAction(true);
    try {
      let response;
      
      if (actionType === 'cancel') {
        response = await axios.post(`${serverURL}/api/cancel-user-subscription`, {
          userId: selectedUser.id
        });
      } else if (actionType === 'extend') {
        const startDate = new Date(subscriptionStartDate);
        const endDate = new Date(subscriptionEndDate);
        const extensionDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        response = await axios.post(`${serverURL}/api/extend-user-subscription`, {
          userId: selectedUser.id,
          extensionDays
        });
      } else {
        // Change plan
        response = await axios.post(`${serverURL}/api/update-user-plan`, {
          userId: selectedUser.id,
          newPlanType: selectedPlanType
        });
      }

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
        });
        setIsManagePlanDialogOpen(false);
        fetchUsers();
        resetForm();
      }
    } catch (error) {
      console.error('Error managing user plan:', error);
      toast({
        title: "Error",
        description: "Failed to manage user plan",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const resetForm = () => {
    setSelectedPlanType('');
    setSubscriptionStartDate('');
    setSubscriptionEndDate('');
    setActionType('change');
    setSelectedUser(null);
  };

  const openUserDialog = (user) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const openManagePlanDialog = (user) => {
    setSelectedUser(user);
    setSelectedPlanType(user.type);
    
    // Set default dates if user has subscription
    if (user.currentSubscription) {
      const startDate = new Date(user.currentSubscription.createdAt);
      const endDate = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from start
      
      setSubscriptionStartDate(startDate.toISOString().split('T')[0]);
      setSubscriptionEndDate(endDate.toISOString().split('T')[0]);
    } else {
      const today = new Date();
      const endDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      setSubscriptionStartDate(today.toISOString().split('T')[0]);
      setSubscriptionEndDate(endDate.toISOString().split('T')[0]);
    }
    
    setIsManagePlanDialogOpen(true);
  };

  const getPlanIcon = (planType) => {
    switch (planType) {
      case 'free': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'monthly': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'yearly': return <DollarSign className="h-4 w-4 text-green-500" />;
      default: return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (user) => {
    if (user.type === 'free') {
      return <Badge variant="secondary">Free</Badge>;
    }
    
    const subscription = user.currentSubscription;
    if (!subscription) {
      return <Badge variant="destructive">No Active Subscription</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage user accounts and subscriptions</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Users</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableBody>
                {[1, 2, 3, 4].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            ) : (
              <TableBody>
                {filteredData.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.mName || 'No Name'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPlanIcon(user.type)}
                        <span className="text-sm">{user.planInfo?.name || user.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.currentSubscription ? (
                          <div>
                            <div>Method: {user.currentSubscription.method}</div>
                            <div>Created: {formatDate(user.currentSubscription.createdAt)}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No subscription</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openUserDialog(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openManagePlanDialog(user)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Manage Plan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-8 w-8 mb-2" />
                        <p>No users match your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedUser?.mName || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Basic Info</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <div className="text-sm text-muted-foreground">{selectedUser.mName || 'Not provided'}</div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                    </div>
                    <div>
                      <Label>Current Plan</Label>
                      <div className="text-sm text-muted-foreground">{selectedUser.planInfo?.name}</div>
                    </div>
                    <div>
                      <Label>Plan Price</Label>
                      <div className="text-sm text-muted-foreground">${selectedUser.planInfo?.price}</div>
                    </div>
                    <div>
                      <Label>Plan Period</Label>
                      <div className="text-sm text-muted-foreground">{selectedUser.planInfo?.period}</div>
                    </div>
                    <div>
                      <Label>Member Since</Label>
                      <div className="text-sm text-muted-foreground">{formatDate(selectedUser.createdAt)}</div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="subscription" className="space-y-4">
                  {selectedUser.currentSubscription ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Subscription ID</Label>
                          <div className="text-sm text-muted-foreground">{selectedUser.currentSubscription.subscription}</div>
                        </div>
                        <div>
                          <Label>Payment Method</Label>
                          <div className="text-sm text-muted-foreground">{selectedUser.currentSubscription.method}</div>
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <div className="text-sm text-muted-foreground">{formatDate(selectedUser.currentSubscription.createdAt)}</div>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <div className="text-sm text-muted-foreground">
                            {selectedUser.currentSubscription.active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No active subscription found
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="activity" className="space-y-4">
                  <div>
                    <Label>Total Courses Created</Label>
                    <div className="text-sm text-muted-foreground">{selectedUser.courses?.length || 0}</div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Plan Dialog */}
      <Dialog open={isManagePlanDialogOpen} onOpenChange={setIsManagePlanDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage User Plan</DialogTitle>
            <DialogDescription>
              Manage plan and subscription for {selectedUser?.mName || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Current Plan Info */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Current Plan</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Plan:</span>
                    <div className="font-medium">{selectedUser.planInfo?.name || selectedUser.type}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span>
                    <div className="font-medium">${selectedUser.planInfo?.price || 0}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="font-medium">{selectedUser.currentSubscription ? 'Active' : 'No Subscription'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Member Since:</span>
                    <div className="font-medium">{formatDate(selectedUser.createdAt)}</div>
                  </div>
                </div>
              </div>

              {/* Action Type Selection */}
              <div>
                <Label>Action</Label>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="change">Change Plan</SelectItem>
                    <SelectItem value="extend">Extend/Modify Dates</SelectItem>
                    <SelectItem value="cancel">Cancel Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Change Plan Section */}
              {actionType === 'change' && (
                <div className="space-y-4">
                  <div>
                    <Label>New Plan</Label>
                    <Select value={selectedPlanType} onValueChange={setSelectedPlanType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(availablePlans).map(([key, plan]) => (
                          <SelectItem key={key} value={key}>
                            {plan.name} - ${plan.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Extend/Modify Dates Section */}
              {actionType === 'extend' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={subscriptionStartDate}
                        onChange={(e) => setSubscriptionStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={subscriptionEndDate}
                        onChange={(e) => setSubscriptionEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Duration: {subscriptionStartDate && subscriptionEndDate ? 
                      Math.ceil((new Date(subscriptionEndDate) - new Date(subscriptionStartDate)) / (1000 * 60 * 60 * 24)) : 0} days
                  </div>
                </div>
              )}

              {/* Cancel Subscription Section */}
              {actionType === 'cancel' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      This will cancel the user's subscription and set them to the free plan.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManagePlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleManagePlan} 
              disabled={loadingAction || 
                (actionType === 'change' && !selectedPlanType) ||
                (actionType === 'extend' && (!subscriptionStartDate || !subscriptionEndDate))
              }
              variant={actionType === 'cancel' ? 'destructive' : 'default'}
            >
              {loadingAction ? 'Processing...' : 
                actionType === 'change' ? 'Change Plan' :
                actionType === 'extend' ? 'Update Dates' :
                'Cancel Subscription'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
