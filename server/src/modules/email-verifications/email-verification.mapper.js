export function toEmailVerificationEmailPayload({
  user,
  verificationUrl,
  expiresInMinutes,
}) {
  return {
    to: user.email,
    firstName: user.firstName,
    verificationUrl,
    expiresInMinutes,
  };
}

export function toEmailVerificationRequestResult(user) {
  return {
    emailVerified: Boolean(user?.emailVerified),
  };
}

export function toEmailVerificationResult(user) {
  return {
    emailVerified: true,
    isVerified: true,
    emailVerifiedAt: user.emailVerifiedAt,
  };
}
