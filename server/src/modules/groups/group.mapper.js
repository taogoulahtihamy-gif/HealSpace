function mapUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username ?? null,
    displayName: user.displayName ?? user.name ?? null,
    avatarUrl: user.avatarUrl ?? user.profilePicture ?? null,
  };
}

export function mapGroupMember(member) {
  if (!member) {
    return null;
  }

  return {
    id: member.id,
    role: member.role,
    joinedAt: member.joinedAt,
    user: mapUser(member.user),
  };
}

export function mapGroup(group, currentUserId = null) {
  if (!group) {
    return null;
  }

  const currentMembership = currentUserId
    ? group.members?.find((member) => member.userId === currentUserId)
    : null;

  return {
    id: group.id,
    name: group.name,
    slug: group.slug,
    description: group.description,
    coverUrl: group.coverUrl,
    visibility: group.visibility,
    owner: mapUser(group.owner),
    memberCount: group._count?.members ?? group.members?.length ?? 0,
    currentUserRole: currentMembership?.role ?? null,
    isMember: Boolean(currentMembership),
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

export function mapGroupDetails(group, currentUserId = null) {
  const mappedGroup = mapGroup(group, currentUserId);

  if (!mappedGroup) {
    return null;
  }

  return {
    ...mappedGroup,
    members: Array.isArray(group.members)
      ? group.members.map(mapGroupMember)
      : [],
  };
}
