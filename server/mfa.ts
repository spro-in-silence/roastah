import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

export interface MFASetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MFAUser {
  id: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes?: string[];
  lastBackupCodeUsed?: Date;
}

// Generate MFA setup for user
export async function generateMFASetup(userId: string, userEmail: string): Promise<MFASetup> {
  const secret = speakeasy.generateSecret({
    name: `Roastah (${userEmail})`,
    issuer: 'Roastah Marketplace',
    length: 32,
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
  
  // Generate backup codes
  const backupCodes = Array.from({ length: 8 }, () => 
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );

  return {
    secret: secret.base32!,
    qrCodeUrl,
    backupCodes,
  };
}

// Verify MFA token
export function verifyMFAToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 1 step before and after current time
  });
}

// Verify backup code
export async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    if (!user?.backupCodes) return false;

    const codeIndex = user.backupCodes.indexOf(code.toUpperCase());
    if (codeIndex === -1) return false;

    // Remove used backup code
    const updatedCodes = user.backupCodes.filter((_, index) => index !== codeIndex);
    await storage.updateUserMFA(userId, {
      backupCodes: updatedCodes,
      lastBackupCodeUsed: new Date(),
    });

    return true;
  } catch (error) {
    console.error('Backup code verification error:', error);
    return false;
  }
}

// MFA middleware for protected routes
export function requireMFA(req: Request, res: Response, next: NextFunction) {
  const user = req.user as any;
  
  if (!user?.claims?.sub) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if MFA is required for this user type
  const requiresMFA = req.path.includes('/seller/') || 
                     req.path.includes('/admin/') ||
                     req.path.includes('/payment');

  if (!requiresMFA) {
    return next();
  }

  // Check MFA verification in session
  if (!req.session?.mfaVerified) {
    return res.status(403).json({ 
      error: 'MFA verification required',
      requiresMFA: true 
    });
  }

  // Check MFA verification timestamp (expire after 8 hours)
  const mfaTimestamp = req.session.mfaVerifiedAt;
  if (!mfaTimestamp || Date.now() - mfaTimestamp > 8 * 60 * 60 * 1000) {
    req.session.mfaVerified = false;
    delete req.session.mfaVerifiedAt;
    return res.status(403).json({ 
      error: 'MFA verification expired',
      requiresMFA: true 
    });
  }

  next();
}

// Step-up authentication for sensitive operations
export function requireStepUpAuth(req: Request, res: Response, next: NextFunction) {
  const stepUpTimestamp = req.session?.stepUpVerifiedAt;
  
  // Require step-up auth within last 15 minutes for sensitive operations
  if (!stepUpTimestamp || Date.now() - stepUpTimestamp > 15 * 60 * 1000) {
    return res.status(403).json({ 
      error: 'Recent authentication required',
      requiresStepUp: true 
    });
  }

  next();
}

// Check if user has MFA enabled
export async function hasMFAEnabled(userId: string): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    return !!(user?.mfaEnabled && user?.mfaSecret);
  } catch (error) {
    console.error('MFA check error:', error);
    return false;
  }
}

// Security audit logging
export function logSecurityEvent(
  userId: string | undefined,
  event: string,
  details: Record<string, any>,
  req: Request
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId: userId || 'anonymous',
    event,
    details,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.path,
    method: req.method,
  };

  // In production, this would go to a proper logging service
  console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
  
  // Store critical events in database for audit trail
  if (['login_failed', 'mfa_failed', 'suspicious_activity'].includes(event)) {
    // TODO: Store in audit log table
  }
}