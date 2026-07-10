export function toPasswordResetEmailPayload({
  user,
  resetUrl,
  expiresInMinutes,
}) {
  return {
    to: user.email,
    firstName: user.firstName,
    resetUrl,
    expiresInMinutes,
  };
}

export function toPasswordResetResult() {
  return null;
}
