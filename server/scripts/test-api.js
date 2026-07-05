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
let secondAccessToken = null;

let secondUserId = null;
let postId = null;
let commentId = null;
let conversationId = null;
let messageId = null;
let mediaId = null;

let groupId = null;
let groupMemberId = null;
let journalEntryId = null;

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logError(message, error) {
  console.error(`❌ ${message}`);
  console.error(error);
}

async function request(path, options = {}) {
  const {
    token = accessToken,
    headers = {},
    ...fetchOptions
  } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...headers,
    },
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
      token: null,
      body: JSON.stringify(user),
    });

    return result.data;
  } catch (error) {
    if (error.status !== 409) {
      throw error;
    }

    const result = await request("/auth/login", {
      method: "POST",
      token: null,
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

  secondAccessToken = secondResult.accessToken;
  secondUserId = secondResult.user.id;

  logSuccess("Prepare second user");
}

/*
|--------------------------------------------------------------------------
| Posts
|--------------------------------------------------------------------------
*/

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
  await request("/posts", {
    method: "GET",
  });

  logSuccess("Get Posts");
}

async function testGetPostById() {
  await request(`/posts/${postId}`, {
    method: "GET",
  });

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

/*
|--------------------------------------------------------------------------
| AI
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Reactions
|--------------------------------------------------------------------------
*/

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
  await request(`/posts/${postId}/reactions`, {
    method: "GET",
  });

  logSuccess("Get Reactions");
}

async function testGetReactionSummary() {
  await request(`/posts/${postId}/reactions/summary`, {
    method: "GET",
  });

  logSuccess("Get Reaction Summary");
}

async function testDeleteReaction() {
  await request(`/posts/${postId}/reactions`, {
    method: "DELETE",
  });

  logSuccess("Delete Reaction");
}

/*
|--------------------------------------------------------------------------
| Conversations
|--------------------------------------------------------------------------
*/

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
  await request("/conversations", {
    method: "GET",
  });

  logSuccess("Get Conversations");
}

async function testGetConversationById() {
  await request(`/conversations/${conversationId}`, {
    method: "GET",
  });

  logSuccess("Get Conversation By Id");
}

/*
|--------------------------------------------------------------------------
| Messages
|--------------------------------------------------------------------------
*/

async function testCreateMessage() {
  const result = await request(
    `/messages/conversations/${conversationId}`,
    {
      method: "POST",
      body: JSON.stringify({
        content: "Message automatique dans une conversation.",
      }),
    },
  );

  messageId = result.data.id;

  logSuccess("Create Message");
}

async function testGetMessages() {
  await request(`/messages/conversations/${conversationId}`, {
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

/*
|--------------------------------------------------------------------------
| Media
|--------------------------------------------------------------------------
*/

async function testCreateMedia() {
  const result = await request("/media", {
    method: "POST",
    body: JSON.stringify({
      filename: "healspace-test-image.png",
      originalName: "test-image.png",
      mimeType: "image/png",
      size: 2048,
      url: "https://example.com/uploads/healspace-test-image.png",
      postId,
    }),
  });

  mediaId = result.data.id;

  logSuccess("Create Media");
}

async function testGetMediaList() {
  await request("/media", {
    method: "GET",
  });

  logSuccess("Get Media List");
}

async function testGetMediaById() {
  await request(`/media/${mediaId}`, {
    method: "GET",
  });

  logSuccess("Get Media By Id");
}

async function testDeleteMedia() {
  await request(`/media/${mediaId}`, {
    method: "DELETE",
  });

  logSuccess("Delete Media");
}

/*
|--------------------------------------------------------------------------
| Groups
|--------------------------------------------------------------------------
*/

async function testCreateGroup() {
  const result = await request("/groups", {
    method: "POST",
    body: JSON.stringify({
      name: `HealSpace Test Group ${Date.now()}`,
      description: "Groupe créé automatiquement par test-api.js.",
      visibility: "PUBLIC",
    }),
  });

  groupId = result.data.id;

  if (!groupId) {
    throw new Error("La création du groupe n'a retourné aucun identifiant.");
  }

  logSuccess("Create Group");
}

async function testGetGroups() {
  await request("/groups", {
    method: "GET",
  });

  logSuccess("Get Groups");
}

async function testSearchGroups() {
  await request("/groups?search=HealSpace&page=1&limit=10", {
    method: "GET",
  });

  logSuccess("Search Groups");
}

async function testGetMyGroups() {
  await request("/groups/mine", {
    method: "GET",
  });

  logSuccess("Get My Groups");
}

async function testGetGroupById() {
  await request(`/groups/${groupId}`, {
    method: "GET",
  });

  logSuccess("Get Group By Id");
}

async function testUpdateGroup() {
  await request(`/groups/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify({
      description:
        "Description du groupe modifiée automatiquement par test-api.js.",
    }),
  });

  logSuccess("Update Group");
}

async function testGetGroupMembers() {
  await request(`/groups/${groupId}/members`, {
    method: "GET",
  });

  logSuccess("Get Group Members");
}

async function testSecondUserJoinGroup() {
  const result = await request(`/groups/${groupId}/join`, {
    method: "POST",
    token: secondAccessToken,
  });

  groupMemberId = result.data.id;

  if (!groupMemberId) {
    throw new Error(
      "L'ajout du deuxième utilisateur n'a retourné aucun memberId.",
    );
  }

  logSuccess("Second User Join Group");
}

async function testSecondUserGetGroup() {
  await request(`/groups/${groupId}`, {
    method: "GET",
    token: secondAccessToken,
  });

  logSuccess("Second User Get Group");
}

async function testSecondUserGetMyGroups() {
  await request("/groups/mine", {
    method: "GET",
    token: secondAccessToken,
  });

  logSuccess("Second User Get My Groups");
}

async function testUpdateGroupMemberRole() {
  await request(
    `/groups/${groupId}/members/${groupMemberId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({
        role: "ADMIN",
      }),
    },
  );

  logSuccess("Update Group Member Role To Admin");
}

async function testRestoreGroupMemberRole() {
  await request(
    `/groups/${groupId}/members/${groupMemberId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({
        role: "MEMBER",
      }),
    },
  );

  logSuccess("Restore Group Member Role");
}

async function testRemoveGroupMember() {
  await request(
    `/groups/${groupId}/members/${groupMemberId}`,
    {
      method: "DELETE",
    },
  );

  groupMemberId = null;

  logSuccess("Remove Group Member");
}

async function testSecondUserRejoinGroup() {
  const result = await request(`/groups/${groupId}/join`, {
    method: "POST",
    token: secondAccessToken,
  });

  groupMemberId = result.data.id;

  if (!groupMemberId) {
    throw new Error(
      "Le retour du deuxième utilisateur n'a retourné aucun memberId.",
    );
  }

  logSuccess("Second User Rejoin Group");
}

async function testSecondUserLeaveGroup() {
  await request(`/groups/${groupId}/leave`, {
    method: "DELETE",
    token: secondAccessToken,
  });

  groupMemberId = null;

  logSuccess("Second User Leave Group");
}

async function testDeleteGroup() {
  await request(`/groups/${groupId}`, {
    method: "DELETE",
  });

  groupId = null;

  logSuccess("Delete Group");
}


/*
|--------------------------------------------------------------------------
| Journal
|--------------------------------------------------------------------------
*/

async function testCreateJournalEntry() {
  const result = await request("/journal", {
    method: "POST",
    body: JSON.stringify({
      title: "Bilan émotionnel automatique",
      content: "Je progresse sur HealSpace et je reste concentré.",
      mood: "MOTIVATED",
      intensity: 8,
      occurredAt: new Date().toISOString(),
    }),
  });

  journalEntryId = result.data.id;

  if (!journalEntryId) {
    throw new Error(
      "La création de l'entrée de journal n'a retourné aucun identifiant.",
    );
  }

  logSuccess("Create Journal Entry");
}

async function testGetJournalEntries() {
  await request("/journal?page=1&limit=10", {
    method: "GET",
  });

  logSuccess("Get Journal Entries");
}

async function testFilterJournalEntriesByMood() {
  await request("/journal?mood=MOTIVATED&page=1&limit=10", {
    method: "GET",
  });

  logSuccess("Filter Journal Entries By Mood");
}

async function testFilterJournalEntriesByPeriod() {
  const endDate = new Date();
  const startDate = new Date();

  startDate.setDate(startDate.getDate() - 7);

  const query = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    page: "1",
    limit: "10",
  });

  await request(`/journal?${query.toString()}`, {
    method: "GET",
  });

  logSuccess("Filter Journal Entries By Period");
}

async function testGetJournalSummary() {
  await request("/journal/summary", {
    method: "GET",
  });

  logSuccess("Get Journal Summary");
}

async function testGetJournalEntryById() {
  await request(`/journal/${journalEntryId}`, {
    method: "GET",
  });

  logSuccess("Get Journal Entry By Id");
}

async function testUpdateJournalEntry() {
  await request(`/journal/${journalEntryId}`, {
    method: "PATCH",
    body: JSON.stringify({
      title: "Bilan émotionnel mis à jour",
      content: "Le module Journal est maintenant testé automatiquement.",
      mood: "CALM",
      intensity: 7,
    }),
  });

  logSuccess("Update Journal Entry");
}

async function testDeleteJournalEntry() {
  await request(`/journal/${journalEntryId}`, {
    method: "DELETE",
  });

  journalEntryId = null;

  logSuccess("Delete Journal Entry");
}

/*
|--------------------------------------------------------------------------
| Conversation cleanup
|--------------------------------------------------------------------------
*/

async function testLeaveConversation() {
  await request(`/conversations/${conversationId}`, {
    method: "DELETE",
  });

  logSuccess("Leave Conversation");
}

/*
|--------------------------------------------------------------------------
| Comments
|--------------------------------------------------------------------------
*/

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
  await request(`/posts/${postId}/comments`, {
    method: "GET",
  });

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
  await request(`/comments/${commentId}`, {
    method: "DELETE",
  });

  logSuccess("Delete Comment");
}

/*
|--------------------------------------------------------------------------
| Post cleanup
|--------------------------------------------------------------------------
*/

async function testDeletePost() {
  await request(`/posts/${postId}`, {
    method: "DELETE",
  });

  logSuccess("Delete Post");
}

/*
|--------------------------------------------------------------------------
| Test runner
|--------------------------------------------------------------------------
*/

async function runTests() {
  console.log("\n=========================");
  console.log("HealSpace API Tests");
  console.log("=========================\n");

  try {
    await registerOrLogin();

    console.log("\n--- POSTS ---");

    await testCreatePost();
    await testGetPosts();
    await testGetPostById();
    await testUpdatePost();

    console.log("\n--- AI ---");

    await testAiAnalyzeMood();
    await testAiSupportMessage();

    console.log("\n--- REACTIONS ---");

    await testCreateReaction();
    await testUpdateReaction();
    await testGetReactions();
    await testGetReactionSummary();
    await testDeleteReaction();

    console.log("\n--- CONVERSATIONS ---");

    await testCreateDirectConversation();
    await testGetConversations();
    await testGetConversationById();

    console.log("\n--- MESSAGES ---");

    await testCreateMessage();
    await testGetMessages();
    await testUpdateMessage();
    await testMarkMessageAsRead();
    await testDeleteMessage();

    console.log("\n--- MEDIA ---");

    await testCreateMedia();
    await testGetMediaList();
    await testGetMediaById();
    await testDeleteMedia();

    console.log("\n--- GROUPS ---");

    await testCreateGroup();
    await testGetGroups();
    await testSearchGroups();
    await testGetMyGroups();
    await testGetGroupById();
    await testUpdateGroup();
    await testGetGroupMembers();

    await testSecondUserJoinGroup();
    await testSecondUserGetGroup();
    await testSecondUserGetMyGroups();

    await testGetGroupMembers();
    await testUpdateGroupMemberRole();
    await testRestoreGroupMemberRole();
    await testRemoveGroupMember();

    await testSecondUserRejoinGroup();
    await testSecondUserLeaveGroup();

    await testDeleteGroup();

    console.log("\n--- JOURNAL ---");

    await testCreateJournalEntry();
    await testGetJournalEntries();
    await testFilterJournalEntriesByMood();
    await testFilterJournalEntriesByPeriod();
    await testGetJournalSummary();
    await testGetJournalEntryById();
    await testUpdateJournalEntry();
    await testDeleteJournalEntry();

    console.log("\n--- CONVERSATION CLEANUP ---");

    await testLeaveConversation();

    console.log("\n--- COMMENTS ---");

    await testCreateComment();
    await testGetComments();
    await testUpdateComment();
    await testDeleteComment();

    console.log("\n--- POST CLEANUP ---");

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