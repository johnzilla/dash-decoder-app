import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  forcePathStyle: false,
  endpoint: `https://${process.env.SPACES_REGION}.digitaloceanspaces.com`,
  region: 'us-east-1', // required by SDK even for DO Spaces
  credentials: {
    accessKeyId: process.env.SPACES_KEY!,
    secretAccessKey: process.env.SPACES_SECRET!,
  },
});

/**
 * Upload a buffer to DO Spaces and return the CDN URL.
 * Per D-07: the returned CDN URL is what gets sent to OpenAI (no base64).
 */
export async function uploadToSpaces(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.SPACES_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  }));
  // CDN URL format for DO Spaces
  return `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_REGION}.cdn.digitaloceanspaces.com/${key}`;
}
