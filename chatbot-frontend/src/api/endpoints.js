export const ENDPOINTS = {
  //chat session
  GET_ALL_CHAT_SESSION: '/api/chatS/',
  DELETE_SESSSION_BY_ID: (id) => `api/chatS/delete-session/${id}`,

  //chat message
  START_CHAT: '/api/chatM/start',
  CHAT: 'api/chatM/',
  GET_ALL_MESSAGES_BY_SESSION_ID: (id) => `api/chatM/messages/${id}`,
  DELETE_ALL_BY_SESSION_ID: (id) => `api/chatM/delete-messages/${id}`,

};