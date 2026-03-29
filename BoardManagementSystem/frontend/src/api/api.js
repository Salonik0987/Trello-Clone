import axios from "axios";

const API = axios.create({
  baseURL: "https://trello-clone-op1c.onrender.com" || "http://localhost:5000",
});

export default API;
