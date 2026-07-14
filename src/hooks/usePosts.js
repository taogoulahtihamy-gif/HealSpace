import { useContext } from "react";

import { PostsContext } from "../contexts/PostsContext.jsx";

export function usePosts() {
  const context = useContext(PostsContext);

  if (!context) {
    throw new Error(
      "usePosts doit être utilisé dans <PostsProvider>",
    );
  }

  return context;
}
