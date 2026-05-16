const fs = require("fs");
const file = "src/routes/v1/users.routes.ts";
let c = fs.readFileSync(file, "utf8");

c = c.replace(
  `import multer from "multer";`,
  `import multer from "multer";
import { uploadAvatar, deleteAvatar } from "../../controllers/upload.controller";`
);

fs.writeFileSync(file, c, "utf8");
console.log("Done:", c.includes("uploadAvatar"));
