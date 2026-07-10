import { prisma } from "../src/config/prisma.js";
import { createNotification } from "../src/modules/notifications/notification.service.js";

import { requestPasswordResetForTest } from "../src/modules/password-resets/password-reset.service.js";

import { requestEmailVerificationForTest } from "../src/modules/email-verifications/email-verification.service.js";

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

const moderationUserSeed = Date.now();

const moderationUser = {
  firstName: "Moderator",
  lastName: "Test",
  username: `healspace_moderator_${moderationUserSeed}`,
  email: `healspace_moderator_${moderationUserSeed}@test.com`,
  password: "password123",
};

const administrationUserSeed = Date.now();

const administrationUser = {
  firstName: "Admin",
  lastName: "Test",
  username: `healspace_admin_${administrationUserSeed}`,
  email: `healspace_admin_${administrationUserSeed}@test.com`,
  password: "password123",
};

const administrationTargetUser = {
  firstName: "AdminTarget",
  lastName: "Test",
  username: `healspace_admin_target_${administrationUserSeed}`,
  email: `healspace_admin_target_${administrationUserSeed}@test.com`,
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
let moderationAccessToken = null;
let moderationUserId = null;
let rejectedReportId = null;
let friendshipId = null;
let administrationAccessToken = null;
let administrationUserId = null;
let administrationTargetUserId = null;
let administrationGroupId = null;

let primaryUserId = null;
let secondUserId = null;
let postId = null;
let commentId = null;
let conversationId = null;
let messageId = null;
let mediaId = null;
let cloudinaryMediaId = null;

let groupId = null;
let groupMemberId = null;
let journalEntryId = null;
let notificationId = null;
let supportRequestId = null;
let cancellableSupportRequestId = null;
let reportId = null;

const passwordResetSeed = Date.now();

const passwordResetUser = {
  firstName: "Password",
  lastName: "Reset",
  username: `healspace_password_reset_${passwordResetSeed}`,
  email: `healspace_password_reset_${passwordResetSeed}@test.com`,
  password: "password123",
};

let passwordResetUserId = null;
let passwordResetOldRefreshToken = null;
let passwordResetRawToken = null;
const passwordResetNewPassword = "password456";

const emailVerificationSeed = Date.now();

const emailVerificationUser = {
  firstName: "Email",
  lastName: "Verification",
  username: `healspace_email_verification_${emailVerificationSeed}`,
  email: `healspace_email_verification_${emailVerificationSeed}@test.com`,
  password: "password123",
};

let emailVerificationUserId = null;
let emailVerificationAccessToken = null;
let emailVerificationRawToken = null;

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

  const isFormData =
    typeof FormData !== "undefined" &&
    fetchOptions.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      ...(!isFormData && {
        "Content-Type": "application/json",
      }),
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
    throw new Error("La notification de réaction n'a pas été créée.");
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

  const notifications = result.data?.items || [];

  const notification = notifications.find(
    (item) =>
      item.type === "MESSAGE" &&
      item.data?.conversationId === conversationId &&
      item.data?.messageId === messageId &&
      item.actor?.id === primaryUserId,
  );

  if (!notification) {
    throw new Error("La notification de message n'a pas été créée.");
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

async function testCloudinaryMediaLifecycle() {
  const enabled = ["1", "true", "yes"].includes(
    String(process.env.RUN_CLOUDINARY_TESTS || "").toLowerCase(),
  );

  if (!enabled) {
    console.log(
      "⏭️ Cloudinary Media Lifecycle skipped " +
        "(RUN_CLOUDINARY_TESTS=false)",
    );
    return;
  }

  const requiredEnvironment = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missingEnvironment = requiredEnvironment.filter(
    (key) => !process.env[key],
  );

  if (missingEnvironment.length > 0) {
    throw new Error(
      `Variables Cloudinary manquantes : ${missingEnvironment.join(
        ", ",
      )}`,
    );
  }

  const onePixelPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB" +
      "CAQAAAC1HAwCAAAAC0lEQVR42mP8/x8A" +
      "AgMBAp9Z5ZkAAAAASUVORK5CYII=",
    "base64",
  );

  const formData = new FormData();

  formData.append(
    "file",
    new Blob([onePixelPng], { type: "image/png" }),
    "healspace-cloudinary-test.png",
  );

  formData.append("postId", postId);

  const uploadResult = await request("/media/upload", {
    method: "POST",
    body: formData,
  });

  cloudinaryMediaId = uploadResult.data?.id;

  if (
    !cloudinaryMediaId ||
    uploadResult.data?.type !== "IMAGE" ||
    !uploadResult.data?.url?.includes("res.cloudinary.com") ||
    !uploadResult.data?.publicId
  ) {
    throw new Error(
      "Le téléversement Cloudinary a retourné des données invalides.",
    );
  }

  logSuccess("Upload Media To Cloudinary");

  const detailResult = await request(`/media/${cloudinaryMediaId}`, {
    method: "GET",
  });

  if (detailResult.data?.id !== cloudinaryMediaId) {
    throw new Error("Le média Cloudinary enregistré est introuvable.");
  }

  logSuccess("Get Cloudinary Media By Id");

  await request(`/media/${cloudinaryMediaId}`, {
    method: "DELETE",
  });

  cloudinaryMediaId = null;

  logSuccess("Delete Cloudinary Media");
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
    throw new Error(
      "La création du groupe n'a retourné aucun identifiant.",
    );
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

  const notifications = result.data?.items || [];

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
  await request(`/groups/${groupId}/members/${groupMemberId}/role`, {
    method: "PATCH",
    body: JSON.stringify({
      role: "ADMIN",
    }),
  });

  logSuccess("Update Group Member Role To Admin");
}

async function testRestoreGroupMemberRole() {
  await request(`/groups/${groupId}/members/${groupMemberId}/role`, {
    method: "PATCH",
    body: JSON.stringify({
      role: "MEMBER",
    }),
  });

  logSuccess("Restore Group Member Role");
}

async function testRemoveGroupMember() {
  await request(`/groups/${groupId}/members/${groupMemberId}`, {
    method: "DELETE",
  });

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
| Group invitations
|--------------------------------------------------------------------------
*/

async function testGroupInvitationLifecycle() {
  const invitationSeed = Date.now();

  const inviteeRegistration = await request("/auth/register", {
    method: "POST",
    token: null,
    body: JSON.stringify({
      firstName: "Group",
      lastName: "Invitee",
      username: `api_group_invitee_${invitationSeed}`,
      email: `api_group_invitee_${invitationSeed}@test.com`,
      password: "password123",
    }),
  });

  const inviteeToken = inviteeRegistration.data.accessToken;

  const inviteeId = inviteeRegistration.data.user.id;

  const groupResult = await request("/groups", {
    method: "POST",
    body: JSON.stringify({
      name: `Private API Group ${invitationSeed}`,
      description: "Groupe privé destiné au test global.",
      visibility: "PRIVATE",
    }),
  });

  const invitationGroupId = groupResult.data.id;

  try {
    const invitationResult = await request(
      `/groups/${invitationGroupId}/invitations`,
      {
        method: "POST",
        body: JSON.stringify({
          inviteeId,
        }),
      },
    );

    const invitationId = invitationResult.data.id;

    if (!invitationId || invitationResult.data.status !== "PENDING") {
      throw new Error("L'invitation de groupe créée est invalide.");
    }

    logSuccess("Create Private Group Invitation");

    const invitationNotification = await request(
      "/notifications?type=GROUP_INVITATION&page=1&limit=20",
      {
        method: "GET",
        token: inviteeToken,
      },
    );

    if (
      !invitationNotification.data.items.some(
        (item) => item.data?.invitationId === invitationId,
      )
    ) {
      throw new Error(
        "La notification d'invitation au groupe est absente.",
      );
    }

    logSuccess("Get Group Invitation Notification");

    const accepted = await request(
      `/groups/invitations/${invitationId}/accept`,
      {
        method: "PATCH",
        token: inviteeToken,
      },
    );

    if (
      accepted.data.status !== "ACCEPTED" ||
      !accepted.data.membership?.id
    ) {
      throw new Error(
        "L'acceptation de l'invitation au groupe a échoué.",
      );
    }

    logSuccess("Accept Private Group Invitation");

    const acceptedNotification = await request(
      "/notifications?type=GROUP_INVITATION_ACCEPTED&page=1&limit=20",
      {
        method: "GET",
      },
    );

    if (
      !acceptedNotification.data.items.some(
        (item) => item.data?.invitationId === invitationId,
      )
    ) {
      throw new Error(
        "La notification d'acceptation de l'invitation est absente.",
      );
    }

    logSuccess("Get Group Invitation Accepted Notification");
  } finally {
    await request(`/groups/${invitationGroupId}`, {
      method: "DELETE",
    });
  }
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
      content:
        "Le module Journal est maintenant testé automatiquement.",
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
  const result = await request("/notifications/unread-count", {
    method: "GET",
  });

  if (typeof result.data?.count !== "number" || result.data.count < 1) {
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
    throw new Error("La notification n'a pas été marquée comme lue.");
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
  const result = await request("/notifications/read-all", {
    method: "PATCH",
  });

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
  const result = await request(`/posts/${postId}/comments`, {
    method: "POST",
    token: secondAccessToken,
    body: JSON.stringify({
      content: "Commentaire automatique de soutien.",
    }),
  });

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
      content: "Commentaire automatique mis à jour.",
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

  const notifications = result.data?.items || [];

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

async function testSearchUsers() {
  const result = await request(
    `/users/search?q=${encodeURIComponent(secondUser.username)}&page=1&limit=20`,
    {
      method: "GET",
    },
  );

  const items = result.data?.items || [];

  const target = items.find((item) => item.id === secondUserId);

  if (!target) {
    throw new Error(
      "Le deuxième utilisateur n'apparaît pas dans la recherche.",
    );
  }

  if (items.some((item) => item.id === primaryUserId)) {
    throw new Error(
      "L'utilisateur connecté ne doit pas apparaître dans sa propre recherche.",
    );
  }

  logSuccess("Search Users");
}

async function testRejectShortUserSearch() {
  try {
    await request("/users/search?q=a", {
      method: "GET",
    });
  } catch (error) {
    if (error.status === 400) {
      logSuccess("Reject Short User Search");
      return;
    }

    throw error;
  }

  throw new Error(
    "Une recherche utilisateur trop courte aurait dû être refusée.",
  );
}

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

  if (
    result.data?.bio !==
    "Profil mis à jour automatiquement par test-api.js."
  ) {
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
  const result = await request(`/supports/${supportRequestId}`, {
    method: "GET",
    token: secondAccessToken,
  });

  if (result.data?.id !== supportRequestId) {
    throw new Error("Le détail de la demande de soutien est invalide.");
  }

  logSuccess("Get Support Request By Id");
}

async function testAcceptSupportRequest() {
  const result = await request(`/supports/${supportRequestId}/accept`, {
    method: "PATCH",
    token: secondAccessToken,
  });

  if (
    result.data?.status !== "ACCEPTED" ||
    result.data?.supporter?.id !== secondUserId
  ) {
    throw new Error("L'acceptation de la demande de soutien a échoué.");
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
    throw new Error("La clôture de la demande de soutien a échoué.");
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
    throw new Error("L'annulation de la demande de soutien a échoué.");
  }

  cancellableSupportRequestId = null;

  logSuccess("Cancel Support Request");
}

/*
|--------------------------------------------------------------------------
| Reports
|--------------------------------------------------------------------------
*/

async function testCreateReport() {
  const result = await request("/reports", {
    method: "POST",
    token: secondAccessToken,
    body: JSON.stringify({
      targetType: "POST",
      targetId: postId,
      reason: "SPAM",
      description:
        "Ce signalement est créé automatiquement pour tester le module Reports.",
    }),
  });

  reportId = result.data.id;

  if (
    !reportId ||
    result.data?.status !== "PENDING" ||
    result.data?.reporter?.id !== secondUserId
  ) {
    throw new Error(
      "La création du signalement a retourné des données invalides.",
    );
  }

  logSuccess("Create Report");
}

async function testGetMyReports() {
  const result = await request(
    "/reports/mine?targetType=POST&status=PENDING&page=1&limit=20",
    {
      method: "GET",
      token: secondAccessToken,
    },
  );

  const items = result.data?.items || [];

  if (!items.some((item) => item.id === reportId)) {
    throw new Error(
      "Le signalement n'apparaît pas dans la liste du déclarant.",
    );
  }

  logSuccess("Get My Reports");
}

async function testGetReportById() {
  const result = await request(`/reports/${reportId}`, {
    method: "GET",
    token: secondAccessToken,
  });

  if (
    result.data?.id !== reportId ||
    result.data?.targetId !== postId
  ) {
    throw new Error("Le détail du signalement retourné est invalide.");
  }

  logSuccess("Get Report By Id");
}

async function testRejectDuplicateActiveReport() {
  try {
    await request("/reports", {
      method: "POST",
      token: secondAccessToken,
      body: JSON.stringify({
        targetType: "POST",
        targetId: postId,
        reason: "SPAM",
        description:
          "Tentative volontaire de création d'un signalement en double.",
      }),
    });
  } catch (error) {
    if (error.status === 409) {
      logSuccess("Reject Duplicate Active Report");
      return;
    }

    throw error;
  }

  throw new Error(
    "Le doublon de signalement actif aurait dû être refusé.",
  );
}

async function testProtectReportOwnership() {
  try {
    await request(`/reports/${reportId}`, {
      method: "GET",
    });
  } catch (error) {
    if (error.status === 404) {
      logSuccess("Protect Report Ownership");
      return;
    }

    throw error;
  }

  throw new Error(
    "Un utilisateur ne doit pas pouvoir consulter le signalement d'un autre utilisateur.",
  );
}

/*
|--------------------------------------------------------------------------
| Moderation
|--------------------------------------------------------------------------
*/

async function testCreateModeratorUser() {
  const registerResult = await request("/auth/register", {
    method: "POST",
    token: null,
    body: JSON.stringify(moderationUser),
  });

  moderationUserId = registerResult.data.user.id;

  await prisma.user.update({
    where: {
      id: moderationUserId,
    },
    data: {
      role: "MODERATOR",
    },
  });

  const loginResult = await request("/auth/login", {
    method: "POST",
    token: null,
    body: JSON.stringify({
      email: moderationUser.email,
      password: moderationUser.password,
    }),
  });

  moderationAccessToken = loginResult.data.accessToken;

  if (!moderationUserId || !moderationAccessToken) {
    throw new Error(
      "La création de l'utilisateur modérateur a échoué.",
    );
  }

  logSuccess("Create Moderator User");
}

async function testRejectUnauthorizedModerationAccess() {
  try {
    await request("/moderation/reports", {
      method: "GET",
    });
  } catch (error) {
    if (error.status === 403) {
      logSuccess("Reject Unauthorized Moderation Access");
      return;
    }

    throw error;
  }

  throw new Error(
    "Un utilisateur standard ne doit pas accéder à la modération.",
  );
}

async function testGetModerationReports() {
  const result = await request(
    "/moderation/reports?status=PENDING&page=1&limit=20",
    {
      method: "GET",
      token: moderationAccessToken,
    },
  );

  const items = result.data?.items || [];

  if (!items.some((item) => item.id === reportId)) {
    throw new Error(
      "Le signalement n'apparaît pas dans la file de modération.",
    );
  }

  logSuccess("Get Moderation Reports");
}

async function testGetModerationReportById() {
  const result = await request(`/moderation/reports/${reportId}`, {
    method: "GET",
    token: moderationAccessToken,
  });

  if (result.data?.id !== reportId) {
    throw new Error(
      "Le détail du signalement de modération est invalide.",
    );
  }

  logSuccess("Get Moderation Report By Id");
}

async function testStartReportReview() {
  const result = await request(
    `/moderation/reports/${reportId}/review`,
    {
      method: "PATCH",
      token: moderationAccessToken,
    },
  );

  if (
    result.data?.status !== "UNDER_REVIEW" ||
    result.data?.reviewer?.id !== moderationUserId
  ) {
    throw new Error("La prise en charge du signalement a échoué.");
  }

  logSuccess("Start Report Review");
}

async function testResolveReport() {
  const result = await request(
    `/moderation/reports/${reportId}/resolve`,
    {
      method: "PATCH",
      token: moderationAccessToken,
      body: JSON.stringify({
        resolutionNote:
          "Signalement analysé et résolu par le test automatisé HealSpace.",
      }),
    },
  );

  if (
    result.data?.status !== "RESOLVED" ||
    result.data?.moderationActions?.length < 2
  ) {
    throw new Error("La résolution du signalement a échoué.");
  }

  logSuccess("Resolve Report");
}

async function testCreateReportForRejection() {
  const result = await request("/reports", {
    method: "POST",
    token: secondAccessToken,
    body: JSON.stringify({
      targetType: "POST",
      targetId: postId,
      reason: "OTHER",
      description:
        "Deuxième signalement créé pour tester le rejet par un modérateur.",
    }),
  });

  rejectedReportId = result.data.id;

  if (!rejectedReportId) {
    throw new Error(
      "Le signalement destiné au test de rejet n'a pas été créé.",
    );
  }

  logSuccess("Create Report For Rejection");
}

async function testRejectReport() {
  const result = await request(
    `/moderation/reports/${rejectedReportId}/reject`,
    {
      method: "PATCH",
      token: moderationAccessToken,
      body: JSON.stringify({
        resolutionNote:
          "Signalement rejeté après vérification dans le test automatisé.",
      }),
    },
  );

  if (result.data?.status !== "REJECTED") {
    throw new Error("Le rejet du signalement a échoué.");
  }

  logSuccess("Reject Report");
}

async function testSuspendUser() {
  const result = await request(
    `/moderation/users/${primaryUserId}/status`,
    {
      method: "PATCH",
      token: moderationAccessToken,
      body: JSON.stringify({
        status: "SUSPENDED",
        note: "Suspension temporaire réalisée par le test automatisé de modération.",
      }),
    },
  );

  if (result.data?.status !== "SUSPENDED") {
    throw new Error("La suspension de l'utilisateur a échoué.");
  }

  logSuccess("Suspend User");
}

async function testReactivateUser() {
  const result = await request(
    `/moderation/users/${primaryUserId}/status`,
    {
      method: "PATCH",
      token: moderationAccessToken,
      body: JSON.stringify({
        status: "ACTIVE",
        note: "Réactivation immédiate après validation du test de modération.",
      }),
    },
  );

  if (result.data?.status !== "ACTIVE") {
    throw new Error("La réactivation de l'utilisateur a échoué.");
  }

  /*
  |--------------------------------------------------------------------------
  | Nouvelle session après suspension
  |--------------------------------------------------------------------------
  */

  const loginResult = await request("/auth/login", {
    method: "POST",
    token: null,
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });

  accessToken = loginResult.data.accessToken;

  if (!accessToken) {
    throw new Error(
      "La création d'une nouvelle session après réactivation a échoué.",
    );
  }

  logSuccess("Reactivate User");
  logSuccess("Restore User Session After Reactivation");
}

/*
|--------------------------------------------------------------------------
| Friendships
|--------------------------------------------------------------------------
*/

async function resetFriendshipFixture() {
  const [userOneId, userTwoId] = [primaryUserId, secondUserId].sort();

  await prisma.friendship.deleteMany({
    where: {
      userOneId,
      userTwoId,
    },
  });

  friendshipId = null;

  logSuccess("Reset Friendship Fixture");
}

async function testSendFriendRequest() {
  const result = await request(
    `/friendships/requests/${secondUserId}`,
    {
      method: "POST",
    },
  );

  friendshipId = result.data.id;

  if (!friendshipId || result.data?.status !== "PENDING") {
    throw new Error("La demande d'amitié créée est invalide.");
  }

  logSuccess("Send Friend Request");
}

async function testGetOutgoingFriendRequests() {
  const result = await request(
    "/friendships/requests/outgoing?page=1&limit=20",
    {
      method: "GET",
    },
  );

  const items = result.data?.items || [];

  if (!items.some((item) => item.id === friendshipId)) {
    throw new Error(
      "La demande n'apparaît pas dans les demandes sortantes.",
    );
  }

  logSuccess("Get Outgoing Friend Requests");
}

async function testGetIncomingFriendRequests() {
  const result = await request(
    "/friendships/requests/incoming?page=1&limit=20",
    {
      method: "GET",
      token: secondAccessToken,
    },
  );

  const items = result.data?.items || [];

  if (!items.some((item) => item.id === friendshipId)) {
    throw new Error(
      "La demande n'apparaît pas dans les demandes reçues.",
    );
  }

  logSuccess("Get Incoming Friend Requests");
}

async function testGetFriendRequestNotification() {
  const result = await request(
    "/notifications?type=FRIEND_REQUEST&page=1&limit=20",
    {
      method: "GET",
      token: secondAccessToken,
    },
  );

  const notifications = result.data?.items || [];

  const notification = notifications.find(
    (item) =>
      item.type === "FRIEND_REQUEST" &&
      item.data?.friendshipId === friendshipId &&
      item.actor?.id === primaryUserId,
  );

  if (!notification) {
    throw new Error(
      "La notification de demande d'amitié n'a pas été créée.",
    );
  }

  logSuccess("Get Friend Request Notification");
}

async function testAcceptFriendRequest() {
  const result = await request(
    `/friendships/requests/${friendshipId}/accept`,
    {
      method: "PATCH",
      token: secondAccessToken,
    },
  );

  if (result.data?.status !== "ACCEPTED") {
    throw new Error("L'acceptation de la demande d'amitié a échoué.");
  }

  logSuccess("Accept Friend Request");
}

async function testGetFriendAcceptedNotification() {
  const result = await request(
    "/notifications?type=FRIEND_ACCEPTED&page=1&limit=20",
    {
      method: "GET",
    },
  );

  const notifications = result.data?.items || [];

  const notification = notifications.find(
    (item) =>
      item.type === "FRIEND_ACCEPTED" &&
      item.data?.friendshipId === friendshipId &&
      item.actor?.id === secondUserId,
  );

  if (!notification) {
    throw new Error(
      "La notification d'acceptation d'amitié n'a pas été créée.",
    );
  }

  logSuccess("Get Friend Accepted Notification");
}

async function testGetFriends() {
  const result = await request("/friendships?page=1&limit=20", {
    method: "GET",
  });

  const items = result.data?.items || [];

  if (!items.some((item) => item.friend?.id === secondUserId)) {
    throw new Error("L'ami n'apparaît pas dans la liste.");
  }

  logSuccess("Get Friends");
}

async function testFriendsProfileVisibility() {
  await request("/users/me/privacy", {
    method: "PATCH",
    body: JSON.stringify({
      visibility: "FRIENDS",
      isPrivate: false,
      allowAI: true,
    }),
  });

  const friendResult = await request(`/users/${primaryUserId}`, {
    method: "GET",
    token: secondAccessToken,
  });

  if (friendResult.data?.id !== primaryUserId) {
    throw new Error("Un ami doit pouvoir consulter un profil FRIENDS.");
  }

  try {
    await request(`/users/${primaryUserId}`, {
      method: "GET",
      token: moderationAccessToken,
    });
  } catch (error) {
    if (error.status === 403) {
      await request("/users/me/privacy", {
        method: "PATCH",
        body: JSON.stringify({
          visibility: "PUBLIC",
          isPrivate: false,
          allowAI: true,
        }),
      });

      logSuccess("Friends Profile Visibility");
      return;
    }

    throw error;
  }

  throw new Error(
    "Un non-ami ne doit pas accéder à un profil FRIENDS.",
  );
}

async function testRemoveFriendship() {
  await request(`/friendships/${friendshipId}`, {
    method: "DELETE",
  });

  friendshipId = null;

  logSuccess("Remove Friendship");
}

async function testSendFriendRequestForRejection() {
  const result = await request(
    `/friendships/requests/${secondUserId}`,
    {
      method: "POST",
    },
  );

  friendshipId = result.data.id;

  logSuccess("Send Friend Request For Rejection");
}

async function testRejectFriendRequest() {
  const result = await request(
    `/friendships/requests/${friendshipId}/reject`,
    {
      method: "PATCH",
      token: secondAccessToken,
    },
  );

  if (result.data?.status !== "REJECTED") {
    throw new Error("Le refus de la demande d'amitié a échoué.");
  }

  logSuccess("Reject Friend Request");
}

async function testReopenFriendRequest() {
  const result = await request(
    `/friendships/requests/${secondUserId}`,
    {
      method: "POST",
    },
  );

  friendshipId = result.data.id;

  if (result.data?.status !== "PENDING") {
    throw new Error("La réouverture de la demande a échoué.");
  }

  logSuccess("Reopen Friend Request");
}

async function testCancelFriendRequest() {
  await request(`/friendships/requests/${friendshipId}`, {
    method: "DELETE",
  });

  friendshipId = null;

  logSuccess("Cancel Friend Request");
}

/*
|--------------------------------------------------------------------------
| Administration
|--------------------------------------------------------------------------
*/

async function testCreateAdministrationUsers() {
  const adminRegistration = await request("/auth/register", {
    method: "POST",
    token: null,
    body: JSON.stringify(administrationUser),
  });

  administrationUserId = adminRegistration.data.user.id;

  await prisma.user.update({
    where: {
      id: administrationUserId,
    },
    data: {
      role: "ADMIN",
    },
  });

  const adminLogin = await request("/auth/login", {
    method: "POST",
    token: null,
    body: JSON.stringify({
      email: administrationUser.email,
      password: administrationUser.password,
    }),
  });

  administrationAccessToken = adminLogin.data.accessToken;

  const targetRegistration = await request("/auth/register", {
    method: "POST",
    token: null,
    body: JSON.stringify(administrationTargetUser),
  });

  administrationTargetUserId = targetRegistration.data.user.id;

  if (
    !administrationUserId ||
    !administrationAccessToken ||
    !administrationTargetUserId
  ) {
    throw new Error(
      "La préparation des utilisateurs Administration a échoué.",
    );
  }

  logSuccess("Create Administration Users");
}

async function testRejectUnauthorizedAdministrationAccess() {
  try {
    await request("/admin/statistics", {
      method: "GET",
    });
  } catch (error) {
    if (error.status === 403) {
      logSuccess("Reject Unauthorized Administration Access");
      return;
    }

    throw error;
  }

  throw new Error(
    "Un utilisateur standard ne doit pas accéder à l'administration.",
  );
}

async function testGetAdministrationStatistics() {
  const result = await request("/admin/statistics", {
    method: "GET",
    token: administrationAccessToken,
  });

  if (
    typeof result.data?.users?.total !== "number" ||
    typeof result.data?.posts?.total !== "number" ||
    typeof result.data?.reports?.total !== "number"
  ) {
    throw new Error("Les statistiques administratives sont invalides.");
  }

  logSuccess("Get Administration Statistics");
}

async function testGetAdministrationUsers() {
  const result = await request(
    `/admin/users?search=${encodeURIComponent(
      administrationTargetUser.username,
    )}&page=1&limit=20`,
    {
      method: "GET",
      token: administrationAccessToken,
    },
  );

  const items = result.data?.items || [];

  if (!items.some((item) => item.id === administrationTargetUserId)) {
    throw new Error(
      "L'utilisateur cible n'apparaît pas dans la liste administrative.",
    );
  }

  logSuccess("Get Administration Users");
}

async function testGetAdministrationUserById() {
  const result = await request(
    `/admin/users/${administrationTargetUserId}`,
    {
      method: "GET",
      token: administrationAccessToken,
    },
  );

  if (result.data?.id !== administrationTargetUserId) {
    throw new Error(
      "Le détail administratif de l'utilisateur est invalide.",
    );
  }

  logSuccess("Get Administration User By Id");
}

async function testUpdateAdministrationUserRole() {
  const result = await request(
    `/admin/users/${administrationTargetUserId}/role`,
    {
      method: "PATCH",
      token: administrationAccessToken,
      body: JSON.stringify({
        role: "PSYCHOLOGIST",
        note: "Attribution temporaire du rôle psychologue pour le test Administration.",
      }),
    },
  );

  if (result.data?.role !== "PSYCHOLOGIST") {
    throw new Error("La modification administrative du rôle a échoué.");
  }

  logSuccess("Update Administration User Role");
}

async function testRestoreAdministrationUserRole() {
  const result = await request(
    `/admin/users/${administrationTargetUserId}/role`,
    {
      method: "PATCH",
      token: administrationAccessToken,
      body: JSON.stringify({
        role: "USER",
        note: "Restauration du rôle utilisateur après le test Administration.",
      }),
    },
  );

  if (result.data?.role !== "USER") {
    throw new Error("La restauration du rôle utilisateur a échoué.");
  }

  logSuccess("Restore Administration User Role");
}

async function testSuspendAdministrationTargetUser() {
  const result = await request(
    `/admin/users/${administrationTargetUserId}/status`,
    {
      method: "PATCH",
      token: administrationAccessToken,
      body: JSON.stringify({
        status: "SUSPENDED",
        note: "Suspension temporaire de l'utilisateur cible pour le test Administration.",
      }),
    },
  );

  if (result.data?.status !== "SUSPENDED") {
    throw new Error("La suspension administrative a échoué.");
  }

  logSuccess("Suspend Administration Target User");
}

async function testReactivateAdministrationTargetUser() {
  const result = await request(
    `/admin/users/${administrationTargetUserId}/status`,
    {
      method: "PATCH",
      token: administrationAccessToken,
      body: JSON.stringify({
        status: "ACTIVE",
        note: "Réactivation de l'utilisateur cible après le test Administration.",
      }),
    },
  );

  if (result.data?.status !== "ACTIVE") {
    throw new Error("La réactivation administrative a échoué.");
  }

  logSuccess("Reactivate Administration Target User");
}

async function testGetAdministrationPosts() {
  const result = await request(
    `/admin/posts?authorId=${primaryUserId}&page=1&limit=20`,
    {
      method: "GET",
      token: administrationAccessToken,
    },
  );

  const items = result.data?.items || [];

  if (!items.some((item) => item.id === postId)) {
    throw new Error(
      "La publication de test n'apparaît pas dans l'administration.",
    );
  }

  logSuccess("Get Administration Posts");
}

async function testArchiveAdministrationPost() {
  const result = await request(`/admin/posts/${postId}/status`, {
    method: "PATCH",
    token: administrationAccessToken,
    body: JSON.stringify({
      status: "ARCHIVED",
      note: "Archivage temporaire de la publication pour le test Administration.",
    }),
  });

  if (result.data?.status !== "ARCHIVED") {
    throw new Error(
      "L'archivage administratif de la publication a échoué.",
    );
  }

  logSuccess("Archive Administration Post");
}

async function testRestoreAdministrationPost() {
  const result = await request(`/admin/posts/${postId}/status`, {
    method: "PATCH",
    token: administrationAccessToken,
    body: JSON.stringify({
      status: "PUBLISHED",
      note: "Restauration de la publication après le test Administration.",
    }),
  });

  if (result.data?.status !== "PUBLISHED") {
    throw new Error(
      "La restauration administrative de la publication a échoué.",
    );
  }

  logSuccess("Restore Administration Post");
}

async function testCreateAdministrationGroupFixture() {
  const result = await request("/groups", {
    method: "POST",
    body: JSON.stringify({
      name: `Administration Group ${Date.now()}`,
      description:
        "Groupe temporaire destiné au test du module Administration.",
      visibility: "PUBLIC",
    }),
  });

  administrationGroupId = result.data.id;

  if (!administrationGroupId) {
    throw new Error(
      "Le groupe temporaire Administration n'a pas été créé.",
    );
  }

  logSuccess("Create Administration Group Fixture");
}

async function testGetAdministrationGroups() {
  const result = await request(
    `/admin/groups?ownerId=${primaryUserId}&page=1&limit=20`,
    {
      method: "GET",
      token: administrationAccessToken,
    },
  );

  const items = result.data?.items || [];

  if (!items.some((item) => item.id === administrationGroupId)) {
    throw new Error(
      "Le groupe temporaire n'apparaît pas dans l'administration.",
    );
  }

  logSuccess("Get Administration Groups");
}

async function testDeleteAdministrationGroup() {
  const result = await request(
    `/admin/groups/${administrationGroupId}`,
    {
      method: "DELETE",
      token: administrationAccessToken,
    },
  );

  if (result.data?.id !== administrationGroupId) {
    throw new Error(
      "La suppression administrative du groupe a échoué.",
    );
  }

  administrationGroupId = null;

  logSuccess("Delete Administration Group");
}

async function testGetAdministrationReports() {
  const result = await request("/admin/reports?page=1&limit=20", {
    method: "GET",
    token: administrationAccessToken,
  });

  const items = result.data?.items || [];

  if (!items.some((item) => item.id === reportId)) {
    throw new Error(
      "Le signalement n'apparaît pas dans la vue Administration.",
    );
  }

  logSuccess("Get Administration Reports");
}

async function testGetAdministrationActions() {
  const result = await request(
    `/admin/moderation-actions?action=USER_ROLE_CHANGED&moderatorId=${administrationUserId}&page=1&limit=20`,
    {
      method: "GET",
      token: administrationAccessToken,
    },
  );

  const items = result.data?.items || [];

  const roleAction = items.find(
    (item) =>
      item.action === "USER_ROLE_CHANGED" &&
      item.targetUser?.id === administrationTargetUserId,
  );

  if (!roleAction) {
    throw new Error(
      "L'action administrative de changement de rôle n'a pas été journalisée.",
    );
  }

  logSuccess("Get Administration Actions");
}

/*
|--------------------------------------------------------------------------
| Email verification
|--------------------------------------------------------------------------
*/

async function testCreateEmailVerificationUser() {
  const result = await request("/auth/register", {
    method: "POST",
    token: null,
    body: JSON.stringify(emailVerificationUser),
  });

  emailVerificationUserId = result.data.user.id;
  emailVerificationAccessToken = result.data.accessToken;

  if (
    !emailVerificationUserId ||
    !emailVerificationAccessToken ||
    result.data.user.emailVerified !== false
  ) {
    throw new Error(
      "La préparation de l'utilisateur Email Verification a échoué.",
    );
  }

  logSuccess("Create Email Verification User");
}

async function testRequestEmailVerification() {
  const result = await request("/auth/email-verification/send", {
    method: "POST",
    token: emailVerificationAccessToken,
    body: JSON.stringify({}),
  });

  const token = await prisma.emailVerificationToken.findFirst({
    where: {
      userId: emailVerificationUserId,
      usedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (
    result.success !== true ||
    !token ||
    token.tokenHash.length !== 64
  ) {
    throw new Error(
      "La demande de vérification n'a pas créé un jeton haché valide.",
    );
  }

  logSuccess("Request Email Verification");
}

async function testCaptureEmailVerificationLink() {
  let capturedVerificationUrl = null;

  await requestEmailVerificationForTest(
    emailVerificationUserId,
    async (emailPayload) => {
      capturedVerificationUrl = emailPayload.verificationUrl;
    },
  );

  emailVerificationRawToken = new URL(
    capturedVerificationUrl,
  ).searchParams.get("token");

  if (
    !emailVerificationRawToken ||
    emailVerificationRawToken.length !== 64
  ) {
    throw new Error("Le jeton brut Email Verification est invalide.");
  }

  const activeTokens = await prisma.emailVerificationToken.count({
    where: {
      userId: emailVerificationUserId,
      usedAt: null,
    },
  });

  if (activeTokens !== 1) {
    throw new Error(
      "Un seul jeton Email Verification doit rester actif.",
    );
  }

  logSuccess("Capture Email Verification Link");
}

async function testVerifyEmail() {
  const result = await request("/auth/email-verification/verify", {
    method: "POST",
    token: null,
    body: JSON.stringify({
      token: emailVerificationRawToken,
    }),
  });

  if (
    result.data?.emailVerified !== true ||
    result.data?.isVerified !== true
  ) {
    throw new Error("La vérification de l'adresse email a échoué.");
  }

  logSuccess("Verify Email Address");
}

async function testGetVerifiedEmailProfile() {
  const result = await request("/auth/me", {
    method: "GET",
    token: emailVerificationAccessToken,
  });

  if (
    result.data?.emailVerified !== true ||
    result.data?.isVerified !== true ||
    !result.data?.emailVerifiedAt
  ) {
    throw new Error(
      "Le profil ne reflète pas la vérification de l'email.",
    );
  }

  logSuccess("Get Verified Email Profile");
}

async function testRejectEmailVerificationTokenReuse() {
  try {
    await request("/auth/email-verification/verify", {
      method: "POST",
      token: null,
      body: JSON.stringify({
        token: emailVerificationRawToken,
      }),
    });
  } catch (error) {
    if (error.status === 400) {
      logSuccess("Reject Email Verification Token Reuse");
      return;
    }

    throw error;
  }

  throw new Error(
    "Un jeton Email Verification déjà utilisé aurait dû être refusé.",
  );
}

async function testVerifiedEmailResendIsIdempotent() {
  const result = await request("/auth/email-verification/send", {
    method: "POST",
    token: emailVerificationAccessToken,
    body: JSON.stringify({}),
  });

  const activeTokens = await prisma.emailVerificationToken.count({
    where: {
      userId: emailVerificationUserId,
      usedAt: null,
    },
  });

  if (result.data?.emailVerified !== true || activeTokens !== 0) {
    throw new Error(
      "Le renvoi après vérification devrait être idempotent.",
    );
  }

  logSuccess("Verified Email Resend Is Idempotent");
}

async function cleanupEmailVerificationUser() {
  if (!emailVerificationUserId) {
    return;
  }

  await prisma.user.delete({
    where: {
      id: emailVerificationUserId,
    },
  });

  emailVerificationUserId = null;

  logSuccess("Cleanup Email Verification User");
}

/*
|--------------------------------------------------------------------------
| Password resets
|--------------------------------------------------------------------------
*/

async function testCreatePasswordResetUser() {
  const result = await request("/auth/register", {
    method: "POST",
    token: null,
    body: JSON.stringify(passwordResetUser),
  });

  passwordResetUserId = result.data.user.id;
  passwordResetOldRefreshToken = result.data.refreshToken;

  if (!passwordResetUserId || !passwordResetOldRefreshToken) {
    throw new Error(
      "La préparation de l'utilisateur Password Reset a échoué.",
    );
  }

  logSuccess("Create Password Reset User");
}

async function testForgotPasswordEndpoint() {
  const result = await request("/auth/forgot-password", {
    method: "POST",
    token: null,
    body: JSON.stringify({
      email: passwordResetUser.email,
    }),
  });

  const storedToken = await prisma.passwordResetToken.findFirst({
    where: {
      userId: passwordResetUserId,
      usedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (
    result.success !== true ||
    !storedToken ||
    storedToken.tokenHash.length !== 64
  ) {
    throw new Error(
      "La demande de réinitialisation n'a pas créé un jeton haché valide.",
    );
  }

  logSuccess("Request Password Reset");
}

async function testForgotPasswordPreventsEnumeration() {
  const result = await request("/auth/forgot-password", {
    method: "POST",
    token: null,
    body: JSON.stringify({
      email: `unknown_${passwordResetSeed}@test.com`,
    }),
  });

  if (result.success !== true) {
    throw new Error(
      "La réponse générique Password Reset est invalide.",
    );
  }

  logSuccess("Protect Password Reset Account Enumeration");
}

async function testCapturePasswordResetLink() {
  let capturedResetUrl = null;

  await requestPasswordResetForTest(
    passwordResetUser.email,
    async (emailPayload) => {
      capturedResetUrl = emailPayload.resetUrl;
    },
  );

  if (!capturedResetUrl) {
    throw new Error(
      "Le lien de réinitialisation de test n'a pas été capturé.",
    );
  }

  const url = new URL(capturedResetUrl);
  passwordResetRawToken = url.searchParams.get("token");

  if (!passwordResetRawToken || passwordResetRawToken.length !== 64) {
    throw new Error("Le jeton brut Password Reset est invalide.");
  }

  const activeTokens = await prisma.passwordResetToken.count({
    where: {
      userId: passwordResetUserId,
      usedAt: null,
    },
  });

  if (activeTokens !== 1) {
    throw new Error("Un seul jeton Password Reset doit rester actif.");
  }

  logSuccess("Capture Password Reset Link");
}

async function testResetPassword() {
  const result = await request("/auth/reset-password", {
    method: "POST",
    token: null,
    body: JSON.stringify({
      token: passwordResetRawToken,
      password: passwordResetNewPassword,
      confirmPassword: passwordResetNewPassword,
    }),
  });

  if (result.success !== true) {
    throw new Error("La réinitialisation du mot de passe a échoué.");
  }

  logSuccess("Reset Password");
}

async function testRejectOldPassword() {
  try {
    await request("/auth/login", {
      method: "POST",
      token: null,
      body: JSON.stringify({
        email: passwordResetUser.email,
        password: passwordResetUser.password,
      }),
    });
  } catch (error) {
    if (error.status === 401) {
      logSuccess("Reject Old Password");
      return;
    }

    throw error;
  }

  throw new Error("L'ancien mot de passe aurait dû être refusé.");
}

async function testLoginWithResetPassword() {
  const result = await request("/auth/login", {
    method: "POST",
    token: null,
    body: JSON.stringify({
      email: passwordResetUser.email,
      password: passwordResetNewPassword,
    }),
  });

  if (!result.data?.accessToken) {
    throw new Error(
      "La connexion avec le nouveau mot de passe a échoué.",
    );
  }

  logSuccess("Login With Reset Password");
}

async function testRevokeSessionsAfterPasswordReset() {
  try {
    await request("/auth/refresh", {
      method: "POST",
      token: null,
      body: JSON.stringify({
        refreshToken: passwordResetOldRefreshToken,
      }),
    });
  } catch (error) {
    if (error.status === 401) {
      logSuccess("Revoke Sessions After Password Reset");
      return;
    }

    throw error;
  }

  throw new Error("L'ancien refresh token aurait dû être révoqué.");
}

async function testRejectPasswordResetTokenReuse() {
  try {
    await request("/auth/reset-password", {
      method: "POST",
      token: null,
      body: JSON.stringify({
        token: passwordResetRawToken,
        password: "password789",
        confirmPassword: "password789",
      }),
    });
  } catch (error) {
    if (error.status === 400) {
      logSuccess("Reject Password Reset Token Reuse");
      return;
    }

    throw error;
  }

  throw new Error(
    "Un jeton Password Reset déjà utilisé aurait dû être refusé.",
  );
}

async function cleanupPasswordResetUser() {
  if (!passwordResetUserId) {
    return;
  }

  await prisma.user.delete({
    where: {
      id: passwordResetUserId,
    },
  });

  passwordResetUserId = null;

  logSuccess("Cleanup Password Reset User");
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

    console.log("\n--- EMAIL VERIFICATION ---");

    await testCreateEmailVerificationUser();
    await testRequestEmailVerification();
    await testCaptureEmailVerificationLink();
    await testVerifyEmail();
    await testGetVerifiedEmailProfile();
    await testRejectEmailVerificationTokenReuse();
    await testVerifiedEmailResendIsIdempotent();
    await cleanupEmailVerificationUser();

    console.log("\n--- PASSWORD RESETS ---");

    await testCreatePasswordResetUser();
    await testForgotPasswordEndpoint();
    await testForgotPasswordPreventsEnumeration();
    await testCapturePasswordResetLink();
    await testResetPassword();
    await testRejectOldPassword();
    await testLoginWithResetPassword();
    await testRevokeSessionsAfterPasswordReset();
    await testRejectPasswordResetTokenReuse();
    await cleanupPasswordResetUser();

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
    await testCloudinaryMediaLifecycle();

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

    console.log("\n--- GROUP INVITATIONS ---");

    await testGroupInvitationLifecycle();

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

    await testSearchUsers();
    await testRejectShortUserSearch();
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

    console.log("\n--- REPORTS ---");

    await testCreateReport();
    await testGetMyReports();
    await testGetReportById();
    await testRejectDuplicateActiveReport();
    await testProtectReportOwnership();

    console.log("\n--- MODERATION ---");

    await testCreateModeratorUser();
    await testRejectUnauthorizedModerationAccess();
    await testGetModerationReports();
    await testGetModerationReportById();
    await testStartReportReview();
    await testResolveReport();
    await testCreateReportForRejection();
    await testRejectReport();
    await testSuspendUser();
    await testReactivateUser();

    console.log("\n--- FRIENDSHIPS ---");

    await resetFriendshipFixture();
    await testSendFriendRequest();
    await testGetOutgoingFriendRequests();
    await testGetIncomingFriendRequests();
    await testGetFriendRequestNotification();
    await testAcceptFriendRequest();
    await testGetFriendAcceptedNotification();
    await testGetFriends();
    await testFriendsProfileVisibility();
    await testRemoveFriendship();
    await testSendFriendRequestForRejection();
    await testRejectFriendRequest();
    await testReopenFriendRequest();
    await testCancelFriendRequest();

    console.log("\n--- ADMINISTRATION ---");

    await testCreateAdministrationUsers();
    await testRejectUnauthorizedAdministrationAccess();
    await testGetAdministrationStatistics();
    await testGetAdministrationUsers();
    await testGetAdministrationUserById();
    await testUpdateAdministrationUserRole();
    await testRestoreAdministrationUserRole();
    await testSuspendAdministrationTargetUser();
    await testReactivateAdministrationTargetUser();
    await testGetAdministrationPosts();
    await testArchiveAdministrationPost();
    await testRestoreAdministrationPost();
    await testCreateAdministrationGroupFixture();
    await testGetAdministrationGroups();
    await testDeleteAdministrationGroup();
    await testGetAdministrationReports();
    await testGetAdministrationActions();

    console.log("\n--- POST CLEANUP ---");

    await testDeletePost();

    console.log("\n=========================");
    console.log("✅ All API tests passed");
    console.log("=========================\n");
  } catch (error) {
    logError("API test failed", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

await runTests();
