import got from "got";

(async () => {
  // Fetch a signed URL. Pass the API URL and x api key as environmental variables
  const response = await got.get(process.env.API_URL as string, {
    headers: {
      "x-api-key": process.env.X_API_KEY as string,
    },
  });
  const { url } = JSON.parse((await response).body);
  // Create a dummy payload
  const payload = Buffer.from(
    JSON.stringify({ date: new Date().toISOString() })
  );
  // Upload the payload to the S3 bucket
  try {
    const { statusCode } = await got.put(url, { body: payload });
    console.log("upload complete", statusCode);
  } catch (error) {
    console.log(error);
  }
})();
