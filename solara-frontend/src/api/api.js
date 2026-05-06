import axios from "axios";

const RENDER_URL = "https://solara-ai-otz6.onrender.com";

const API = axios.create({
  baseURL: RENDER_URL,
  timeout: 20000,
});

export const predictSolar = async (city) => {
  try {
    const response = await API.post("/api/v1/predict", {
      city,
    });

    console.log("API SUCCESS:", response.data);

    return response.data;
  } catch (error) {
    console.error("Render API Sync Error:", error);

    return {
      error: true,
      message: "Backend connection failed",
    };
  }
};

export default API;