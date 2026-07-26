import api from "./api";

// Upload a document with custom progress tracker support
export const uploadDocument = async (formData, onUploadProgress) => {
    const response = await api.post("/documents/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
    });
    return response.data;
};

// List all files inuploads/ directory
export const listDocuments = async () => {
    const response = await api.get("/documents");
    return response.data;
};

// Delete a document by name
export const deleteDocument = async (filename) => {
    const response = await api.delete(`/documents/${filename}`);
    return response.data;
};

// Get vector store metadata metrics
export const getDocumentStats = async () => {
    const response = await api.get("/documents/stats");
    return response.data;
};
