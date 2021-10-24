import got from "got";

(async () => {
  // Fetch signed URL
  const response = await got.get(process.env.API_URL as string);
  const { url } = JSON.parse((await response).body);
  // Create dummy payload
  const payload = Buffer.from(
    JSON.stringify({ date: new Date().toISOString() })
  );
  // Upload payload to S3
  try {
    await got.put(url, { body: payload });
  } catch (error) {
    console.log(error);
  }
})();
