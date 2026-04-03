export function optimizeCloudinaryUrl(url: string, transformations: string = "f_auto,q_auto") {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  // Typical upload string: https://res.cloudinary.com/CLOUD_NAME/image/upload/v1234567/filename.jpg
  // We want to insert transformations after /upload/
  if (url.includes("/upload/")) {
    // If it already has transformations, let's not double inject unless we parse it.
    // simpler: if it doesn't have f_auto, let's inject.
    if (!url.includes("f_auto")) {
      return url.replace("/upload/", `/upload/${transformations}/`);
    }
  }

  return url;
}
