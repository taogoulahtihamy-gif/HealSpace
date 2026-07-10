import { AppError } from "../../../core/errors/AppError.js";
import {
  createPost,
  findPostById,
  findPosts,
  updatePost,
  softDeletePost,
} from "./post.repository.js";
import { toPostResponse, toPostListResponse } from "./post.mapper.js";
import { POST_MESSAGES } from "./post.constants.js";

export async function createPostService(userId, payload) {
  const post = await createPost({
    authorId: userId,
    content: payload.content,
    mood: payload.mood,
    intention: payload.intention,
    visibility: payload.visibility || "PUBLIC",
    isAnonymous: payload.isAnonymous || false,
  });

  return toPostResponse(post);
}

export async function getPostsService() {
  const posts = await findPosts();

  return toPostListResponse(posts);
}

export async function getPostByIdService(postId) {
  const post = await findPostById(postId);

  if (!post || post.deletedAt) {
    throw new AppError(POST_MESSAGES.NOT_FOUND, 404);
  }

  return toPostResponse(post);
}

export async function updatePostService(userId, postId, payload) {
  const post = await findPostById(postId);

  if (!post || post.deletedAt) {
    throw new AppError(POST_MESSAGES.NOT_FOUND, 404);
  }

  if (post.authorId !== userId) {
    throw new AppError(POST_MESSAGES.FORBIDDEN, 403);
  }

  const updatedPost = await updatePost(postId, {
    content: payload.content,
    mood: payload.mood,
    intention: payload.intention,
    visibility: payload.visibility,
    isAnonymous: payload.isAnonymous,
  });

  return toPostResponse(updatedPost);
}

export async function deletePostService(userId, postId) {
  const post = await findPostById(postId);

  if (!post || post.deletedAt) {
    throw new AppError(POST_MESSAGES.NOT_FOUND, 404);
  }

  if (post.authorId !== userId) {
    throw new AppError(POST_MESSAGES.FORBIDDEN, 403);
  }

  await softDeletePost(postId);

  return null;
}
