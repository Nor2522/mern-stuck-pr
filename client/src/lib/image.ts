// Cloudinary: add transformations (f_auto, q_auto, w) to optimize images
// when displaying. Only applies if URL matches `/image/upload/v<version>/...` format.
export const getOptimizedImageUrl = (url: string, width = 800): string => {
  if (!/\/image\/upload\/v\d+/.test(url)) return url
  return url.replace(
    "/image/upload/v",
    `/image/upload/f_auto,q_auto,w_${width}/v`,
  )
}