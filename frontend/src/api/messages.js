import { apiClient } from "./client";

export const fetchMessages = async (matchId) => {
  const { data } = await apiClient.get(`/messages/${matchId}`);
  return data;
};
