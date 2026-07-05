const API_URL = "http://localhost:5000/api";

const testUser = {
  firstName: "Ezekiel",
  lastName: "Test",
  username: "ezekiel_auto_test",
  email: "ezekiel_auto_test@test.com",
  password: "password123",
};

const secondUser = {
  firstName: "Ami",
  lastName: "Test",
  username: "healspace_friend_auto_test",
  email: "healspace_friend_auto_test@test.com",
  password: "password123",
};

let accessToken = null;
let secondUserId = null;
let postId = null;
let commentId = null;
let conversationId = null;
let messageId = null;

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

async function registerOrLoginUser(user) {
  try {
    const result = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(user),
    });

    return result.data;
  } catch (error) {
    if (error.status !== 409) {
      throw error;
    }

    const result = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      }),
    });

    return result.data;
  }
}

async function registerOrLogin() {
  const result = await registerOrLoginUser(testUser);
  accessToken = result.accessToken;
  logSuccess("Login existing user");

  const secondResult = await registerOrLoginUser(secondUser);
  secondUserId = secondResult.user.id;
  logSuccess("Prepare second user");
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
      content: "Je suis fatigué mais je veux continuer à avancer.",
    }),
  });

  logSuccess("AI Analyze Mood");
}

async function testAiSupportMessage() {
  await request("/ai/support-message", {
    method: "POST",
    body: JSON.stringify({
      content: "Je travaille sur mon projet et je suis fatigué.",
      mood: "EXHAUSTED",
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

async function testCreateDirectConversation() {
  const result = await request("/conversations/direct", {
    method: "POST",
    body: JSON.stringify({
      participantId: secondUserId,
    }),
  });

  conversationId = result.data.id;
  logSuccess("Create Direct Conversation");
}

async function testGetConversations() {
  await request("/conversations", { method: "GET" });
  logSuccess("Get Conversations");
}

async function testGetConversationById() {
  await request(`/conversations/${conversationId}`, { method: "GET" });
  logSuccess("Get Conversation By Id");
}

async function testCreateMessage() {
  const result = await request(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: "Message automatique dans une conversation.",
    }),
  });

  messageId = result.data.id;
  logSuccess("Create Message");
}

async function testGetMessages() {
  await request(`/conversations/${conversationId}/messages`, {
    method: "GET",
  });

  logSuccess("Get Messages");
}

async function testUpdateMessage() {
  await request(`/messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({
      content: "Message automatique mis à jour.",
    }),
  });

  logSuccess("Update Message");
}

async function testMarkMessageAsRead() {
  await request(`/messages/${messageId}/read`, {
    method: "PATCH",
  });

  logSuccess("Mark Message As Read");
}

async function testDeleteMessage() {
  await request(`/messages/${messageId}`, {
    method: "DELETE",
  });

  logSuccess("Delete Message");
}

async function testLeaveConversation() {
  await request(`/conversations/${conversationId}`, {
    method: "DELETE",
  });

  logSuccess("Leave Conversation");
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

    await testCreateDirectConversation();
    await testGetConversations();
    await testGetConversationById();

    await testCreateMessage();
    await testGetMessages();
    await testUpdateMessage();
    await testMarkMessageAsRead();
    await testDeleteMessage();

    await testLeaveConversation();

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
