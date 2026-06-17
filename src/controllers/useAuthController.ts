"use client";

import { useState, useCallback, useEffect } from "react";
import { account } from "@/lib/appwrite";
import { userRepository } from "@/models/repositories/userRepository";
import { ID } from "appwrite";
import type { SignupInput, LoginInput } from "@/models/schemas/auth";
import type { AppwriteUser } from "@/models/types";

export function useAuthController() {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    account.get()
      .then((u) => setUser(u as unknown as AppwriteUser))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signup = useCallback(async (data: SignupInput) => {
    setLoading(true);
    setError(null);
    try {
      const created = await account.create(ID.unique(), data.email, data.password, data.name);
      await account.createEmailPasswordSession(data.email, data.password);
      // Create the users DB record
      await userRepository.create(created.$id);
      setUser(created as unknown as AppwriteUser);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    try {
      await account.createEmailPasswordSession(data.email, data.password);
      const u = await account.get();
      setUser(u as unknown as AppwriteUser);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await account.deleteSession("current").catch(() => {});
    setUser(null);
  }, []);

  return { user, loading, error, signup, login, logout };
}
