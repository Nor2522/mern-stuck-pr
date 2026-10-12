export const getPostUrl = (id: string) =>
  typeof window === "undefined"
    ? `/posts/${id}`
    : `${window.location.origin}/posts/${id}`

export const getShareTargets = (id: string, title: string) => {
  const url = getPostUrl(id)
  const text = encodeURIComponent(title)
  const encoded = encodeURIComponent(url)

  return [
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`,
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
    },
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${text}%20${encoded}`,
    },
  ] as const
}
