import { apiClient } from "./client";

export const fetchMessages = async (matchId) => {
  const { data } = await apiClient.get(`/messages/${matchId}`);
  return data;
};

export const deleteMessage = async (messageId) => {
  const { data } = await apiClient.delete(`/messages/${messageId}`);
  return data;
};
