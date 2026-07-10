const baseUrl =
  process.env.RENDER_EXTERNAL_URL ||
  process.env.API_BASE_URL ||
  `http://127.0.0.1:${process.env.PORT || 5000}`;

async function run() {
  const response = await fetch(`${baseUrl}/api/health`);

  if (!response.ok) {
    throw new Error(
      `Healthcheck failed with status ${response.status}`,
    );
  }

  const body = await response.json();

  console.log("Render healthcheck OK");
  console.log(body);
}

run().catch((error) => {
  console.error("Render healthcheck failed");
  console.error(error.message);
  process.exitCode = 1;
});
