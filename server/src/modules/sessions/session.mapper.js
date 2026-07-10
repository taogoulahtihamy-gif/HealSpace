function trimHeader(value, maxLength) {
  if (!value) {
    return null;
  }

  return String(value).trim().slice(0, maxLength) || null;
}

function getForwardedIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0] || null;
  }

  if (forwardedFor) {
    return String(forwardedFor).split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
}

function detectBrowser(userAgent = "") {
  if (/Edg\//i.test(userAgent)) {
    return "Microsoft Edge";
  }

  if (/Firefox\//i.test(userAgent)) {
    return "Firefox";
  }

  if (/Chrome\//i.test(userAgent)) {
    return "Chrome";
  }

  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) {
    return "Safari";
  }

  return "Navigateur inconnu";
}

function detectOperatingSystem(userAgent = "") {
  if (/Windows/i.test(userAgent)) {
    return "Windows";
  }

  if (/Android/i.test(userAgent)) {
    return "Android";
  }

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "iOS";
  }

  if (/Mac OS X|Macintosh/i.test(userAgent)) {
    return "macOS";
  }

  if (/Linux/i.test(userAgent)) {
    return "Linux";
  }

  return "Système inconnu";
}

function detectDeviceType(userAgent = "") {
  if (/iPad|Tablet/i.test(userAgent)) {
    return "TABLET";
  }

  if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) {
    return "MOBILE";
  }

  return "DESKTOP";
}

export function buildSessionContextFromRequest(req) {
  return {
    deviceId: trimHeader(req.headers["x-device-id"], 128),
    userAgent: trimHeader(req.headers["user-agent"], 512),
    ipAddress: trimHeader(getForwardedIp(req), 128),
  };
}

export function toPublicIssuedSession(session) {
  return {
    id: session.id,
    deviceId: session.deviceId,
    createdAt: session.createdAt,
    lastUsedAt: session.lastUsedAt,
    expiresAt: session.expiresAt,
  };
}

export function toSessionResponse(session, currentSessionId) {
  const userAgent = session.userAgent || "";

  return {
    id: session.id,
    current: session.id === currentSessionId,
    deviceId: session.deviceId,
    device: {
      type: detectDeviceType(userAgent),
      browser: detectBrowser(userAgent),
      operatingSystem: detectOperatingSystem(userAgent),
    },
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    createdAt: session.createdAt,
    lastUsedAt: session.lastUsedAt,
    expiresAt: session.expiresAt,
  };
}

export function toSessionListResponse(sessions, currentSessionId) {
  const items = sessions.map((session) =>
    toSessionResponse(session, currentSessionId),
  );

  items.sort((left, right) => {
    if (left.current) {
      return -1;
    }

    if (right.current) {
      return 1;
    }

    const leftDate = new Date(left.lastUsedAt || left.createdAt);
    const rightDate = new Date(right.lastUsedAt || right.createdAt);

    return rightDate - leftDate;
  });

  return {
    items,
    total: items.length,
  };
}
