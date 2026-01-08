import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const askRag = async (question: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/ask`,
      { question },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.error || "API error");
    }
    throw new Error("Network error");
  }
};
