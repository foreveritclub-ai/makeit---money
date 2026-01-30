import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useWallets, useUpdateProfile } from "@/hooks/useProfile";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { AppLayout } from "@/components/layout/AppLayout";
import { TierBadge } from "@/components/wallet/TierBadge";
import { WalletTransferDialog } from "@/components/wallet/WalletTransferDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Phone, 
  Mail, 
  LogOut, 
  Edit2, 
  Save,
  X,
  History,
  Shield,
  HelpCircle,
  Settings
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: wallets } = useWallets();
  const { data: isAdmin } = useIsAdmin();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");

  const handleEdit = () => {
    setDisplayName(profile?.display_name || "");
    setPhone(profile?.phone || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      display_name: displayName,
      phone: phone,
    });
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const formatNumber = (num: number) => new Intl.NumberFormat("en-RW").format(num);
  const glassWallet = wallets?.find(w => w.wallet_type === "glass");
  const blackWallet = wallets?.find(w => w.wallet_type === "black");

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  {profileLoading ? (
                    <Skeleton className="h-6 w-32 mb-2" />
                  ) : (
                    <h2 className="text-xl font-bold">
                      {profile?.display_name || "Set your name"}
                    </h2>
                  )}
                  <TierBadge tier={profile?.tier || "basic"} />
                </div>
              </div>
              {!isEditing && (
                <Button size="sm" variant="ghost" onClick={handleEdit}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 7XX XXX XXX"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={updateProfile.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile?.email || "No email"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile?.phone || "No phone number"}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Account Statistics</CardTitle>
            {wallets && wallets.length > 0 && (
              <WalletTransferDialog wallets={wallets} />
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{formatNumber(profile?.total_deposits || 0)}</p>
                <p className="text-xs text-muted-foreground">Total Deposits (FRW)</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{profile?.score || 0}</p>
                <p className="text-xs text-muted-foreground">Score Points</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-500/10">
                <p className="text-2xl font-bold text-blue-400">{formatNumber(glassWallet?.balance || 0)}</p>
                <p className="text-xs text-muted-foreground">Glass Wallet</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-500/10">
                <p className="text-2xl font-bold text-green-400">{formatNumber(blackWallet?.balance || 0)}</p>
                <p className="text-xs text-muted-foreground">Black Wallet</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tier Progress */}
      {profile?.tier !== "verified" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-5 w-5 text-yellow-400" />
                <span className="font-medium">Upgrade Your Account</span>
              </div>
              
              {profile?.tier === "basic" ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Purchase any premium token (80k+ FRW) to become an Agent
                  </p>
                  <Button size="sm" onClick={() => navigate("/market")}>
                    View Premium Tokens
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Deposit 1.1M FRW total to become Verified (Gold Tick)
                  </p>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min(100, ((profile?.total_deposits || 0) / 1100000) * 100)}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(profile?.total_deposits || 0)} / 1,100,000 FRW
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        {isAdmin && (
          <Button 
            variant="default" 
            className="w-full justify-start bg-primary/90 hover:bg-primary" 
            onClick={() => navigate("/admin")}
          >
            <Settings className="h-4 w-4 mr-3" />
            Admin Dashboard
          </Button>
        )}

        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={() => navigate("/transactions")}
        >
          <History className="h-4 w-4 mr-3" />
          Transaction History
        </Button>
        
        <Button variant="outline" className="w-full justify-start">
          <HelpCircle className="h-4 w-4 mr-3" />
          Help & Support
        </Button>

        <Separator className="my-4" />

        <Button 
          variant="destructive" 
          className="w-full" 
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </motion.div>

      {/* Legal */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-muted-foreground text-center mt-6"
      >
        VirtuixRW v1.0.0 • Rwanda
      </motion.p>
    </AppLayout>
  );
}
