export const commonSchemas = {
  ApiSuccess: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        nullable: true,
      },
      data: {
        nullable: true,
      },
    },
  },

  ErrorResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false,
      },
      message: {
        type: "string",
        example: "Une erreur est survenue.",
      },
      requestId: {
        type: "string",
        nullable: true,
        example: "e52d92dd-3d1a-4cf7-9c72-72a94bb5d621",
      },
    },
  },

  Pagination: {
    type: "object",
    properties: {
      page: {
        type: "integer",
        example: 1,
      },
      limit: {
        type: "integer",
        example: 20,
      },
      total: {
        type: "integer",
        example: 42,
      },
      totalPages: {
        type: "integer",
        example: 3,
      },
    },
  },

  UserPublic: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      firstName: {
        type: "string",
        example: "Ezekiel",
      },
      lastName: {
        type: "string",
        example: "Test",
      },
      username: {
        type: "string",
        example: "ezekiel_test",
      },
      email: {
        type: "string",
        format: "email",
        nullable: true,
      },
      avatar: {
        type: "string",
        nullable: true,
      },
      bio: {
        type: "string",
        nullable: true,
      },
      country: {
        type: "string",
        nullable: true,
      },
      city: {
        type: "string",
        nullable: true,
      },
      currentMood: {
        $ref: "#/components/schemas/MoodType",
      },
      role: {
        $ref: "#/components/schemas/UserRole",
      },
      status: {
        $ref: "#/components/schemas/UserStatus",
      },
      visibility: {
        $ref: "#/components/schemas/Visibility",
      },
      isVerified: {
        type: "boolean",
      },
      emailVerified: {
        type: "boolean",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  AuthSession: {
    type: "object",
    properties: {
      user: {
        $ref: "#/components/schemas/UserPublic",
      },
      accessToken: {
        type: "string",
      },
      refreshToken: {
        type: "string",
      },
    },
  },

  Session: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      isCurrent: {
        type: "boolean",
      },
      device: {
        type: "string",
        nullable: true,
      },
      browser: {
        type: "string",
        nullable: true,
      },
      os: {
        type: "string",
        nullable: true,
      },
      ipAddress: {
        type: "string",
        nullable: true,
      },
      lastUsedAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      expiresAt: {
        type: "string",
        format: "date-time",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  Post: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      content: {
        type: "string",
      },
      mood: {
        $ref: "#/components/schemas/MoodType",
      },
      intention: {
        type: "string",
        enum: ["BE_LISTENED", "RECEIVE_ADVICE", "FIND_SIMILAR_PEOPLE"],
      },
      visibility: {
        type: "string",
        enum: ["PUBLIC", "GROUP", "PRIVATE"],
      },
      status: {
        type: "string",
        enum: ["PUBLISHED", "DRAFT", "ARCHIVED", "DELETED"],
      },
      isAnonymous: {
        type: "boolean",
      },
      author: {
        $ref: "#/components/schemas/UserPublic",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  Comment: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      postId: {
        type: "string",
      },
      parentId: {
        type: "string",
        nullable: true,
      },
      content: {
        type: "string",
      },
      author: {
        $ref: "#/components/schemas/UserPublic",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  Reaction: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      postId: {
        type: "string",
      },
      userId: {
        type: "string",
      },
      type: {
        type: "string",
        enum: [
          "LIKE",
          "LOVE",
          "HUG",
          "SUPPORT",
          "THANKS",
          "INSIGHTFUL",
        ],
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  Conversation: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      type: {
        type: "string",
        enum: ["DIRECT", "GROUP"],
      },
      title: {
        type: "string",
        nullable: true,
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  Message: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      conversationId: {
        type: "string",
      },
      senderId: {
        type: "string",
      },
      content: {
        type: "string",
      },
      isRead: {
        type: "boolean",
      },
      readAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  Media: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      ownerId: {
        type: "string",
      },
      postId: {
        type: "string",
        nullable: true,
      },
      url: {
        type: "string",
        format: "uri",
      },
      publicId: {
        type: "string",
        nullable: true,
      },
      type: {
        type: "string",
        enum: ["IMAGE", "VIDEO", "AUDIO", "FILE"],
      },
      mimeType: {
        type: "string",
        nullable: true,
      },
      size: {
        type: "integer",
        nullable: true,
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  Group: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      name: {
        type: "string",
      },
      slug: {
        type: "string",
      },
      description: {
        type: "string",
        nullable: true,
      },
      visibility: {
        type: "string",
        enum: ["PUBLIC", "PRIVATE"],
      },
      owner: {
        $ref: "#/components/schemas/UserPublic",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  GroupInvitation: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      groupId: {
        type: "string",
      },
      inviterId: {
        type: "string",
      },
      inviteeId: {
        type: "string",
      },
      status: {
        type: "string",
        enum: [
          "PENDING",
          "ACCEPTED",
          "REJECTED",
          "CANCELLED",
          "EXPIRED",
        ],
      },
      expiresAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  JournalEntry: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      title: {
        type: "string",
        nullable: true,
      },
      content: {
        type: "string",
      },
      mood: {
        $ref: "#/components/schemas/MoodType",
      },
      intensity: {
        type: "integer",
        nullable: true,
        minimum: 1,
        maximum: 10,
      },
      occurredAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  Notification: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      type: {
        type: "string",
      },
      title: {
        type: "string",
      },
      message: {
        type: "string",
      },
      data: {
        type: "object",
        nullable: true,
      },
      isRead: {
        type: "boolean",
      },
      createdAt: {
        type: "string",
        format: "date-time",
      },
    },
  },

  SupportRequest: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      type: {
        type: "string",
        enum: ["LISTENING", "ADVICE", "ENCOURAGEMENT", "CHECK_IN"],
      },
      message: {
        type: "string",
      },
      isAnonymous: {
        type: "boolean",
      },
      status: {
        type: "string",
        enum: ["OPEN", "ACCEPTED", "COMPLETED", "CANCELLED"],
      },
    },
  },

  Report: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      targetType: {
        type: "string",
        enum: ["USER", "POST", "COMMENT", "MESSAGE", "GROUP"],
      },
      targetId: {
        type: "string",
      },
      reason: {
        type: "string",
      },
      status: {
        type: "string",
        enum: ["PENDING", "UNDER_REVIEW", "RESOLVED", "REJECTED"],
      },
    },
  },

  MoodType: {
    type: "string",
    enum: [
      "HAPPY",
      "CALM",
      "STRESSED",
      "SAD",
      "ANXIOUS",
      "ANGRY",
      "MOTIVATED",
      "EXHAUSTED",
    ],
  },

  UserRole: {
    type: "string",
    enum: ["USER", "MODERATOR", "PSYCHOLOGIST", "ADMIN"],
  },

  UserStatus: {
    type: "string",
    enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"],
  },

  Visibility: {
    type: "string",
    enum: ["PUBLIC", "FRIENDS", "PRIVATE"],
  },
};
