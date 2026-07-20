import axios from "axios";

const Api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

Api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => Api.post("/api/users/register", data);
export const loginUser = (data) => Api.post("/api/users/login", data);
export const getProfile = (id) => Api.get(`/api/users/${id}`);
export const updateProfile = (id, data) => Api.put(`/api/users/${id}`, data);
export const deleteProfile = (id) => Api.delete(`/api/users/${id}`);

export const getRecipes = (params = {}) => Api.get("/api/recipes", { params });
export const getRecipeById = (id) => Api.get(`/api/recipes/${id}`);
export const addRecipe = (data) => Api.post("/api/recipes", data);
export const updateRecipe = (id, data) => Api.put(`/api/recipes/${id}`, data);
export const toggleFavorite = (id, isFavorite) =>
  Api.patch(`/api/recipes/${id}/favorite`, { isFavorite });
export const deleteRecipe = (id) => Api.delete(`/api/recipes/${id}`);

export const getPantryItems = () => Api.get("/api/pantry");
export const getPantryItemById = (id) => Api.get(`/api/pantry/${id}`);
export const addPantryItem = (data) => Api.post("/api/pantry", data);
export const updatePantryItem = (id, data) => Api.put(`/api/pantry/${id}`, data);
export const deletePantryItem = (id) => Api.delete(`/api/pantry/${id}`);

export default Api;
