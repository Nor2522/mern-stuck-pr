import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import type { HydratedDocument } from "mongoose";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.ts";
import { JWT_SECRET } from "../config/env.ts";
import User, { type UserType } from "../models/user.model.ts";
import Post from "../models/post.model.ts";
import Like from "../models/like.model.ts";
import Comment from "../models/comment.model.ts";
import Bookmark from "../models/bookmark.model.ts";
import Report from "../models/report.model.ts";

// Pin the MongoDB binary so the memory server never downloads the dev DB's data.
process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION ?? "7.0.14";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
}, 120000);

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Like.deleteMany({}),
    Comment.deleteMany({}),
    Bookmark.deleteMany({}),
    Report.deleteMany({}),
  ]);
});

type UserDoc = HydratedDocument<UserType>;

const createUser = (overrides: Partial<UserType> & { name: string; email: string }) =>
  User.create({ password: "Passw0rd1", role: "user", ...overrides }) as Promise<UserDoc>;

const signToken = (user: UserDoc) =>
  jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "1h" });

const cookie = (user: UserDoc) => `token=${signToken(user)}`;

const createPost = async (author: UserDoc, title = "A test post") => {
  const res = await request(app)
    .post("/api/post")
    .set("Cookie", cookie(author))
    .send({ title, description: "A description for the test post" });
  return res;
};

describe("auth", () => {
  it("registers, logs in, returns /me, then logs out", async () => {
    const agent = request.agent(app);

    const register = await agent
      .post("/api/user/sign-up")
      .send({ name: "Alice", email: "alice@example.com", password: "Passw0rd1" });
    expect(register.status).toBe(201);

    const login = await agent
      .post("/api/user/login")
      .send({ email: "alice@example.com", password: "Passw0rd1" });
    expect(login.status).toBe(200);
    expect(login.body.userData.user.email).toBe("alice@example.com");

    const me = await agent.get("/api/user/me");
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe("alice@example.com");
    expect(me.body.data.user).not.toHaveProperty("password");

    const logout = await agent.post("/api/user/sign-out");
    expect(logout.status).toBe(200);

    const afterLogout = await agent.get("/api/user/me");
    expect(afterLogout.status).toBe(401);
  });

  it("rejects a NoSQL-injection login body with 400", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({ email: { $ne: null }, password: "x" } as unknown as object);
    expect(res.status).toBe(400);
  });

  it("rejects a duplicate email with 400", async () => {
    await createUser({ name: "Bob", email: "bob@example.com" });
    const res = await request(app)
      .post("/api/user/sign-up")
      .send({ name: "Bobby", email: "bob@example.com", password: "Passw0rd1" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("This email is already taken");
  });
});

describe("posts", () => {
  it("returns a public list of published posts", async () => {
    const author = await createUser({ name: "Author", email: "author@example.com" });
    await createPost(author);

    const res = await request(app).get("/api/post");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.posts)).toBe(true);
    expect(res.body.data.posts.length).toBe(1);
  });

  it("creates a post for the authenticated user (201)", async () => {
    const author = await createUser({ name: "Author", email: "author@example.com" });
    const res = await createPost(author, "Created post");
    expect(res.status).toBe(201);
    expect(res.body.data.post.title).toBe("Created post");
  });

  it("updates the owner's post but returns 403 for a non-owner", async () => {
    const author = await createUser({ name: "Author", email: "author@example.com" });
    const other = await createUser({ name: "Other", email: "other@example.com" });
    const created = await createPost(author, "Original title");
    const postId = created.body.data.post._id as string;

    const ownerUpdate = await request(app)
      .put(`/api/post/${postId}`)
      .set("Cookie", cookie(author))
      .send({ title: "Updated title" });
    expect(ownerUpdate.status).toBe(200);
    expect(ownerUpdate.body.data.post.title).toBe("Updated title");

    const otherUpdate = await request(app)
      .put(`/api/post/${postId}`)
      .set("Cookie", cookie(other))
      .send({ title: "Hijacked" });
    expect(otherUpdate.status).toBe(403);
  });

  it("deletes the owner's post but returns 403 for a non-owner", async () => {
    const author = await createUser({ name: "Author", email: "author@example.com" });
    const other = await createUser({ name: "Other", email: "other@example.com" });
    const created = await createPost(author);
    const postId = created.body.data.post._id as string;

    const otherDelete = await request(app)
      .delete(`/api/post/${postId}`)
      .set("Cookie", cookie(other));
    expect(otherDelete.status).toBe(403);

    const ownerDelete = await request(app)
      .delete(`/api/post/${postId}`)
      .set("Cookie", cookie(author));
    expect(ownerDelete.status).toBe(200);

    const gone = await request(app).get(`/api/post/${postId}`);
    expect(gone.status).toBe(404);
  });
});

describe("admin", () => {
  it("returns 403 for a normal user and 200 for an admin", async () => {
    const user = await createUser({ name: "User", email: "user@example.com" });
    const admin = await createUser({
      name: "Admin",
      email: "admin@example.com",
      role: "admin",
    });

    const forbidden = await request(app)
      .get("/api/admin/stats")
      .set("Cookie", cookie(user));
    expect(forbidden.status).toBe(403);

    const allowed = await request(app)
      .get("/api/admin/stats")
      .set("Cookie", cookie(admin));
    expect(allowed.status).toBe(200);
    expect(allowed.body.data.totals).toBeDefined();
  });

  it("enforces self-protection rules (400)", async () => {
    const admin = await createUser({
      name: "Admin",
      email: "admin@example.com",
      role: "admin",
    });

    const selfRole = await request(app)
      .patch(`/api/admin/users/${admin._id}/role`)
      .set("Cookie", cookie(admin))
      .send({ role: "user" });
    expect(selfRole.status).toBe(400);
    expect(selfRole.body.message).toBe("You cannot change your own role");

    const selfBan = await request(app)
      .patch(`/api/admin/users/${admin._id}/ban`)
      .set("Cookie", cookie(admin))
      .send({ isBanned: true });
    expect(selfBan.status).toBe(400);
    expect(selfBan.body.message).toBe("You cannot ban yourself");
  });

  it("suspends a user so their session is rejected with 403", async () => {
    const admin = await createUser({
      name: "Admin",
      email: "admin@example.com",
      role: "admin",
    });
    const target = await createUser({ name: "Target", email: "target@example.com" });

    const ban = await request(app)
      .patch(`/api/admin/users/${target._id}/ban`)
      .set("Cookie", cookie(admin))
      .send({ isBanned: true });
    expect(ban.status).toBe(200);

    const me = await request(app).get("/api/user/me").set("Cookie", cookie(target));
    expect(me.status).toBe(403);
    expect(me.body.message).toBe("Account suspended");
  });
});

describe("likes and comments", () => {
  it("toggles a like on and off", async () => {
    const author = await createUser({ name: "Author", email: "author@example.com" });
    const created = await createPost(author);
    const postId = created.body.data.post._id as string;

    const like = await request(app)
      .post(`/api/post/${postId}/like`)
      .set("Cookie", cookie(author));
    expect(like.status).toBe(200);
    expect(like.body.data.liked).toBe(true);
    expect(like.body.data.likesCount).toBe(1);

    const unlike = await request(app)
      .post(`/api/post/${postId}/like`)
      .set("Cookie", cookie(author));
    expect(unlike.status).toBe(200);
    expect(unlike.body.data.liked).toBe(false);
    expect(unlike.body.data.likesCount).toBe(0);
  });

  it("adds a comment, lists it, and rejects an empty one (400)", async () => {
    const author = await createUser({ name: "Author", email: "author@example.com" });
    const created = await createPost(author);
    const postId = created.body.data.post._id as string;

    const empty = await request(app)
      .post(`/api/post/${postId}/comments`)
      .set("Cookie", cookie(author))
      .send({ text: "   " });
    expect(empty.status).toBe(400);

    const add = await request(app)
      .post(`/api/post/${postId}/comments`)
      .set("Cookie", cookie(author))
      .send({ text: "Nice post!" });
    expect(add.status).toBe(201);
    expect(add.body.data.comment.text).toBe("Nice post!");

    const list = await request(app).get(`/api/post/${postId}/comments`);
    expect(list.status).toBe(200);
    expect(list.body.data.comments.length).toBe(1);
    expect(list.body.data.comments[0].text).toBe("Nice post!");
  });
});
