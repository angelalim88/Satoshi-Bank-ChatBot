import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

// Chat Session
export const getAllChatSession = async () => {
  const response = await apiClient.get(ENDPOINTS.GET_ALL_CHAT_SESSION);
  return response.data;
};

export const deleteSessionById = async (id) => {
  const response = await apiClient.delete(ENDPOINTS.DELETE_SESSSION_BY_ID(id));
  return response.data;
};

// Chat Message
export const startChat = async (data) => {
  const response = await apiClient.post(ENDPOINTS.START_CHAT, data);
  return response.data;
};

export const sendChat = async (data) => {
  const response = await apiClient.post(ENDPOINTS.CHAT, data);
  return response.data;
};

export const getAllMessagesBySessionId = async (id) => {
  const response = await apiClient.get(ENDPOINTS.GET_ALL_MESSAGES_BY_SESSION_ID(id));
  return response.data;
};

export const deleteAllMessagesBySessionId = async (id) => {
  const response = await apiClient.delete(ENDPOINTS.DELETE_ALL_BY_SESSION_ID(id));
  return response.data;
};