import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use((req, res, next) => {
  console.log(`Handling request for ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("\"200 OK\"");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port ${process.env.PORT || 3000}`);
});
