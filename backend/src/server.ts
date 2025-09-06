import dotenv from "dotenv";
import app from "./app";

// triggered when an exception occurs in synchronous code and is not handled by try...catch
process.on("uncaughtException", (err: any) => {
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: "./.env" });

const PORT = process.env.APP_PORT || 3005;

const server = app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}...`);
});

// triggered when there is a raw Promise rejection
process.on("unhandledRejection", (err: any) => {
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
