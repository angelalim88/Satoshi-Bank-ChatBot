import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const ChatbotService = {
  sendMessage: async (message) => {
    const response = await apiClient.post(ENDPOINTS.CHAT, { message });
    return response.reply;
  },
};