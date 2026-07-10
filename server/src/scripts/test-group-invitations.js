import "dotenv/config";
import { prisma } from "../src/config/prisma.js";

const API_URL = process.env.API_URL || "http://localhost:5000/api";

const seed = Date.now();

const ownerUser = {
  firstName: "Group",
  lastName: "Owner",
  username: `group_owner_${seed}`,
  email: `group_owner_${seed}@test.com`,
  password: "password123",
};

const inviteeUser = {
  firstName: "Group",
  lastName: "Invitee",
  username: `group_invitee_${seed}`,
  email: `group_invitee_${seed}@test.com`,
  password: "password123",
};

const outsiderUser = {
  firstName: "Group",
  lastName: "Outsider",
  username: `group_outsider_${seed}`,
  email: `group_outsider_${seed}@test.com`,
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

async function expectStatus(action, expectedStatus, label) {
  try {
    await action();
  } catch (error) {
    if (error.status === expectedStatus) {
      console.log(`✅ ${label}`);
      return;
    }

    throw error;
  }

  throw new Error(`${label}: statut ${expectedStatus} attendu.`);
}

async function register(user) {
  const result = await request("/auth/register", {
    method: "POST",
    body: user,
  });

  return result.data;
}

async function run() {
  let owner = null;
  let invitee = null;
  let outsider = null;
  let privateGroupId = null;
  let publicGroupId = null;
  let acceptedMemberId = null;

  try {
    owner = await register(ownerUser);
    invitee = await register(inviteeUser);
    outsider = await register(outsiderUser);

    console.log("✅ Group invitation users created");

    const privateGroup = await request("/groups", {
      method: "POST",
      token: owner.accessToken,
      body: {
        name: `Private Invitation Group ${seed}`,
        description: "Groupe privé de test.",
        visibility: "PRIVATE",
      },
    });

    privateGroupId = privateGroup.data.id;

    const publicGroup = await request("/groups", {
      method: "POST",
      token: owner.accessToken,
      body: {
        name: `Public Invitation Group ${seed}`,
        description: "Groupe public de test.",
        visibility: "PUBLIC",
      },
    });

    publicGroupId = publicGroup.data.id;

    console.log("✅ Group invitation fixtures created");

    await expectStatus(
      () =>
        request(`/groups/${publicGroupId}/invitations`, {
          method: "POST",
          token: owner.accessToken,
          body: {
            inviteeId: invitee.user.id,
          },
        }),
      422,
      "Public group invitation rejected",
    );

    await expectStatus(
      () =>
        request(`/groups/${privateGroupId}/invitations`, {
          method: "POST",
          token: outsider.accessToken,
          body: {
            inviteeId: invitee.user.id,
          },
        }),
      403,
      "Unauthorized invitation rejected",
    );

    const firstInvitation = await request(
      `/groups/${privateGroupId}/invitations`,
      {
        method: "POST",
        token: owner.accessToken,
        body: {
          inviteeId: invitee.user.id,
        },
      },
    );

    const firstInvitationId = firstInvitation.data.id;

    if (
      firstInvitation.data.status !== "PENDING" ||
      firstInvitation.data.groupId !== privateGroupId
    ) {
      throw new Error("L'invitation créée est invalide.");
    }

    console.log("✅ Private group invitation created");

    await expectStatus(
      () =>
        request(`/groups/${privateGroupId}/invitations`, {
          method: "POST",
          token: owner.accessToken,
          body: {
            inviteeId: invitee.user.id,
          },
        }),
      409,
      "Duplicate active invitation rejected",
    );

    const mine = await request(
      "/groups/invitations/mine?status=PENDING&page=1&limit=20",
      {
        token: invitee.accessToken,
      },
    );

    if (
      !mine.data.items.some((item) => item.id === firstInvitationId)
    ) {
      throw new Error(
        "L'invitation n'apparaît pas dans la liste du destinataire.",
      );
    }

    console.log("✅ Recipient invitation list validated");

    const inviteeNotifications = await request(
      "/notifications?type=GROUP_INVITATION&page=1&limit=20",
      {
        token: invitee.accessToken,
      },
    );

    if (
      !inviteeNotifications.data.items.some(
        (item) =>
          item.data?.invitationId === firstInvitationId &&
          item.actor?.id === owner.user.id,
      )
    ) {
      throw new Error("La notification d'invitation est absente.");
    }

    console.log("✅ Invitation notification validated");

    const accepted = await request(
      `/groups/invitations/${firstInvitationId}/accept`,
      {
        method: "PATCH",
        token: invitee.accessToken,
      },
    );

    acceptedMemberId = accepted.data.membership?.id;

    if (accepted.data.status !== "ACCEPTED" || !acceptedMemberId) {
      throw new Error("L'acceptation de l'invitation est invalide.");
    }

    console.log("✅ Group invitation accepted");

    const ownerNotifications = await request(
      "/notifications?type=GROUP_INVITATION_ACCEPTED&page=1&limit=20",
      {
        token: owner.accessToken,
      },
    );

    if (
      !ownerNotifications.data.items.some(
        (item) =>
          item.data?.invitationId === firstInvitationId &&
          item.actor?.id === invitee.user.id,
      )
    ) {
      throw new Error("La notification d'acceptation est absente.");
    }

    console.log("✅ Acceptance notification validated");

    await request(
      `/groups/${privateGroupId}/members/${acceptedMemberId}`,
      {
        method: "DELETE",
        token: owner.accessToken,
      },
    );

    acceptedMemberId = null;

    const rejectionInvitation = await request(
      `/groups/${privateGroupId}/invitations`,
      {
        method: "POST",
        token: owner.accessToken,
        body: {
          inviteeId: invitee.user.id,
        },
      },
    );

    const rejected = await request(
      `/groups/invitations/${rejectionInvitation.data.id}/reject`,
      {
        method: "PATCH",
        token: invitee.accessToken,
      },
    );

    if (rejected.data.status !== "REJECTED") {
      throw new Error("Le refus de l'invitation a échoué.");
    }

    console.log("✅ Group invitation rejected");

    const cancellationInvitation = await request(
      `/groups/${privateGroupId}/invitations`,
      {
        method: "POST",
        token: owner.accessToken,
        body: {
          inviteeId: invitee.user.id,
        },
      },
    );

    const cancelled = await request(
      `/groups/${privateGroupId}/invitations/${cancellationInvitation.data.id}`,
      {
        method: "DELETE",
        token: owner.accessToken,
      },
    );

    if (cancelled.data.status !== "CANCELLED") {
      throw new Error("L'annulation de l'invitation a échoué.");
    }

    console.log("✅ Group invitation cancelled");

    const expiringInvitation = await request(
      `/groups/${privateGroupId}/invitations`,
      {
        method: "POST",
        token: owner.accessToken,
        body: {
          inviteeId: invitee.user.id,
        },
      },
    );

    await prisma.groupInvitation.update({
      where: {
        id: expiringInvitation.data.id,
      },
      data: {
        expiresAt: new Date(Date.now() - 60_000),
      },
    });

    await expectStatus(
      () =>
        request(
          `/groups/invitations/${expiringInvitation.data.id}/accept`,
          {
            method: "PATCH",
            token: invitee.accessToken,
          },
        ),
      410,
      "Expired invitation rejected",
    );

    console.log("✅ Group invitation API test passed");
  } finally {
    if (acceptedMemberId && privateGroupId && owner) {
      await Promise.allSettled([
        request(
          `/groups/${privateGroupId}/members/${acceptedMemberId}`,
          {
            method: "DELETE",
            token: owner.accessToken,
          },
        ),
      ]);
    }

    if (owner) {
      await Promise.allSettled(
        [privateGroupId, publicGroupId].filter(Boolean).map((groupId) =>
          request(`/groups/${groupId}`, {
            method: "DELETE",
            token: owner.accessToken,
          }),
        ),
      );
    }

    await prisma.$disconnect();
  }
}

run().catch((error) => {
  console.error("❌ Group invitation API test failed");
  console.error(error);
  process.exitCode = 1;
});
