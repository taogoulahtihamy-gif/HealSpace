import "dotenv/config";
import { io } from "socket.io-client";

const API_URL = process.env.API_URL || "http://localhost:5000/api";

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:5000";

const seed = Date.now();

const firstUser = {
  firstName: "Realtime",
  lastName: "Sender",
  username: `realtime_sender_${seed}`,
  email: `realtime_sender_${seed}@test.com`,
  password: "password123",
};

const secondUser = {
  firstName: "Realtime",
  lastName: "Receiver",
  username: `realtime_receiver_${seed}`,
  email: `realtime_receiver_${seed}@test.com`,
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
  const result = await request("/auth/register", {
    method: "POST",
    body: user,
  });

  return result.data;
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

  const readyPromise = waitForEvent(socket, "connection:ready");

  socket.connect();

  return {
    socket,
    readyPromise,
  };
}

function emitWithAck(socket, eventName, payload, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout ACK pour ${eventName}.`));
    }, timeoutMs);

    socket.emit(eventName, payload, (response) => {
      clearTimeout(timeout);

      if (!response?.success) {
        reject(
          new Error(
            response?.error?.message || `Échec de ${eventName}.`,
          ),
        );
        return;
      }

      resolve(response.data);
    });
  });
}

async function run() {
  let senderSocket = null;
  let receiverSocket = null;
  let senderSession = null;
  let receiverSession = null;
  let conversationId = null;
  let messageId = null;

  try {
    senderSession = await register(firstUser);

    receiverSession = await register(secondUser);

    const conversationResult = await request("/conversations/direct", {
      method: "POST",
      token: senderSession.accessToken,
      body: {
        participantId: receiverSession.user.id,
      },
    });

    conversationId = conversationResult.data.id;

    const senderConnection = connectSocket(senderSession.accessToken);

    senderSocket = senderConnection.socket;

    const receiverConnection = connectSocket(
      receiverSession.accessToken,
    );

    receiverSocket = receiverConnection.socket;

    await Promise.all([
      senderConnection.readyPromise,
      receiverConnection.readyPromise,
    ]);

    console.log("✅ Realtime sockets authenticated");

    await Promise.all([
      emitWithAck(senderSocket, "conversation:join", {
        conversationId,
      }),
      emitWithAck(receiverSocket, "conversation:join", {
        conversationId,
      }),
    ]);

    console.log("✅ Conversation room joined");

    const typingPromise = waitForEvent(
      receiverSocket,
      "conversation:typing",
    );

    await emitWithAck(senderSocket, "conversation:typing", {
      conversationId,
    });

    const typingPayload = await typingPromise;

    if (
      typingPayload.conversationId !== conversationId ||
      typingPayload.user?.id !== senderSession.user.id
    ) {
      throw new Error("L'événement de saisie est invalide.");
    }

    console.log("✅ Typing event received");

    const stopTypingPromise = waitForEvent(
      receiverSocket,
      "conversation:stop-typing",
    );

    await emitWithAck(senderSocket, "conversation:stop-typing", {
      conversationId,
    });

    const stopTypingPayload = await stopTypingPromise;

    if (stopTypingPayload.conversationId !== conversationId) {
      throw new Error("L'arrêt de saisie est invalide.");
    }

    console.log("✅ Stop typing event received");

    const newMessagePromise = waitForEvent(
      receiverSocket,
      "message:new",
    );

    const createResult = await request(
      `/messages/conversations/${conversationId}`,
      {
        method: "POST",
        token: senderSession.accessToken,
        body: {
          content: "Message Socket.IO initial.",
        },
      },
    );

    messageId = createResult.data.id;

    const newMessage = await newMessagePromise;

    if (
      newMessage.id !== messageId ||
      newMessage.conversationId !== conversationId ||
      newMessage.senderId !== senderSession.user.id
    ) {
      throw new Error("L'événement message:new est invalide.");
    }

    console.log("✅ New message event received");

    const updatedMessagePromise = waitForEvent(
      receiverSocket,
      "message:updated",
    );

    await request(`/messages/${messageId}`, {
      method: "PATCH",
      token: senderSession.accessToken,
      body: {
        content: "Message Socket.IO modifié.",
      },
    });

    const updatedMessage = await updatedMessagePromise;

    if (
      updatedMessage.id !== messageId ||
      updatedMessage.content !== "Message Socket.IO modifié."
    ) {
      throw new Error("L'événement message:updated est invalide.");
    }

    console.log("✅ Updated message event received");

    const readMessagePromise = waitForEvent(
      senderSocket,
      "message:read",
    );

    await request(`/messages/${messageId}/read`, {
      method: "PATCH",
      token: receiverSession.accessToken,
    });

    const readPayload = await readMessagePromise;

    if (
      readPayload.message?.id !== messageId ||
      readPayload.readById !== receiverSession.user.id ||
      readPayload.message?.isRead !== true
    ) {
      throw new Error("L'événement message:read est invalide.");
    }

    console.log("✅ Read receipt event received");

    const deletedMessagePromise = waitForEvent(
      receiverSocket,
      "message:deleted",
    );

    await request(`/messages/${messageId}`, {
      method: "DELETE",
      token: senderSession.accessToken,
    });

    const deletedPayload = await deletedMessagePromise;

    if (
      deletedPayload.messageId !== messageId ||
      deletedPayload.conversationId !== conversationId
    ) {
      throw new Error("L'événement message:deleted est invalide.");
    }

    messageId = null;

    console.log("✅ Deleted message event received");

    await Promise.all([
      emitWithAck(senderSocket, "conversation:leave", {
        conversationId,
      }),
      emitWithAck(receiverSocket, "conversation:leave", {
        conversationId,
      }),
    ]);

    console.log("✅ Realtime messages test passed");
  } finally {
    senderSocket?.disconnect();
    receiverSocket?.disconnect();

    if (messageId && senderSession) {
      try {
        await request(`/messages/${messageId}`, {
          method: "DELETE",
          token: senderSession.accessToken,
        });
      } catch {
        // Nettoyage secondaire.
      }
    }

    if (conversationId && senderSession && receiverSession) {
      await Promise.allSettled([
        request(`/conversations/${conversationId}`, {
          method: "DELETE",
          token: senderSession.accessToken,
        }),
        request(`/conversations/${conversationId}`, {
          method: "DELETE",
          token: receiverSession.accessToken,
        }),
      ]);
    }
  }
}

run().catch((error) => {
  console.error("❌ Realtime messages test failed");

  console.error(error);

  process.exitCode = 1;
});
