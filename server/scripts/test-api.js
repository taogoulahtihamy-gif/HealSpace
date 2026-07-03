const API_URL = "http://localhost:5000/api";

const testUser = {
  firstName: "Ezekiel",
  lastName: "Test",
  username: "ezekiel_auto_test",
  email: "ezekiel_auto_test@test.com",
  password: "password123",
};

let accessToken = null;
let refreshToken = null;
let postId = null;
let commentId = null;

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logError(message, error) {
  console.error(`❌ ${message}`);
  console.error(error);
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();

  let body = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    throw {
      status: response.status,
      body,
    };
  }

  return body;
}

async function registerOrLogin() {
  try {
    const result = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(testUser),
    });

    accessToken = result.data.accessToken;
    refreshToken = result.data.refreshToken;

    logSuccess("Register");
  } catch (error) {
    if (error.status !== 409) {
      throw error;
    }

    const result = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    accessToken = result.data.accessToken;
    refreshToken = result.data.refreshToken;

    logSuccess("Login existing user");
  }
}

async function testCreatePost() {
  const result = await request("/posts", {
    method: "POST",
    body: JSON.stringify({
      content: "Post automatique pour tester HealSpace.",
      mood: "CALM",
      intention: "BE_LISTENED",
      visibility: "PUBLIC",
      isAnonymous: false,
    }),
  });

  postId = result.data.id;

  logSuccess("Create Post");
}

async function testGetPosts() {
  await request("/posts", { method: "GET" });
  logSuccess("Get Posts");
}

async function testGetPostById() {
  await request(`/posts/${postId}`, { method: "GET" });
  logSuccess("Get Post By Id");
}

async function testUpdatePost() {
  await request(`/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify({
      content: "Post automatique mis à jour.",
      mood: "MOTIVATED",
      intention: "BE_LISTENED",
      visibility: "PUBLIC",
      isAnonymous: false,
    }),
  });

  logSuccess("Update Post");
}

async function testAiAnalyzeMood() {
  await request("/ai/analyze-mood", {
    method: "POST",
    body: JSON.stringify({
      text: "Je suis fatigué mais je veux continuer à avancer.",
    }),
  });

  logSuccess("AI Analyze Mood");
}

async function testAiSupportMessage() {
  await request("/ai/support-message", {
    method: "POST",
    body: JSON.stringify({
      mood: "EXHAUSTED",
      context: "Je travaille sur mon projet et je suis fatigué.",
    }),
  });

  logSuccess("AI Support Message");
}

async function testCreateReaction() {
  await request(`/posts/${postId}/reactions`, {
    method: "POST",
    body: JSON.stringify({
      type: "SUPPORT",
    }),
  });

  logSuccess("Create Reaction");
}

async function testUpdateReaction() {
  await request(`/posts/${postId}/reactions`, {
    method: "POST",
    body: JSON.stringify({
      type: "LOVE",
    }),
  });

  logSuccess("Update Reaction");
}

async function testGetReactions() {
  await request(`/posts/${postId}/reactions`, { method: "GET" });
  logSuccess("Get Reactions");
}

async function testGetReactionSummary() {
  await request(`/posts/${postId}/reactions/summary`, { method: "GET" });
  logSuccess("Get Reaction Summary");
}

async function testDeleteReaction() {
  await request(`/posts/${postId}/reactions`, { method: "DELETE" });
  logSuccess("Delete Reaction");
}

async function testCreateComment() {
  const result = await request(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({
      content: "Commentaire automatique de soutien.",
    }),
  });

  commentId = result.data.id;

  logSuccess("Create Comment");
}

async function testGetComments() {
  await request(`/posts/${postId}/comments`, { method: "GET" });
  logSuccess("Get Comments");
}

async function testUpdateComment() {
  await request(`/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({
      content: "Commentaire automatique mis à jour.",
    }),
  });

  logSuccess("Update Comment");
}

async function testDeleteComment() {
  await request(`/comments/${commentId}`, { method: "DELETE" });
  logSuccess("Delete Comment");
}

async function testDeletePost() {
  await request(`/posts/${postId}`, { method: "DELETE" });
  logSuccess("Delete Post");
}

async function runTests() {
  console.log("\n=========================");
  console.log("HealSpace API Tests");
  console.log("=========================\n");

  try {
    await registerOrLogin();

    await testCreatePost();
    await testGetPosts();
    await testGetPostById();
    await testUpdatePost();

    await testAiAnalyzeMood();
    await testAiSupportMessage();

    await testCreateReaction();
    await testUpdateReaction();
    await testGetReactions();
    await testGetReactionSummary();
    await testDeleteReaction();

    await testCreateComment();
    await testGetComments();
    await testUpdateComment();
    await testDeleteComment();

    await testDeletePost();

    console.log("\n=========================");
    console.log("✅ All API tests passed");
    console.log("=========================\n");
  } catch (error) {
    logError("API test failed", error);
    process.exit(1);
  }
}

runTests();
