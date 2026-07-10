import "dotenv/config";
import { io } from "socket.io-client";

const API_URL = process.env.API_URL || "http://localhost:5000/api";

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:5000";

const seed = Date.now();

const receiver = {
  firstName: "Socket",
  lastName: "Receiver",
  username: `socket_receiver_${seed}`,
  email: `socket_receiver_${seed}@test.com`,
  password: "password123",
};

const actor = {
  firstName: "Socket",
  lastName: "Actor",
  username: `socket_actor_${seed}`,
  email: `socket_actor_${seed}@test.com`,
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
    ...(body && {
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
  try {
    const result = await request("/auth/register", {
      method: "POST",
      body: user,
    });

    return result.data;
  } catch (error) {
    if (error.status !== 409) {
      throw error;
    }

    const result = await request("/auth/login", {
      method: "POST",
      body: {
        email: user.email,
        password: user.password,
      },
    });

    return result.data;
  }
}

function waitForEvent(socket, eventName, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off(eventName, handler);

      reject(new Error(`Timeout en attente de ${eventName}.`));
    }, timeoutMs);

    function handler(payload) {
      clearTimeout(timeout);
      socket.off(eventName, handler);
      resolve(payload);
    }

    socket.on(eventName, handler);
  });
}

async function run() {
  let socket = null;
  let postId = null;

  try {
    const receiverSession = await register(receiver);

    const actorSession = await register(actor);

    socket = io(SOCKET_URL, {
      auth: {
        token: receiverSession.accessToken,
      },
      transports: ["websocket", "polling"],
      reconnection: false,
      timeout: 10000,
    });

    const connectionReady = await waitForEvent(
      socket,
      "connection:ready",
    );

    if (connectionReady.user?.id !== receiverSession.user.id) {
      throw new Error(
        "Le socket authentifié ne correspond pas à l'utilisateur attendu.",
      );
    }

    console.log("✅ Socket authenticated");

    const postResult = await request("/posts", {
      method: "POST",
      token: receiverSession.accessToken,
      body: {
        content: "Post pour tester les notifications Socket.IO.",
        mood: "CALM",
        intention: "BE_LISTENED",
        visibility: "PUBLIC",
        isAnonymous: false,
      },
    });

    postId = postResult.data.id;

    const notificationPromise = waitForEvent(
      socket,
      "notification:new",
    );

    const unreadCountPromise = waitForEvent(
      socket,
      "notification:unread-count",
    );

    await request(`/posts/${postId}/reactions`, {
      method: "POST",
      token: actorSession.accessToken,
      body: {
        type: "SUPPORT",
      },
    });

    const notification = await notificationPromise;

    const unreadCount = await unreadCountPromise;

    if (
      notification.type !== "REACTION" ||
      notification.data?.postId !== postId ||
      notification.actor?.id !== actorSession.user.id
    ) {
      throw new Error("La notification Socket.IO reçue est invalide.");
    }

    if (
      typeof unreadCount.count !== "number" ||
      unreadCount.count < 1
    ) {
      throw new Error("Le compteur Socket.IO est invalide.");
    }

    console.log("✅ Realtime notification received");

    console.log("✅ Realtime unread count received");

    await request(`/posts/${postId}/reactions`, {
      method: "DELETE",
      token: actorSession.accessToken,
    });

    await request(`/posts/${postId}`, {
      method: "DELETE",
      token: receiverSession.accessToken,
    });

    postId = null;

    console.log("✅ Socket notification test passed");
  } finally {
    socket?.disconnect();

    if (postId) {
      console.log("Nettoyage manuel requis pour le post :", postId);
    }
  }
}

run().catch((error) => {
  console.error("❌ Socket notification test failed");

  console.error(error);

  process.exitCode = 1;
});
