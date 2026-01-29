import COS from "cos-nodejs-sdk-v5";

export function createCosClient({ secretId, secretKey }) {
  if (!secretId || !secretKey) return null;
  return new COS({
    SecretId: secretId,
    SecretKey: secretKey,
  });
}

export async function putObject({ cos, bucket, region, key, buffer, contentType }) {
  if (!cos) throw new Error("COS_NOT_CONFIGURED");
  return cos.putObject({
    Bucket: bucket,
    Region: region,
    Key: key,
    Body: buffer,
    ContentType: contentType || "application/octet-stream",
  });
}
