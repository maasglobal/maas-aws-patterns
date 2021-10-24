import got from "got";

(async () => {
  // Fetch signed URL
  const response = await got.get(process.env.API_URL as string, {
    headers: {
      "x-api-key": process.env.X_API_KEY as string,
    },
  });
  const { url } = JSON.parse((await response).body);
  // Create dummy payload
  const payload = Buffer.from(
    JSON.stringify({ date: new Date().toISOString() })
  );
  // Upload payload to S3
  try {
    const { statusCode } = await got.put(url, { body: payload });
    console.log("upload complete", statusCode);
  } catch (error) {
    console.log(error);
  }
})();
