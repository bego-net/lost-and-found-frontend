import { createContext } from "react";

const AuthContext = createContext({
  token: null,
  setToken: () => {},
  user: null,
  setUser: () => {},
  loading: false,
});

export default AuthContext;
