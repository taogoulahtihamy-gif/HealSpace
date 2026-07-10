export const commonParameters = {
  PageQuery: {
    name: "page",
    in: "query",
    required: false,
    schema: {
      type: "integer",
      minimum: 1,
      default: 1,
    },
  },
  LimitQuery: {
    name: "limit",
    in: "query",
    required: false,
    schema: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      default: 20,
    },
  },
  IdPath: {
    name: "id",
    in: "path",
    required: true,
    schema: {
      type: "string",
    },
  },
};
