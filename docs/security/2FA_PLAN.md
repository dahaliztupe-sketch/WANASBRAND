# Two-Factor Authentication (2FA) Implementation Plan

## Overview
To enhance the security of the WANAS admin panel, we will implement Two-Factor Authentication (2FA). This will require administrators to provide a second form of verification (e.g., a TOTP code from an app like Google Authenticator) before accessing sensitive administrative features.

## Phase 1: Preparation
1. **User Schema Update**: Add `twoFactorSecret` and `twoFactorEnabled` fields to the `users` collection in Firestore.
2. **Library Selection**: Use `otplib` or `speakeasy` for TOTP generation and verification. Use `qrcode` for generating setup QR codes.

## Phase 2: Setup Flow
1. **Enable 2FA UI**: A new section in the admin profile to enable 2FA.
2. **Secret Generation**: Generate a unique TOTP secret for the user.
3. **QR Code Display**: Display a QR code that the user can scan with their authenticator app.
4. **Verification**: Require the user to enter a code from their app to confirm setup.

## Phase 3: Login Flow Integration
1. **Primary Authentication**: User logs in with email/password or Google.
2. **2FA Check**: If 2FA is enabled for the user, redirect them to a 2FA verification page.
3. **Session Update**: Upon successful 2FA verification, update the session JWT with a `twoFactorVerified: true` claim.

## Phase 4: Enforcement
1. **Middleware Check**: Update `middleware.ts` to check for the `twoFactorVerified` claim for `/admin` routes if the user has 2FA enabled.
2. **API Protection**: Ensure all admin API routes verify the `twoFactorVerified` claim.

## Security Considerations
- **Recovery Codes**: Provide users with one-time recovery codes in case they lose access to their authenticator app.
- **Rate Limiting**: Implement strict rate limiting on 2FA verification attempts to prevent brute-force attacks.
- **Session Expiry**: 2FA verification should have a shorter expiry than the primary session if desired, or be required once per session.
