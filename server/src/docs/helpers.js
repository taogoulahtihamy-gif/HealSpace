export function successResponse(
  description,
  schemaRef = "#/components/schemas/ApiSuccess",
) {
  return {
    description,
    content: {
      "application/json": {
        schema: {
          $ref: schemaRef,
        },
      },
    },
  };
}

export function secured(operation) {
  return {
    security: [
      {
        bearerAuth: [],
      },
    ],
    ...operation,
  };
}

export function paginatedQueryParameters() {
  return [
    {
      $ref: "#/components/parameters/PageQuery",
    },
    {
      $ref: "#/components/parameters/LimitQuery",
    },
  ];
}

export function pathParam(name, description) {
  return {
    name,
    in: "path",
    required: true,
    description,
    schema: {
      type: "string",
    },
  };
}

export function queryParam(
  name,
  description,
  schema = {
    type: "string",
  },
) {
  return {
    name,
    in: "query",
    required: false,
    description,
    schema,
  };
}

export function jsonRequestBody(schema, required = true) {
  return {
    required,
    content: {
      "application/json": {
        schema,
      },
    },
  };
}
