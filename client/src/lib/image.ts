// Cloudinary: ku dar transformations (f_auto, q_auto, w) si sawirka ugu yaraado
// marka uu la soo galo. Waxaan oggolayn karnaa haddii URL-ka uu yahay qaabka
// `/image/upload/v<version>/...` ee caadiga ah.
export const getOptimizedImageUrl = (url: string, width = 800): string => {
  if (!/\/image\/upload\/v\d+/.test(url)) return url
  return url.replace(
    "/image/upload/v",
    `/image/upload/f_auto,q_auto,w_${width}/v`,
  )
}