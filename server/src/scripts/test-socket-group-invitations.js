import "dotenv/config";
import { io } from "socket.io-client";

const API_URL = process.env.API_URL || "http://localhost:5000/api";

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:5000";

const seed = Date.now();

const ownerUser = {
  firstName: "Socket",
  lastName: "GroupOwner",
  username: `socket_group_owner_${seed}`,
  email: `socket_group_owner_${seed}@test.com`,
  password: "password123",
};

const inviteeUser = {
  firstName: "Socket",
  lastName: "GroupInvitee",
  username: `socket_group_invitee_${seed}`,
  email: `socket_group_invitee_${seed}@test.com`,
  password: "password123",
};

async function request(
  path,
  { token = null, method = "GET", body } = {},
) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    ...(body !== undefined && {
      body: JSON.stringify(body),
    }),
  });

  const text = await response.text();

  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    throw {
      status: response.status,
      body: payload,
    };
  }

  return payload;
}

async function register(user) {
  const result = await request("/auth/register", {
    method: "POST",
    body: user,
  });

  return result.data;
}

function waitForEvent(socket, eventName, predicate, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off(eventName, handler);

      reject(new Error(`Timeout en attente de ${eventName}.`));
    }, timeoutMs);

    function handler(payload) {
      if (predicate && !predicate(payload)) {
        return;
      }

      clearTimeout(timeout);
      socket.off(eventName, handler);
      resolve(payload);
    }

    socket.on(eventName, handler);
  });
}

function connectSocket(accessToken) {
  const socket = io(SOCKET_URL, {
    auth: {
      token: accessToken,
    },
    transports: ["websocket", "polling"],
    reconnection: false,
    autoConnect: false,
    timeout: 10000,
  });

  const ready = waitForEvent(socket, "connection:ready");

  socket.connect();

  return {
    socket,
    ready,
  };
}

async function run() {
  let owner = null;
  let invitee = null;
  let ownerSocket = null;
  let inviteeSocket = null;
  let groupId = null;

  try {
    owner = await register(ownerUser);
    invitee = await register(inviteeUser);

    const ownerConnection = connectSocket(owner.accessToken);

    ownerSocket = ownerConnection.socket;

    const inviteeConnection = connectSocket(invitee.accessToken);

    inviteeSocket = inviteeConnection.socket;

    await Promise.all([ownerConnection.ready, inviteeConnection.ready]);

    console.log("✅ Group invitation sockets authenticated");

    const group = await request("/groups", {
      method: "POST",
      token: owner.accessToken,
      body: {
        name: `Socket Private Group ${seed}`,
        description: "Groupe privé Socket.IO.",
        visibility: "PRIVATE",
      },
    });

    groupId = group.data.id;

    const invitationNotification = waitForEvent(
      inviteeSocket,
      "notification:new",
      (payload) =>
        payload?.type === "GROUP_INVITATION" &&
        payload?.data?.groupId === groupId,
    );

    const invitationResult = await request(
      `/groups/${groupId}/invitations`,
      {
        method: "POST",
        token: owner.accessToken,
        body: {
          inviteeId: invitee.user.id,
        },
      },
    );

    const invitation = await invitationNotification;

    if (invitation.data?.invitationId !== invitationResult.data.id) {
      throw new Error(
        "La notification temps réel d'invitation est invalide.",
      );
    }

    console.log("✅ Realtime group invitation received");

    const acceptanceNotification = waitForEvent(
      ownerSocket,
      "notification:new",
      (payload) =>
        payload?.type === "GROUP_INVITATION_ACCEPTED" &&
        payload?.data?.invitationId === invitationResult.data.id,
    );

    await request(
      `/groups/invitations/${invitationResult.data.id}/accept`,
      {
        method: "PATCH",
        token: invitee.accessToken,
      },
    );

    const accepted = await acceptanceNotification;

    if (
      accepted.actor?.id !== invitee.user.id ||
      accepted.data?.groupId !== groupId
    ) {
      throw new Error(
        "La notification temps réel d'acceptation est invalide.",
      );
    }

    console.log("✅ Realtime invitation acceptance received");

    console.log("✅ Group invitation Socket.IO test passed");
  } finally {
    ownerSocket?.disconnect();
    inviteeSocket?.disconnect();

    if (groupId && owner) {
      await Promise.allSettled([
        request(`/groups/${groupId}`, {
          method: "DELETE",
          token: owner.accessToken,
        }),
      ]);
    }
  }
}

run().catch((error) => {
  console.error("❌ Group invitation Socket.IO test failed");
  console.error(error);
  process.exitCode = 1;
});
