import { useContext } from "react";
import { AuthContext } from "./useAuth";
import { AUTH_CONTEXT_NAME } from "@/constants";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(`useAuth must be used within an ${AUTH_CONTEXT_NAME}`);
  }
  return context;
};
