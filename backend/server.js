const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const userRoute = require("./route/userRoute");
const recipeRoute = require("./route/recipeRoute");
const pantryRoute = require("./route/pantryRoute");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("RecipeBox backend is running");
});

app.use("/api/users", userRoute);
app.use("/api/recipes", recipeRoute);
app.use("/api/pantry", pantryRoute);

const PORT = process.env.PORT || 8000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
