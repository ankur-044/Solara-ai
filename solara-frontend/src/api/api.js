import axios from "axios";

const API = axios.create({
  // THE ONLY PLACE YOU DEFINE THE PORT
  baseURL: "https://solara-ai-otz6.onrender.com/api/v1/predict", 
});

export const predictSolar = async (city) => {
  try {
    // We send the city in the body as per your backend requirement
    const response = await API.post("/api/v1/predict", { city });
    return response.data; // We return the data directly
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
};