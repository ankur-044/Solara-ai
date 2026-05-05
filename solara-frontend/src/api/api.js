import axios from "axios";

// This is the live URL from your Render Dashboard screenshot
const RENDER_URL = "https://solara-ai-otz6.onrender.com"; 

const API = axios.create({
  baseURL: RENDER_URL,
});

export const predictSolar = async (city) => {
  try {
    const response = await API.post("/api/v1/predict", { city });
    return response.data;
  } catch (error) {
    console.error("Render API Sync Error:", error);
    throw error;
  }
};

export default API;