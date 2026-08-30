// Auth has been removed. This stub keeps useAuth() safe for any remaining component references.
const stub = { user: null, isLoading: false, login: async () => {}, logout: async () => {} };

export function useAuth() {
  return stub;
}

