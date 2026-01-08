import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const uploadPdf = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file); // must match multer.single("file")

  const response = await axios.post(
    `${API_BASE_URL}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
