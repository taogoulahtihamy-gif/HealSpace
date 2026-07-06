import { prisma } from "../src/config/prisma.js";
import { createNotification } from "../src/modules/notifications/notification.service.js";

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

let disposableUserToken = null;
let disposableUserId = null;
let disposableUserPassword = "password123";

const disposableUserSeed = Date.now();

const disposableUser = {
  firstName: "Temporary",
  lastName: "User",
  username: `healspace_temp_${disposableUserSeed}`,
  email: `healspace_temp_${disposableUserSeed}@test.com`,
  password: disposableUserPassword,
};

let accessToken = null;
let secondAccessToken = null;

let primaryUserId = null;
let secondUserId = null;
let postId = null;
let commentId = null;
let conversationId = null;
let messageId = null;
let mediaId = null;

let groupId = null;
let groupMemberId = null;
let journalEntryId = null;
let notificationId = null;
let supportRequestId = null;
let cancellableSupportRequestId = null;

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
  primaryUserId = result.user.id;

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
    token: secondAccessToken,
    body: JSON.stringify({
      type: "SUPPORT",
    }),
  });

  logSuccess("Create Reaction");
}


async function testGetReactionNotification() {
  const result = await request(
    "/notifications?type=REACTION&page=1&limit=20",
    {
      method: "GET",
    },
  );

  const notifications = result.data?.items || [];

  const notification = notifications.find(
    (item) =>
      item.type === "REACTION" &&
      item.data?.postId === postId &&
      item.actor?.id === secondUserId,
  );

  if (!notification) {
    throw new Error(
      "La notification de réaction n'a pas été créée.",
    );
  }

  logSuccess("Get Reaction Notification");
}


async function testUpdateReaction() {
  await request(`/posts/${postId}/reactions`, {
    method: "POST",
    token: secondAccessToken,
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
    token: secondAccessToken,
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

async function testGetMessageNotification() {
  const result = await request(
    "/notifications?type=MESSAGE&page=1&limit=20",
    {
      method: "GET",
      token: secondAccessToken,
    },
  );

  const notifications =
    result.data?.items || [];

  const notification = notifications.find(
    (item) =>
      item.type === "MESSAGE" &&
      item.data?.conversationId ===
        conversationId &&
      item.data?.messageId === messageId &&
      item.actor?.id === primaryUserId,
  );

  if (!notification) {
    throw new Error(
      "La notification de message n'a pas été créée.",
    );
  }

  logSuccess("Get Message Notification");
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

async function testGetGroupJoinNotification() {
  const result = await request(
    "/notifications?type=GROUP_JOIN&page=1&limit=20",
    {
      method: "GET",
    },
  );

  const notifications =
    result.data?.items || [];

  const notification = notifications.find(
    (item) =>
      item.type === "GROUP_JOIN" &&
      item.data?.groupId === groupId &&
      item.data?.memberId === groupMemberId &&
      item.actor?.id === secondUserId,
  );

  if (!notification) {
    throw new Error(
      "La notification d'adhésion au groupe n'a pas été créée.",
    );
  }

  logSuccess("Get Group Join Notification");
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
| Notifications
|--------------------------------------------------------------------------
*/

async function testCreateNotificationFixture() {
  const notification = await createNotification({
    userId: primaryUserId,
    actorId: secondUserId,
    type: "MESSAGE",
    title: "Nouvelle notification de test",
    message:
      "Une notification a été créée automatiquement pour les tests HealSpace.",
    data: {
      source: "test-api",
      conversationId,
    },
  });

  notificationId = notification?.id;

  if (!notificationId) {
    throw new Error(
      "La création interne de la notification n'a retourné aucun identifiant.",
    );
  }

  logSuccess("Create Notification Fixture");
}

async function testGetNotifications() {
  await request("/notifications?page=1&limit=10", {
    method: "GET",
  });

  logSuccess("Get Notifications");
}

async function testFilterUnreadNotifications() {
  await request(
    "/notifications?isRead=false&type=MESSAGE&page=1&limit=10",
    {
      method: "GET",
    },
  );

  logSuccess("Filter Unread Notifications");
}

async function testGetUnreadNotificationCount() {
  const result = await request(
    "/notifications/unread-count",
    {
      method: "GET",
    },
  );

  if (
    typeof result.data?.count !== "number" ||
    result.data.count < 1
  ) {
    throw new Error(
      "Le compteur de notifications non lues est invalide.",
    );
  }

  logSuccess("Get Unread Notification Count");
}

async function testMarkNotificationAsRead() {
  const result = await request(
    `/notifications/${notificationId}/read`,
    {
      method: "PATCH",
    },
  );

  if (result.data?.isRead !== true) {
    throw new Error(
      "La notification n'a pas été marquée comme lue.",
    );
  }

  logSuccess("Mark Notification As Read");
}

async function testCreateSecondNotificationFixture() {
  const notification = await createNotification({
    userId: primaryUserId,
    type: "SYSTEM",
    title: "Notification système de test",
    message:
      "Cette deuxième notification sert à tester la lecture globale.",
    data: {
      source: "test-api-read-all",
    },
  });

  if (!notification?.id) {
    throw new Error(
      "La deuxième notification de test n'a pas été créée.",
    );
  }

  logSuccess("Create Second Notification Fixture");
}

async function testMarkAllNotificationsAsRead() {
  const result = await request(
    "/notifications/read-all",
    {
      method: "PATCH",
    },
  );

  if (result.data?.unreadCount !== 0) {
    throw new Error(
      "Toutes les notifications n'ont pas été marquées comme lues.",
    );
  }

  logSuccess("Mark All Notifications As Read");
}

async function testDeleteNotification() {
  await request(`/notifications/${notificationId}`, {
    method: "DELETE",
  });

  notificationId = null;

  logSuccess("Delete Notification");
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
  const result = await request(
    `/posts/${postId}/comments`,
    {
      method: "POST",
      token: secondAccessToken,
      body: JSON.stringify({
        content:
          "Commentaire automatique de soutien.",
      }),
    },
  );

  commentId = result.data.id;

  if (!commentId) {
    throw new Error(
      "La création du commentaire n'a retourné aucun identifiant.",
    );
  }

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
    token: secondAccessToken,
    body: JSON.stringify({
      content:
        "Commentaire automatique mis à jour.",
    }),
  });

  logSuccess("Update Comment");
}

async function testDeleteComment() {
  await request(`/comments/${commentId}`, {
    method: "DELETE",
    token: secondAccessToken,
  });

  commentId = null;

  logSuccess("Delete Comment");
}


async function testGetCommentNotification() {
  const result = await request(
    "/notifications?type=COMMENT&page=1&limit=20",
    {
      method: "GET",
    },
  );

  const notifications =
    result.data?.items || [];

  const notification = notifications.find(
    (item) =>
      item.type === "COMMENT" &&
      item.data?.postId === postId &&
      item.data?.commentId === commentId &&
      item.actor?.id === secondUserId,
  );

  if (!notification) {
    throw new Error(
      "La notification de commentaire n'a pas été créée.",
    );
  }

  logSuccess("Get Comment Notification");
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
| Users
|--------------------------------------------------------------------------
*/

async function testGetMyUserProfile() {
  const result = await request("/users/me", {
    method: "GET",
  });

  if (result.data?.id !== primaryUserId) {
    throw new Error("Le profil courant retourné est invalide.");
  }

  logSuccess("Get My User Profile");
}

async function testUpdateMyUserProfile() {
  const result = await request("/users/me", {
    method: "PATCH",
    body: JSON.stringify({
      bio: "Profil mis à jour automatiquement par test-api.js.",
      country: "Sénégal",
      city: "Dakar",
      language: "fr",
      currentMood: "MOTIVATED",
    }),
  });

  if (result.data?.bio !== "Profil mis à jour automatiquement par test-api.js.") {
    throw new Error("La mise à jour du profil a échoué.");
  }

  logSuccess("Update My User Profile");
}

async function testUpdateMyPrivacy() {
  const result = await request("/users/me/privacy", {
    method: "PATCH",
    body: JSON.stringify({
      visibility: "PUBLIC",
      isPrivate: false,
      allowAI: true,
    }),
  });

  if (result.data?.visibility !== "PUBLIC") {
    throw new Error("La mise à jour de la confidentialité a échoué.");
  }

  logSuccess("Update My Privacy");
}

async function testGetPublicUserProfile() {
  const result = await request(`/users/${primaryUserId}`, {
    method: "GET",
    token: secondAccessToken,
  });

  if (result.data?.id !== primaryUserId) {
    throw new Error("Le profil public retourné est invalide.");
  }

  logSuccess("Get Public User Profile");
}

async function testCreateDisposableUser() {
  const result = await request("/auth/register", {
    method: "POST",
    token: null,
    body: JSON.stringify(disposableUser),
  });

  disposableUserToken = result.data.accessToken;
  disposableUserId = result.data.user.id;

  if (!disposableUserToken || !disposableUserId) {
    throw new Error(
      "La création de l'utilisateur temporaire a retourné des données invalides.",
    );
  }

  logSuccess("Create Disposable User");
}

async function testChangeDisposableUserPassword() {
  const newPassword = "password456";

  await request("/users/me/password", {
    method: "PATCH",
    token: disposableUserToken,
    body: JSON.stringify({
      currentPassword: disposableUserPassword,
      newPassword,
      confirmPassword: newPassword,
    }),
  });

  disposableUserPassword = newPassword;

  const loginResult = await request("/auth/login", {
    method: "POST",
    token: null,
    body: JSON.stringify({
      email: disposableUser.email,
      password: disposableUserPassword,
    }),
  });

  disposableUserToken = loginResult.data.accessToken;

  logSuccess("Change Disposable User Password");
}

async function testDeactivateDisposableUser() {
  await request("/users/me", {
    method: "DELETE",
    token: disposableUserToken,
    body: JSON.stringify({
      password: disposableUserPassword,
    }),
  });

  disposableUserToken = null;

  logSuccess("Deactivate Disposable User");
}



/*
|--------------------------------------------------------------------------
| Supports
|--------------------------------------------------------------------------
*/

async function testCreateSupportRequest() {
  const result = await request("/supports", {
    method: "POST",
    body: JSON.stringify({
      type: "LISTENING",
      message:
        "J'ai besoin d'être écouté quelques instants pour mieux organiser mes idées.",
      isAnonymous: false,
    }),
  });

  supportRequestId = result.data.id;

  if (!supportRequestId) {
    throw new Error(
      "La création de la demande de soutien n'a retourné aucun identifiant.",
    );
  }

  logSuccess("Create Support Request");
}

async function testGetAvailableSupportRequests() {
  const result = await request(
    "/supports?type=LISTENING&page=1&limit=20",
    {
      method: "GET",
      token: secondAccessToken,
    },
  );

  const items = result.data?.items || [];

  const supportRequest = items.find(
    (item) => item.id === supportRequestId,
  );

  if (!supportRequest) {
    throw new Error(
      "La demande de soutien n'apparaît pas dans les demandes disponibles.",
    );
  }

  logSuccess("Get Available Support Requests");
}

async function testGetSupportRequestById() {
  const result = await request(
    `/supports/${supportRequestId}`,
    {
      method: "GET",
      token: secondAccessToken,
    },
  );

  if (result.data?.id !== supportRequestId) {
    throw new Error(
      "Le détail de la demande de soutien est invalide.",
    );
  }

  logSuccess("Get Support Request By Id");
}

async function testAcceptSupportRequest() {
  const result = await request(
    `/supports/${supportRequestId}/accept`,
    {
      method: "PATCH",
      token: secondAccessToken,
    },
  );

  if (
    result.data?.status !== "ACCEPTED" ||
    result.data?.supporter?.id !== secondUserId
  ) {
    throw new Error(
      "L'acceptation de la demande de soutien a échoué.",
    );
  }

  logSuccess("Accept Support Request");
}

async function testGetSupportAcceptedNotification() {
  const result = await request(
    "/notifications?type=SUPPORT_ACCEPTED&page=1&limit=20",
    {
      method: "GET",
    },
  );

  const notifications = result.data?.items || [];

  const notification = notifications.find(
    (item) =>
      item.type === "SUPPORT_ACCEPTED" &&
      item.data?.supportRequestId === supportRequestId &&
      item.actor?.id === secondUserId,
  );

  if (!notification) {
    throw new Error(
      "La notification d'acceptation du soutien n'a pas été créée.",
    );
  }

  logSuccess("Get Support Accepted Notification");
}

async function testGetMySupportRequestsAsRequester() {
  const result = await request(
    "/supports/mine?role=requester&status=ACCEPTED&page=1&limit=20",
    {
      method: "GET",
    },
  );

  const items = result.data?.items || [];

  if (!items.some((item) => item.id === supportRequestId)) {
    throw new Error(
      "La demande n'apparaît pas dans les soutiens du demandeur.",
    );
  }

  logSuccess("Get My Support Requests As Requester");
}

async function testGetMySupportRequestsAsSupporter() {
  const result = await request(
    "/supports/mine?role=supporter&status=ACCEPTED&page=1&limit=20",
    {
      method: "GET",
      token: secondAccessToken,
    },
  );

  const items = result.data?.items || [];

  if (!items.some((item) => item.id === supportRequestId)) {
    throw new Error(
      "La demande n'apparaît pas dans les soutiens de l'accompagnant.",
    );
  }

  logSuccess("Get My Support Requests As Supporter");
}

async function testCompleteSupportRequest() {
  const result = await request(
    `/supports/${supportRequestId}/complete`,
    {
      method: "PATCH",
    },
  );

  if (result.data?.status !== "COMPLETED") {
    throw new Error(
      "La clôture de la demande de soutien a échoué.",
    );
  }

  logSuccess("Complete Support Request");
}

async function testGetSupportCompletedNotification() {
  const result = await request(
    "/notifications?type=SUPPORT_COMPLETED&page=1&limit=20",
    {
      method: "GET",
      token: secondAccessToken,
    },
  );

  const notifications = result.data?.items || [];

  const notification = notifications.find(
    (item) =>
      item.type === "SUPPORT_COMPLETED" &&
      item.data?.supportRequestId === supportRequestId &&
      item.actor?.id === primaryUserId,
  );

  if (!notification) {
    throw new Error(
      "La notification de clôture du soutien n'a pas été créée.",
    );
  }

  logSuccess("Get Support Completed Notification");
}

async function testCreateCancellableSupportRequest() {
  const result = await request("/supports", {
    method: "POST",
    body: JSON.stringify({
      type: "ENCOURAGEMENT",
      message:
        "J'ai besoin d'un message d'encouragement pour poursuivre mon travail.",
      isAnonymous: true,
    }),
  });

  cancellableSupportRequestId = result.data.id;

  if (!cancellableSupportRequestId) {
    throw new Error(
      "La demande de soutien à annuler n'a pas été créée.",
    );
  }

  logSuccess("Create Cancellable Support Request");
}

async function testCancelSupportRequest() {
  const result = await request(
    `/supports/${cancellableSupportRequestId}/cancel`,
    {
      method: "PATCH",
    },
  );

  if (result.data?.status !== "CANCELLED") {
    throw new Error(
      "L'annulation de la demande de soutien a échoué.",
    );
  }

  cancellableSupportRequestId = null;

  logSuccess("Cancel Support Request");
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
await testGetReactionNotification();
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
await testGetMessageNotification();
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
    await testGetGroupJoinNotification();
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

    console.log("\n--- NOTIFICATIONS ---");

    await testCreateNotificationFixture();
    await testGetNotifications();
    await testFilterUnreadNotifications();
    await testGetUnreadNotificationCount();
    await testMarkNotificationAsRead();
    await testCreateSecondNotificationFixture();
    await testMarkAllNotificationsAsRead();
    await testDeleteNotification();

    console.log("\n--- CONVERSATION CLEANUP ---");

    await testLeaveConversation();

    console.log("\n--- COMMENTS ---");

await testCreateComment();
await testGetCommentNotification();
await testGetComments();
await testUpdateComment();
await testDeleteComment();
    console.log("\n--- USERS ---");

    await testGetMyUserProfile();
    await testUpdateMyUserProfile();
    await testUpdateMyPrivacy();
    await testGetPublicUserProfile();
    await testCreateDisposableUser();
    await testChangeDisposableUserPassword();
    await testDeactivateDisposableUser();

    console.log("\n--- SUPPORTS ---");

    await testCreateSupportRequest();
    await testGetAvailableSupportRequests();
    await testGetSupportRequestById();
    await testAcceptSupportRequest();
    await testGetSupportAcceptedNotification();
    await testGetMySupportRequestsAsRequester();
    await testGetMySupportRequestsAsSupporter();
    await testCompleteSupportRequest();
    await testGetSupportCompletedNotification();
    await testCreateCancellableSupportRequest();
    await testCancelSupportRequest();

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