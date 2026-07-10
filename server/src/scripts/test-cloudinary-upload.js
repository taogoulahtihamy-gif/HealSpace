const API_URL = "http://localhost:5000/api";

const testUser = {
  firstName: "Cloudinary",
  lastName: "Test",
  username: "healspace_cloudinary_test",
  email: "healspace_cloudinary_test@test.com",
  password: "password123",
};

let accessToken = null;
let mediaId = null;

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

async function registerOrLogin() {
  try {
    const result = await request("/auth/register", {
      method: "POST",
      token: null,
      body: JSON.stringify(testUser),
    });

    accessToken = result.data.accessToken;
  } catch (error) {
    if (error.status !== 409) {
      throw error;
    }

    const result = await request("/auth/login", {
      method: "POST",
      token: null,
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    accessToken = result.data.accessToken;
  }
}

async function uploadMedia() {
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB" +
      "CAQAAAC1HAwCAAAAC0lEQVR42mP8/x8A" +
      "AgMBAp9Z5ZkAAAAASUVORK5CYII=",
    "base64",
  );

  const formData = new FormData();

  formData.append(
    "file",
    new Blob([png], { type: "image/png" }),
    "healspace-cloudinary-test.png",
  );

  const result = await request("/media/upload", {
    method: "POST",
    body: formData,
  });

  mediaId = result.data?.id;

  if (!mediaId || !result.data?.url?.includes("res.cloudinary.com")) {
    throw new Error("Réponse Cloudinary invalide.");
  }

  console.log("✅ Upload Cloudinary");
}

async function deleteMedia() {
  await request(`/media/${mediaId}`, {
    method: "DELETE",
  });

  console.log("✅ Delete Cloudinary");
}

async function run() {
  await registerOrLogin();
  await uploadMedia();
  await deleteMedia();

  console.log("✅ Cloudinary media test passed");
}

run().catch((error) => {
  console.error("❌ Cloudinary media test failed");
  console.error(error);
  process.exitCode = 1;
});
