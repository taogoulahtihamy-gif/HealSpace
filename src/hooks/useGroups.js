import { useCallback, useEffect, useState } from "react";
import { groupService } from "../services/groupService.js";

export function useGroups() {
  const [joinedNames, setJoinedNames] = useState(() => new Set());

  useEffect(() => {
    let isMounted = true;
    groupService.getJoinedGroupNames().then((names) => {
      if (isMounted) setJoinedNames(names);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const isJoined = useCallback((name) => joinedNames.has(name), [joinedNames]);

  const toggleJoin = useCallback(async (name) => {
    const updated = await groupService.toggleJoin(name);
    setJoinedNames(new Set(updated));
  }, []);

  return { joinedNames, isJoined, toggleJoin };
}
