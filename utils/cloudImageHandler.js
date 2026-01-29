export async function getCloudImageTempUrl(images) {
  return Array.isArray(images) ? [...images] : [];
}

export async function getSingleCloudImageTempUrl(image) {
  return image;
}
