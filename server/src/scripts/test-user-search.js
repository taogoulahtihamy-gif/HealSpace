const API_URL = process.env.API_URL || "http://localhost:5000/api";

const seed = Date.now();
const marker = `Search${seed}`;

function createUser(suffix) {
  return {
    firstName: marker,
    lastName: suffix,
    username: `usr_${suffix.toLowerCase()}_${seed}`,
    email: `usr_${suffix.toLowerCase()}_${seed}@test.com`,
    password: "password123",
  };
}

const owner = createUser("Owner");
const publicUser = createUser("Public");
const privateUser = createUser("Private");
const friendsUser = createUser("Friends");
const inactiveUser = createUser("Inactive");

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

async function run() {
  const ownerSession = await register(owner);
  const publicSession = await register(publicUser);
  const privateSession = await register(privateUser);
  const friendsSession = await register(friendsUser);
  const inactiveSession = await register(inactiveUser);

  console.log("✅ User search fixtures created");

  await request("/users/me/privacy", {
    method: "PATCH",
    token: privateSession.accessToken,
    body: {
      visibility: "PRIVATE",
      isPrivate: true,
    },
  });

  await request("/users/me/privacy", {
    method: "PATCH",
    token: friendsSession.accessToken,
    body: {
      visibility: "FRIENDS",
      isPrivate: false,
    },
  });

  await request("/users/me", {
    method: "DELETE",
    token: inactiveSession.accessToken,
    body: {
      password: inactiveUser.password,
    },
  });

  console.log("✅ Search visibility fixtures configured");

  const initialSearch = await request(
    `/users/search?q=${encodeURIComponent(marker)}&page=1&limit=20`,
    {
      token: ownerSession.accessToken,
    },
  );

  const initialItems = initialSearch.data.items;

  if (!initialItems.some((item) => item.id === publicSession.user.id)) {
    throw new Error(
      "Le profil public n'apparaît pas dans la recherche.",
    );
  }

  const forbiddenIds = new Set([
    ownerSession.user.id,
    privateSession.user.id,
    friendsSession.user.id,
    inactiveSession.user.id,
  ]);

  if (initialItems.some((item) => forbiddenIds.has(item.id))) {
    throw new Error(
      "La recherche expose un profil qui doit rester invisible.",
    );
  }

  console.log("✅ Privacy and account status respected");

  const friendshipResult = await request(
    `/friendships/requests/${friendsSession.user.id}`,
    {
      method: "POST",
      token: ownerSession.accessToken,
    },
  );

  await request(
    `/friendships/requests/${friendshipResult.data.id}/accept`,
    {
      method: "PATCH",
      token: friendsSession.accessToken,
    },
  );

  const friendSearch = await request(
    `/users/search?q=${encodeURIComponent(marker)}&page=1&limit=20`,
    {
      token: ownerSession.accessToken,
    },
  );

  const friendItem = friendSearch.data.items.find(
    (item) => item.id === friendsSession.user.id,
  );

  if (!friendItem || friendItem.friendship?.status !== "ACCEPTED") {
    throw new Error(
      "Le profil FRIENDS ou sa relation d'amitié est invalide.",
    );
  }

  console.log(
    "✅ Friends-only profile and friendship metadata returned",
  );

  const exactSearch = await request(
    `/users/search?q=${encodeURIComponent(publicUser.username)}&page=1&limit=20`,
    {
      token: ownerSession.accessToken,
    },
  );

  if (exactSearch.data.items[0]?.id !== publicSession.user.id) {
    throw new Error(
      "Le tri par pertinence ne place pas le username exact en premier.",
    );
  }

  console.log("✅ Relevance ordering validated");

  const paginatedSearch = await request(
    `/users/search?q=${encodeURIComponent(marker)}&page=1&limit=1`,
    {
      token: ownerSession.accessToken,
    },
  );

  if (
    paginatedSearch.data.items.length !== 1 ||
    paginatedSearch.data.pagination.limit !== 1 ||
    paginatedSearch.data.pagination.total < 2
  ) {
    throw new Error("La pagination de recherche est invalide.");
  }

  console.log("✅ User search pagination validated");

  try {
    await request("/users/search?q=a", {
      token: ownerSession.accessToken,
    });
  } catch (error) {
    if (error.status === 400) {
      console.log("✅ Short search rejected");
      console.log("✅ User search test passed");
      return;
    }

    throw error;
  }

  throw new Error("Une recherche trop courte aurait dû être refusée.");
}

run().catch((error) => {
  console.error("❌ User search test failed");
  console.error(error);
  process.exitCode = 1;
});
