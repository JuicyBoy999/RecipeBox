import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddEditRecipe from "./pages/AddEditRecipe";
import Pantry from "./pages/Pantry";
import ProtectedRoute from "./service/ProtectedRoute";

function RootRedirect() {
  const token = localStorage.getItem("token");
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/new"
          element={
            <ProtectedRoute>
              <AddEditRecipe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/:id/edit"
          element={
            <ProtectedRoute>
              <AddEditRecipe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pantry"
          element={
            <ProtectedRoute>
              <Pantry />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
