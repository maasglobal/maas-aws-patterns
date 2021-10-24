import got from "got";
import * as crypto from "crypto";

(async () => {
  // Fetch signed URL
  const response = await got.get(process.env.API_URL as string, {
    headers: {
      "x-api-key": process.env.X_API_KEY as string,
    },
  });
  const { url } = JSON.parse((await response).body);
  // const url = 'https://example-s3-upload-file-bucket-1hret49y785kj.s3.eu-west-1.amazonaws.com/upload/5e824ad9-c1ac-488f-bde5-c52870c1dcbb?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIASCOBWLIA6B5B74OR%2F20211024%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20211024T195827Z&X-Amz-Expires=900&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCWV1LXdlc3QtMSJGMEQCIFA5J1tY2d7T7vh7OgzB61ApHrW2YkDV%2Fxfq5Dts%2FtQpAiA2uNl632UqMQv5hrEVu2aNBr5GDeG2TjkYmjf%2BjxK%2FByrAAghNEAMaDDE0MjY3NzAwNjg0OSIMAmnU%2BdNwcNXoefPQKp0CCkrpPQ9Tc0KOKlTPY17EfpYIbM1QniFYlWkh9SoAViUDFCQFLQUuF8kjocUcAeI5pmu7EXolHb6a70u9wwK2yeXiyRoIgNv1YE1gN5KTKEETipX3SNcgAen%2FaesSskEU6HcIVmnn5xSOO%2FDIyBMYzBlZW8axQ6B5f%2BM8X8ixCgW%2BZ7oAQ%2FaY4uq%2BLxep%2B2108CuA8mKC0rOj3Kzo9DmX9b9g1U3ePSn2gSdwwW8P8EHs7sOe5HSnLGiYQpCViI2W6J6kVe%2BVGgvhG154dslGg%2BTDIpJlj%2BEy7xXBa%2BLtZ4AlfOr9ANyGGDChEP5b9ZkXSXfYTU1wck5462Bfrc1Oz1g6aUUfqlG63mq9oEIt6hrBo9AuPhQzZfnFcX2kMOP11osGOpsBxGMoZjEr1MSAWzbnCeHvTzaM1NZUeB%2FY9e39IpLDYx9voRFYuGihDXIUP%2FAu4OeTvFox1IptQeaoXfQV9a3%2BZ0BrxZOtDN9KKHZ0exEfsrWQahWS72rsNqAARjoYmfZgDv213bgjqZQPBkuSfoZsBexlj27%2FtfRt9NeDnpOB4B3JclhwXpn1OkyoXPQqmjmriFsDe%2FWdcySDqOI%3D&X-Amz-Signature=cb1dd3450b9fc965a204431404f36b19e3d17b1107a8e54121584a52a3345e7b&X-Amz-SignedHeaders=host&x-id=PutObject'
  console.log(url);
  // Create dummy payload
  const payload = Buffer.from(
    JSON.stringify({ date: new Date().toISOString() })
  );
  // Upload payload to S3
  try {
    const hash = crypto.createHash("md5").update(payload).digest("base64");
    console.log(hash)
    const { statusCode } = await got.put(url, {
      body: payload,
      headers: { "Content-MD5": hash },
    });
    console.log("upload complete", statusCode);
  } catch (error) {
    console.log(error);
  }
})();
