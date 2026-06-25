import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const storjAccessKey = import.meta.env.VITE_STORJ_ACCESS_KEY;
const storjSecretKey = import.meta.env.VITE_STORJ_SECRET_KEY;
const storjBucket = import.meta.env.VITE_STORJ_BUCKET;
const storjEndpoint = import.meta.env.VITE_STORJ_ENDPOINT;
const storjPublicUrl = import.meta.env.VITE_STORJ_PUBLIC_URL;

export const hasStorj = !!(storjAccessKey && storjSecretKey && storjBucket && storjEndpoint);

export const storjClient = hasStorj
  ? new S3Client({
      region: 'us1',
      endpoint: storjEndpoint,
      credentials: {
        accessKeyId: storjAccessKey,
        secretAccessKey: storjSecretKey,
      },
      forcePathStyle: true,
    })
  : null;

export async function uploadToStorj(file: File, path: string): Promise<string> {
  if (!storjClient || !storjBucket) {
    throw new Error('Storj not configured');
  }

  const command = new PutObjectCommand({
    Bucket: storjBucket,
    Key: path,
    Body: file,
    ContentType: file.type,
  });

  await storjClient.send(command);

  if (storjPublicUrl) {
    return `${storjPublicUrl}/${path}`;
  }

  return `${storjEndpoint}/${storjBucket}/${path}`;
}

export function getStorjPublicUrl(path: string): string {
  if (storjPublicUrl) {
    return `${storjPublicUrl}/${path}`;
  }
  if (storjEndpoint && storjBucket) {
    return `${storjEndpoint}/${storjBucket}/${path}`;
  }
  return path;
}
