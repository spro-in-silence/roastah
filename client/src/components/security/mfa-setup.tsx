import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, Copy, Eye, EyeOff } from "lucide-react";

interface MFASetupProps {
  onComplete: () => void;
}

export function MFASetup({ onComplete }: MFASetupProps) {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const setupMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/mfa/setup'),
    onSuccess: (data) => {
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep('verify');
      toast({
        title: "MFA Setup Initiated",
        description: "Scan the QR code with your authenticator app and enter the verification code.",
      });
    },
    onError: () => {
      toast({
        title: "Setup Failed",
        description: "Failed to initialize MFA setup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (token: string) => apiRequest('POST', '/api/auth/mfa/verify-setup', { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "MFA Enabled",
        description: "Multi-factor authentication has been successfully enabled.",
      });
      onComplete();
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard.",
    });
  };

  if (step === 'setup') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enable Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Two-factor authentication adds an extra layer of security to your account. 
              You'll need an authenticator app like Google Authenticator or Authy.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => setupMutation.mutate()} 
            disabled={setupMutation.isPending}
            className="w-full"
          >
            {setupMutation.isPending ? 'Setting up...' : 'Start Setup'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Complete MFA Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">1. Scan QR Code</h3>
            {qrCodeUrl && (
              <div className="flex justify-center p-4 bg-white rounded-lg border">
                <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">2. Or Enter Secret Manually</h3>
            <div className="flex items-center gap-2">
              <Input
                type={showSecret ? "text" : "password"}
                value={secret}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(secret)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">3. Save Backup Codes</h3>
            <Alert className="mb-2">
              <AlertDescription>
                Save these backup codes in a secure location. You can use them to access your account if you lose your device.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBackupCodes(!showBackupCodes)}
                className="w-full"
              >
                {showBackupCodes ? 'Hide' : 'Show'} Backup Codes
              </Button>
              {showBackupCodes && (
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(backupCodes.join('\n'))}
                    className="w-full mt-2"
                  >
                    Copy All Codes
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">4. Enter Verification Code</h3>
            <div className="space-y-3">
              <Input
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-wider"
              />
              <Button
                onClick={() => verifyMutation.mutate(verificationCode)}
                disabled={verificationCode.length !== 6 || verifyMutation.isPending}
                className="w-full"
              >
                {verifyMutation.isPending ? 'Verifying...' : 'Enable MFA'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}