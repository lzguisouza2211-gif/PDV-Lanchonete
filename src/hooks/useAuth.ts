// Minimal placeholder hook for future auth integration
export const useAuth = () => {
  const user = null as null | { id?: string; name?: string };
  return {
    user,
    login: (/* credentials */) => Promise.resolve(null),
    logout: () => void 0,
  };
};

export default useAuth;
