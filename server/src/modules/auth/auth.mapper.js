export function toSessionUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  };
}

export function toProfileUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    coverPhoto: user.coverPhoto,
    bio: user.bio,
    birthDate: user.birthDate,
    gender: user.gender,
    country: user.country,
    city: user.city,
    language: user.language,
    timezone: user.timezone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}