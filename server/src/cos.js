import COS from "cos-nodejs-sdk-v5";

export function createCosClient({ secretId, secretKey }) {
  return new COS({
    SecretId: secretId,
    SecretKey: secretKey,
  });
}

export async function putObject({ cos, bucket, region, key, buffer, contentType }) {
  return cos.putObject({
    Bucket: bucket,
    Region: region,
    Key: key,
    Body: buffer,
    ContentType: contentType || "application/octet-stream",
  });
}

