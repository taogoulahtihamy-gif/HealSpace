function mapUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    avatar: user.avatar,
  };
}

function mapGroup(group) {
  if (!group) {
    return null;
  }

  return {
    id: group.id,
    name: group.name,
    slug: group.slug,
    visibility: group.visibility,
    ownerId: group.ownerId,
  };
}

function mapMembership(membership) {
  if (!membership) {
    return null;
  }

  return {
    id: membership.id,
    groupId: membership.groupId,
    userId: membership.userId,
    role: membership.role,
    joinedAt: membership.joinedAt,
    user: mapUser(membership.user),
  };
}

export function mapGroupInvitation(invitation, membership = null) {
  if (!invitation) {
    return null;
  }

  const isExpired =
    invitation.status === "EXPIRED" ||
    (invitation.status === "PENDING" &&
      new Date(invitation.expiresAt).getTime() <= Date.now());

  return {
    id: invitation.id,
    status: invitation.status,
    groupId: invitation.groupId,
    inviterId: invitation.inviterId,
    inviteeId: invitation.inviteeId,
    expiresAt: invitation.expiresAt,
    respondedAt: invitation.respondedAt,
    cancelledAt: invitation.cancelledAt,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
    isExpired,
    canRespond: invitation.status === "PENDING" && !isExpired,
    group: mapGroup(invitation.group),
    inviter: mapUser(invitation.inviter),
    invitee: mapUser(invitation.invitee),
    membership: mapMembership(membership),
  };
}

export function mapGroupInvitationList(items) {
  return items.map((item) => mapGroupInvitation(item));
}
