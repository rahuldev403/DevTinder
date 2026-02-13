import { apiClient } from "./client";

export const login = async (payload) => {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
};

export const register = async (payload) => {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
};

export const logout = async () => {
  const { data } = await apiClient.post("/auth/logout");
  return data;
};

export const refresh = async () => {
  const { data } = await apiClient.post("/auth/refresh");
  return data;
};
