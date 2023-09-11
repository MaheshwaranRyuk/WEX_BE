const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const upload = require("express-fileupload");
require("dotenv").config();
const cors = require("cors");

const Routes = require("./src/Routes/Routes");

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
app.use(cors());
app.use(express.json());
app.use(upload());

app.use(Routes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Example app listening at localhost:${PORT}`);
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Api Not Found",
  });
});
