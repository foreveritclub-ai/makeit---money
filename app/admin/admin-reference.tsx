import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  Wallet, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  Shield,
  RefreshCw,
  Search
} from "lucide-react";

interface PendingDeposit {
  id: string;
  amount: number;
  created_at: string;
  user_id: string;
  status: string;
  user_email?: string;
  user_phone?: string;
}

interface PendingWithdrawal {
  id: string;
  amount: number;
  fee: number;
  net_amount: number;
  phone_number: string;
  requested_at: string;
  user_id: string;
  status: string;
  wallet_type: string;
  user_email?: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  tier: string;
  kyc_status: string;
  total_deposits: number;
  score: number;
  referral_code: string;
  created_at: string;
}

interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("deposits");
  
  // Data states
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Action states
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<"confirm" | "reject" | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user?.id) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .rpc('is_admin');

    if (error || !data) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);
    setIsLoading(false);
    loadAllData();
  };

  const loadAllData = async () => {
    await Promise.all([
      loadPendingDeposits(),
      loadPendingWithdrawals(),
      loadUsers(),
      loadSettings(),
    ]);
  };

  const loadPendingDeposits = async () => {
    const { data: deposits } = await supabase
      .from("deposits")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (deposits) {
      // Fetch user details for each deposit
      const depositsWithUsers = await Promise.all(
        deposits.map(async (deposit) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, phone")
            .eq("user_id", deposit.user_id)
            .single();
          return {
            ...deposit,
            user_email: profile?.email,
            user_phone: profile?.phone,
          };
        })
      );
      setPendingDeposits(depositsWithUsers);
    }
  };

  const loadPendingWithdrawals = async () => {
    const { data: withdrawals } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("status", "pending")
      .order("requested_at", { ascending: false });

    if (withdrawals) {
      const withdrawalsWithUsers = await Promise.all(
        withdrawals.map(async (withdrawal) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("user_id", withdrawal.user_id)
            .single();
          return {
            ...withdrawal,
            user_email: profile?.email,
          };
        })
      );
      setPendingWithdrawals(withdrawalsWithUsers);
    }
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setUsers(data);
    }
  };

  const loadSettings = async () => {
    const { data } = await supabase
      .from("platform_settings")
      .select("*")
      .order("setting_key");

    if (data) {
      setSettings(data);
    }
  };

  const confirmDeposit = async (deposit: PendingDeposit) => {
    setProcessingId(deposit.id);
    
    const { error } = await supabase
      .from("deposits")
      .update({ status: "confirmed" })
      .eq("id", deposit.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deposit Confirmed",
        description: `${formatNumber(deposit.amount)} FRW has been credited to user's Black Wallet`,
      });
      loadPendingDeposits();
    }
    
    setProcessingId(null);
    setDialogType(null);
  };

  const approveWithdrawal = async (withdrawal: PendingWithdrawal) => {
    setProcessingId(withdrawal.id);
    
    const walletType = withdrawal.wallet_type as "glass" | "black";
    
    // First deduct from wallet
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", withdrawal.user_id)
      .eq("wallet_type", walletType)
      .single();

    if (!wallet || wallet.balance < withdrawal.amount) {
      toast({
        title: "Error",
        description: "Insufficient balance in user's wallet",
        variant: "destructive",
      });
      setProcessingId(null);
      return;
    }

    const newBalance = wallet.balance - withdrawal.amount;

    // Update wallet balance
    await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", withdrawal.user_id)
      .eq("wallet_type", walletType);

    // Record transaction
    await supabase
      .from("transactions")
      .insert({
        user_id: withdrawal.user_id,
        wallet_type: walletType,
        amount: -withdrawal.amount,
        balance_before: wallet.balance,
        balance_after: newBalance,
        transaction_type: "withdrawal",
        description: `Withdrawal to ${withdrawal.phone_number}`,
        reference_id: withdrawal.id,
      });

    // Update withdrawal status
    const { error } = await supabase
      .from("withdrawals")
      .update({ 
        status: "approved",
        processed_at: new Date().toISOString(),
        processed_by: user?.id,
      })
      .eq("id", withdrawal.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Withdrawal Approved",
        description: `${formatNumber(withdrawal.net_amount)} FRW will be sent to ${withdrawal.phone_number}`,
      });
      loadPendingWithdrawals();
    }
    
    setProcessingId(null);
    setDialogType(null);
  };

  const rejectWithdrawal = async (withdrawal: PendingWithdrawal) => {
    if (!rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(withdrawal.id);
    
    const { error } = await supabase
      .from("withdrawals")
      .update({ 
        status: "rejected",
        rejection_reason: rejectReason,
        processed_at: new Date().toISOString(),
        processed_by: user?.id,
      })
      .eq("id", withdrawal.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Withdrawal Rejected",
        description: "The user has been notified",
      });
      loadPendingWithdrawals();
    }
    
    setProcessingId(null);
    setRejectReason("");
    setDialogType(null);
  };

  const updateSetting = async (setting: PlatformSetting, newValue: string) => {
    const { error } = await supabase
      .from("platform_settings")
      .update({ 
        setting_value: newValue,
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      })
      .eq("id", setting.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Setting Updated",
        description: `${setting.setting_key} has been updated`,
      });
      loadSettings();
    }
  };

  const formatNumber = (num: number) => new Intl.NumberFormat("en-RW").format(num);
  const formatDate = (date: string) => new Date(date).toLocaleString("en-RW");

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery) ||
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.referral_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage users, deposits & withdrawals</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              ← Back
            </Button>
            <Button variant="outline" onClick={loadAllData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <ArrowDownCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending Deposits</p>
                  <p className="text-xl font-bold">{pendingDeposits.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <ArrowUpCircle className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending Withdrawals</p>
                  <p className="text-xl font-bold">{pendingWithdrawals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                  <p className="text-xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Wallet className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Deposits</p>
                  <p className="text-xl font-bold">{formatNumber(users.reduce((acc, u) => acc + u.total_deposits, 0))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="deposits" className="flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Deposits</span>
              {pendingDeposits.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingDeposits.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Withdrawals</span>
              {pendingWithdrawals.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingWithdrawals.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <Card>
              <CardHeader>
                <CardTitle>Pending Deposits</CardTitle>
                <CardDescription>
                  Confirm deposits after verifying MTN MoMo transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingDeposits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending deposits</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Profit (10%)</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingDeposits.map((deposit) => (
                          <TableRow key={deposit.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{deposit.user_email || "No email"}</p>
                                <p className="text-xs text-muted-foreground">{deposit.user_phone || "No phone"}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold">
                              {formatNumber(deposit.amount)} FRW
                            </TableCell>
                            <TableCell className="text-green-400">
                              +{formatNumber(deposit.amount * 0.1)} FRW
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(deposit.created_at)}
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    disabled={processingId === deposit.id}
                                    onClick={() => {
                                      setSelectedItem(deposit);
                                      setDialogType("confirm");
                                    }}
                                  >
                                    {processingId === deposit.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                    )}
                                    Confirm
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirm Deposit</DialogTitle>
                                    <DialogDescription>
                                      Make sure you have verified the MTN MoMo transaction before confirming.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-muted">
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-muted-foreground">User:</span>
                                        <span>{deposit.user_email}</span>
                                        <span className="text-muted-foreground">Phone:</span>
                                        <span>{deposit.user_phone || "N/A"}</span>
                                        <span className="text-muted-foreground">Amount:</span>
                                        <span className="font-bold">{formatNumber(deposit.amount)} FRW</span>
                                        <span className="text-muted-foreground">Profit:</span>
                                        <span className="text-green-400">+{formatNumber(deposit.amount * 0.1)} FRW</span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      This will credit {formatNumber(deposit.amount)} FRW to the user's Black Wallet.
                                      The 10% profit will be credited to their Glass Wallet after 3 hours.
                                    </p>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setDialogType(null)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={() => confirmDeposit(deposit)}>
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Confirm Deposit
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Pending Withdrawals</CardTitle>
                <CardDescription>
                  Approve or reject withdrawal requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingWithdrawals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending withdrawals</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Fee</TableHead>
                          <TableHead>Net</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingWithdrawals.map((withdrawal) => (
                          <TableRow key={withdrawal.id}>
                            <TableCell>
                              <p className="font-medium">{withdrawal.user_email || "No email"}</p>
                            </TableCell>
                            <TableCell>{formatNumber(withdrawal.amount)} FRW</TableCell>
                            <TableCell className="text-red-400">-{formatNumber(withdrawal.fee)} FRW</TableCell>
                            <TableCell className="font-bold">{formatNumber(withdrawal.net_amount)} FRW</TableCell>
                            <TableCell>{withdrawal.phone_number}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm"
                                      disabled={processingId === withdrawal.id}
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Approve Withdrawal</DialogTitle>
                                      <DialogDescription>
                                        Confirm that you will send the funds via MTN MoMo.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="p-4 rounded-lg bg-muted">
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-muted-foreground">Send to:</span>
                                        <span className="font-bold">{withdrawal.phone_number}</span>
                                        <span className="text-muted-foreground">Amount:</span>
                                        <span className="font-bold text-green-400">{formatNumber(withdrawal.net_amount)} FRW</span>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline">Cancel</Button>
                                      <Button onClick={() => approveWithdrawal(withdrawal)}>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Approve
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      disabled={processingId === withdrawal.id}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reject Withdrawal</DialogTitle>
                                      <DialogDescription>
                                        Please provide a reason for rejection.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Rejection Reason</Label>
                                        <Textarea
                                          placeholder="Enter reason for rejection..."
                                          value={rejectReason}
                                          onChange={(e) => setRejectReason(e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline">Cancel</Button>
                                      <Button variant="destructive" onClick={() => rejectWithdrawal(withdrawal)}>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all registered users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email, phone, or referral code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>KYC</TableHead>
                        <TableHead>Total Deposits</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{profile.display_name || profile.email || "Anonymous"}</p>
                              <p className="text-xs text-muted-foreground">{profile.referral_code}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              profile.tier === "verified" ? "default" :
                              profile.tier === "premium" ? "secondary" : "outline"
                            }>
                              {profile.tier}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              profile.kyc_status === "approved" ? "default" :
                              profile.kyc_status === "pending" ? "secondary" :
                              profile.kyc_status === "rejected" ? "destructive" : "outline"
                            }>
                              {profile.kyc_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatNumber(profile.total_deposits)} FRW
                          </TableCell>
                          <TableCell>{profile.score}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>
                  Configure platform-wide settings and parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <Label className="font-medium">{setting.setting_key}</Label>
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      </div>
                      <div className="w-48">
                        <Input
                          defaultValue={setting.setting_value}
                          onBlur={(e) => {
                            if (e.target.value !== setting.setting_value) {
                              updateSetting(setting, e.target.value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back to Dashboard */}
        <div className="mt-6">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
