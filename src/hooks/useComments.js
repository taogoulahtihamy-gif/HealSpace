import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createPostComment,
  deletePostComment,
  getPostComments,
  updatePostComment,
} from "../services/api/comments.api.js";
import {
  extractCommentContent,
  mapApiCommentToUiComment,
  mapApiCommentsToUiComments,
} from "../services/api/comment.mapper.js";

function getResponseData(response) {
  return response?.data || response?.comment || response;
}

export function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  const loadComments = useCallback(async () => {
    if (!postId) {
      setComments([]);
      return [];
    }

    try {
      setIsLoadingComments(true);
      setCommentsError(null);

      const response = await getPostComments(postId);
      const mappedComments = mapApiCommentsToUiComments(response);

      setComments(mappedComments);
      return mappedComments;
    } catch (error) {
      setCommentsError(error);
      return [];
    } finally {
      setIsLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = useCallback(
    async (value) => {
      const content = extractCommentContent(value);

      if (!content) {
        return null;
      }

      const response = await createPostComment(postId, {
        content,
        parentId: value?.parentId || undefined,
      });

      const createdComment = mapApiCommentToUiComment(
        getResponseData(response),
      );

      setComments((current) => [
        ...current,
        createdComment,
      ]);

      return createdComment;
    },
    [postId],
  );

  const updateComment = useCallback(
    async (commentId, value) => {
      const content = extractCommentContent(value);

      if (!content) {
        return null;
      }

      const response = await updatePostComment(commentId, {
        content,
      });

      const updatedComment = mapApiCommentToUiComment(
        getResponseData(response),
      );

      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? updatedComment
            : comment,
        ),
      );

      return updatedComment;
    },
    [],
  );

  const deleteComment = useCallback(async (commentId) => {
    await deletePostComment(commentId);

    setComments((current) =>
      current.filter((comment) => comment.id !== commentId),
    );
  }, []);

  return useMemo(
    () => ({
      comments,
      isLoadingComments,
      commentsError,
      loadComments,
      addComment,
      updateComment,
      deleteComment,
    }),
    [
      comments,
      isLoadingComments,
      commentsError,
      loadComments,
      addComment,
      updateComment,
      deleteComment,
    ],
  );
}
