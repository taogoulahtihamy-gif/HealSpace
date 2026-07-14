import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createPost,
  deletePost as deletePostRequest,
  getPosts,
  updatePost as updatePostRequest,
} from "../services/api/posts.api.js";
import { uploadMedia } from "../services/api/media.api.js";
import { getAccessToken } from "../services/api/tokenStorage.js";
import {
  mapApiPostToFeedPost,
  mapApiPostsToFeedPosts,
  mapFeedPayloadToApiPost,
  mergePostForUpdate,
} from "../services/api/post.mapper.js";
import { commentService } from "../services/commentService.js";
import { likeService } from "../services/likeService.js";
import { useAuth } from "../hooks/useAuth.js";
import { useNotifications } from "../hooks/useNotifications.js";

export const PostsContext = createContext(null);

function getErrorMessage(error, fallback) {
  return (
    error?.body?.message ||
    error?.message ||
    fallback ||
    "Une erreur est survenue."
  );
}

function extractPost(response) {
  return response?.data || response?.post || response || null;
}

function extractMedia(response) {
  return response?.data || response?.media || response || null;
}

function isFileLike(value) {
  return typeof File !== "undefined" && value instanceof File;
}

function isBlobLike(value) {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

function isDataImage(value) {
  return typeof value === "string" && value.startsWith("data:image/");
}

function getFileExtensionFromDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,/);
  return match?.[1] === "jpeg" ? "jpg" : match?.[1] || "png";
}

async function dataUrlToFile(dataUrl) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = getFileExtensionFromDataUrl(dataUrl);

  return new File([blob], `healspace-post-image.${extension}`, {
    type: blob.type || `image/${extension}`,
  });
}

async function resolveImageFile(payload = {}) {
  const candidates = [
    payload.imageFile,
    payload.file,
    payload.mediaFile,
    payload.attachment,
    payload.image,
    payload.media,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (isFileLike(candidate)) return candidate;

    if (isBlobLike(candidate)) {
      return new File([candidate], "healspace-post-image.png", {
        type: candidate.type || "image/png",
      });
    }

    if (Array.isArray(candidate)) {
      const nestedFile = await resolveImageFile({ image: candidate[0] });
      if (nestedFile) return nestedFile;
    }

    if (candidate?.file) {
      const nestedFile = await resolveImageFile({ image: candidate.file });
      if (nestedFile) return nestedFile;
    }

    if (isDataImage(candidate)) return dataUrlToFile(candidate);
  }

  return null;
}

function buildPostWithUploadedMedia(apiPost, media) {
  return {
    ...apiPost,
    media: [...(apiPost?.media || []), media].filter(Boolean),
  };
}

export function PostsProvider({ children }) {
  const { isLoggedIn, isLoading: isAuthLoading, user } = useAuth();
  const { notify } = useNotifications();

  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [hasLoadedPosts, setHasLoadedPosts] = useState(false);

  const canLoadPosts =
    !isAuthLoading && (isLoggedIn || Boolean(getAccessToken()));

  const loadPosts = useCallback(
    async ({ silent = false } = {}) => {
      if (!getAccessToken()) {
        setPosts([]);
        setHasLoadedPosts(false);
        return [];
      }

      try {
        setIsLoadingPosts(true);
        setPostsError(null);

        const response = await getPosts({ page: 1, limit: 50 });
        const mappedPosts = mapApiPostsToFeedPosts(response);

        setPosts(mappedPosts);
        setHasLoadedPosts(true);

        return mappedPosts;
      } catch (error) {
        setPostsError(error);

        if (!silent) {
          notify(
            getErrorMessage(error, "Impossible de charger les publications."),
            "error",
          );
        }

        return [];
      } finally {
        setIsLoadingPosts(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    if (isAuthLoading) return;

    if (!canLoadPosts) {
      setPosts([]);
      setPostsError(null);
      setHasLoadedPosts(false);
      setIsLoadingPosts(false);
      return;
    }

    loadPosts({ silent: true });
  }, [isAuthLoading, canLoadPosts, user?.id, loadPosts]);

  useEffect(() => {
    if (!canLoadPosts) return undefined;

    function handleFocus() {
      loadPosts({ silent: true });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadPosts({ silent: true });
      }
    }

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [canLoadPosts, loadPosts]);

  const addPost = useCallback(
    async (payload) => {
      try {
        const apiPayload = mapFeedPayloadToApiPost(payload);

        if (!apiPayload.content) {
          throw new Error("Le contenu de la publication est obligatoire.");
        }

        const imageFile = await resolveImageFile(payload);
        const createResponse = await createPost(apiPayload);
        let apiPost = extractPost(createResponse);

        if (imageFile && apiPost?.id) {
          const mediaResponse = await uploadMedia(imageFile, {
            postId: apiPost.id,
          });

          const media = extractMedia(mediaResponse);
          apiPost = buildPostWithUploadedMedia(apiPost, media);
        }

        const createdPost = mapApiPostToFeedPost(apiPost);

        setPosts((current) => [createdPost, ...current]);
        setHasLoadedPosts(true);

        notify("Ta publication a été partagée avec la communauté.", "success");

        return createdPost;
      } catch (error) {
        notify(
          getErrorMessage(error, "La publication n'a pas pu être créée."),
          "error",
        );
        throw error;
      }
    },
    [notify],
  );

  const updatePost = useCallback(
    async (postId, changes) => {
      const currentPost = posts.find((post) => post.id === postId);
      if (!currentPost) return null;

      try {
        const apiPayload = mergePostForUpdate(currentPost, changes);
        const response = await updatePostRequest(postId, apiPayload);
        const updatedPost = mapApiPostToFeedPost(extractPost(response));

        setPosts((current) =>
          current.map((post) => (post.id === postId ? updatedPost : post)),
        );

        notify("Publication modifiée.", "success");
        return updatedPost;
      } catch (error) {
        notify(
          getErrorMessage(error, "La publication n'a pas pu être modifiée."),
          "error",
        );
        throw error;
      }
    },
    [posts, notify],
  );

  const deletePost = useCallback(
    async (postId) => {
      try {
        await deletePostRequest(postId);

        setPosts((current) => current.filter((post) => post.id !== postId));

        await Promise.all([
          likeService.removePost(postId),
          commentService.removePost(postId),
        ]);

        notify("Publication supprimée.", "delete");
      } catch (error) {
        notify(
          getErrorMessage(error, "La publication n'a pas pu être supprimée."),
          "error",
        );
        throw error;
      }
    },
    [notify],
  );

  const sharePost = useCallback(
    async (postId, { author, comment } = {}) => {
      const original = posts.find((post) => post.id === postId);
      if (!original) return null;

      const sharedContent = [
        comment?.trim(),
        `Partage depuis ${original.author} :`,
        original.content,
      ]
        .filter(Boolean)
        .join("\n\n");

      try {
        const response = await createPost({
          content: sharedContent,
          mood: original.moodType || "CALM",
          intention: original.intention || "BE_LISTENED",
          visibility: "PUBLIC",
          isAnonymous: false,
        });

        const sharedPost = {
          ...mapApiPostToFeedPost(extractPost(response)),
          sharedFrom: original,
          author:
            author?.firstName || author?.lastName
              ? [author.firstName, author.lastName].filter(Boolean).join(" ")
              : author?.username || "Toi",
          avatar: author?.username?.[0]?.toUpperCase() || "T",
          avatarUrl: author?.avatar || null,
        };

        setPosts((current) => [
          sharedPost,
          ...current.map((post) =>
            post.id === postId
              ? { ...post, shares: (post.shares || 0) + 1 }
              : post,
          ),
        ]);

        notify("Publication partagée dans HealSpace.", "share");
        return sharedPost;
      } catch (error) {
        notify(
          getErrorMessage(error, "La publication n'a pas pu être partagée."),
          "error",
        );
        throw error;
      }
    },
    [posts, notify],
  );

  const value = useMemo(
    () => ({
      posts,
      isLoadingPosts,
      postsError,
      hasLoadedPosts,
      loadPosts,
      reloadPosts: loadPosts,
      addPost,
      updatePost,
      deletePost,
      sharePost,
    }),
    [
      posts,
      isLoadingPosts,
      postsError,
      hasLoadedPosts,
      loadPosts,
      addPost,
      updatePost,
      deletePost,
      sharePost,
    ],
  );

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}
