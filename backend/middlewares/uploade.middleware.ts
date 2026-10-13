import multer from "multer";
import { HttpError } from "./error.middleware";

// Explicit allowlist (mimetype is client-provided, so never trust the wildcard).
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const uploade = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5MB, a single image
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, "Only JPEG, PNG, WebP or GIF images are allowed"));
  },
});

export default uploade;
