require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors());

console.log("ENV CHECK:", process.env.MONGO_URI);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});