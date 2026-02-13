import { apiClient } from "./client";

export const fetchMe = async () => {
  const { data } = await apiClient.get("/user/me");
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await apiClient.patch("/user/me", payload);
  return data;
};

export const getAvatarSignature = async () => {
  const { data } = await apiClient.get("/user/avatar/signature");
  return data;
};

export const updatePassword = async (payload) => {
  const { data } = await apiClient.patch("/user/me/password", payload);
  return data;
};

export const fetchFeed = async (params) => {
  const { data } = await apiClient.get("/user/feed", { params });
  return data;
};

export const swipeUser = async (payload) => {
  const { data } = await apiClient.post("/user/swipe", payload);
  return data;
};

export const fetchMatches = async () => {
  const { data } = await apiClient.get("/user/matches");
  return data;
};

export const fetchRequests = async (params) => {
  const { data } = await apiClient.get("/user/requests", { params });
  return data;
};

export const fetchSentRequests = async () => {
  const { data } = await apiClient.get("/user/sentrequests");
  return data;
};

export const respondToRequest = async (requestId, action) => {
  const { data } = await apiClient.patch("/user/response", {
    requestId,
    action,
  });
  return data;
};
