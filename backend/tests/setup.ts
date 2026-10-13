// Test preload (see bunfig.toml): provide harmless defaults so the suite runs
// on a fresh clone with no backend/.env. Tests use an in-memory MongoDB and
// never the dev database, so these values only satisfy env validation.
process.env.MONGODB_URI ??= "mongodb://127.0.0.1:27017/devmotiv-test";
process.env.JWT_SECRET ??= "test-secret";
process.env.JWT_EXPIRES_IN ??= "30d";
process.env.CLOUDINARY_CLOUD_NAME ??= "test-cloud";
process.env.CLOUDINARY_API_KEY ??= "test-key";
process.env.CLOUDINARY_API_SECRET ??= "test-secret";
