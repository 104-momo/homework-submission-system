import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const cosSecretId = import.meta.env.VITE_COS_SECRET_ID;
const cosSecretKey = import.meta.env.VITE_COS_SECRET_KEY;
const cosBucket = import.meta.env.VITE_COS_BUCKET;
const cosRegion = import.meta.env.VITE_COS_REGION;

export const hasCos = !!(cosSecretId && cosSecretKey && cosBucket && cosRegion);

export const cosClient = hasCos
  ? new S3Client({
      region: cosRegion,
      endpoint: `https://${cosBucket}.cos.${cosRegion}.myqcloud.com`,
      credentials: {
        accessKeyId: cosSecretId,
        secretAccessKey: cosSecretKey,
      },
      forcePathStyle: false,
    })
  : null;

export async function uploadToCos(file: File, path: string): Promise<string> {
  if (!cosClient || !cosBucket || !cosRegion) {
    throw new Error('COS not configured');
  }

  // Convert File to ArrayBuffer for browser compatibility
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: cosBucket,
    Key: path,
    Body: uint8Array,
    ContentType: file.type,
    ACL: 'public-read',
  });

  await cosClient.send(command);

  return `https://${cosBucket}.cos.${cosRegion}.myqcloud.com/${path}`;
}

export function getCosPublicUrl(path: string): string {
  if (cosBucket && cosRegion) {
    return `https://${cosBucket}.cos.${cosRegion}.myqcloud.com/${path}`;
  }
  return path;
}
