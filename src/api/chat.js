import api from "./api";

// Send user query to AI
export const sendChatQuery = async (question) => {
    const response = await api.post("/chat/query", { question });
    return response.data;
};

// Retrieve user's chat history from PostgreSQL
export const getChatHistory = async () => {
    const response = await api.get("/chat/history");
    return response.data;
};

// Clear chat history
export const clearChatHistory = async () => {
    const response = await api.delete("/chat/history");
    return response.data;
};
