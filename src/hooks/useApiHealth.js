import { useEffect, useState } from "react";

import { getApiHealth } from "../services/api/health.api.js";

export function useApiHealth() {
  const [state, setState] = useState({
    loading: true,
    online: false,
    message: "",
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    async function checkHealth() {
      try {
        const response = await getApiHealth();

        if (!mounted) {
          return;
        }

        setState({
          loading: false,
          online: Boolean(response?.success),
          message: response?.message || "API disponible",
          error: null,
        });
      } catch (error) {
        if (!mounted) {
          return;
        }

        setState({
          loading: false,
          online: false,
          message: "",
          error,
        });
      }
    }

    checkHealth();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
