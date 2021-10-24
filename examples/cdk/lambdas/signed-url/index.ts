import { APIGatewayProxyEvent } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const client = new S3Client({
  region:
    process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'eu-west-1',
});
export const handler = async (event: APIGatewayProxyEvent) => {
  console.log(JSON.stringify(event, null, 2));
  const url = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: process.env.BUCKET,
      Key: `upload/${uuidv4()}`,
    }),
    { expiresIn: 900 }
  );
  return {
    statusCode: 200,
    body: JSON.stringify({ url }),
  };
};
