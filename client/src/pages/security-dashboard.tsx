import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MFASetup } from "@/components/security/mfa-setup";
import { Shield, ShieldCheck, ShieldAlert, Key, Smartphone, AlertTriangle, CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/navbar";

export default function SecurityDashboard() {
  const { user, isLoading } = useAuth();
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [mfaVerificationCode, setMfaVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const disableMFAMutation = useMutation({
    mutationFn: ({ token, backupCode }: { token?: string; backupCode?: string }) => 
      apiRequest('POST', '/api/auth/mfa/disable', { token, backupCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "MFA Disabled",
        description: "Multi-factor authentication has been disabled.",
      });
      setMfaVerificationCode('');
      setBackupCode('');
    },
    onError: () => {
      toast({
        title: "Disable Failed",
        description: "Failed to disable MFA. Please check your verification code.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mfaEnabled = user?.mfaEnabled;
  const isRoaster = user?.role === 'roaster';
  const isAdmin = user?.role === 'admin';
  const mfaRequired = isRoaster || isAdmin;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Dashboard</h1>
          <p className="text-gray-600">Manage your account security settings and authentication preferences.</p>
        </div>

        {showMFASetup && (
          <div className="mb-8">
            <MFASetup onComplete={() => setShowMFASetup(false)} />
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Security Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {mfaEnabled ? (
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-orange-500" />
                )}
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Two-Factor Authentication</span>
                <Badge variant={mfaEnabled ? "default" : "destructive"}>
                  {mfaEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Type</span>
                <Badge variant="outline">
                  {user?.role === 'admin' ? 'Administrator' : 
                   user?.role === 'roaster' ? 'Roaster' : 'Customer'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Security Score</span>
                <Badge variant={mfaEnabled ? "default" : "secondary"}>
                  {mfaEnabled ? "Strong" : "Moderate"}
                </Badge>
              </div>

              {mfaRequired && !mfaEnabled && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication is required for {user?.role} accounts.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Email</span>
                <p className="text-sm">{user?.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">User ID</span>
                <p className="text-sm font-mono">{user?.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Account Created</span>
                <p className="text-sm">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MFA Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!mfaEnabled ? (
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Enhance your account security by enabling two-factor authentication. 
                    This adds an extra layer of protection to your account.
                    {mfaRequired && " This is required for your account type."}
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={() => setShowMFASetup(true)}
                  className="w-full sm:w-auto"
                >
                  Enable Two-Factor Authentication
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication is enabled and protecting your account.
                  </AlertDescription>
                </Alert>
                
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">Disable Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">
                    To disable MFA, please enter a verification code from your authenticator app or use a backup code.
                  </p>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Verification Code</label>
                      <Input
                        placeholder="6-digit code"
                        value={mfaVerificationCode}
                        onChange={(e) => setMfaVerificationCode(e.target.value)}
                        maxLength={6}
                        className="text-center"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Or Backup Code</label>
                      <Input
                        placeholder="Backup code"
                        value={backupCode}
                        onChange={(e) => setBackupCode(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    onClick={() => disableMFAMutation.mutate({ 
                      token: mfaVerificationCode || undefined, 
                      backupCode: backupCode || undefined 
                    })}
                    disabled={(!mfaVerificationCode && !backupCode) || disableMFAMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {disableMFAMutation.isPending ? 'Disabling...' : 'Disable MFA'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Security Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                {mfaEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                )}
                <div>
                  <h4 className="font-medium">Enable Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">
                    {mfaEnabled 
                      ? "Great! Your account is protected with 2FA." 
                      : "Add an extra layer of security to your account."}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Strong Password Policy</h4>
                  <p className="text-sm text-gray-600">
                    Your account uses secure authentication through Replit.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Secure Session Management</h4>
                  <p className="text-sm text-gray-600">
                    Your sessions are encrypted and automatically expire for security.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}