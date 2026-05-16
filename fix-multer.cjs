const fs = require("fs");
const file = "src/routes/v1/users.routes.ts";
let c = fs.readFileSync(file, "utf8");

// Check if multer is already imported
if (!c.includes("multer")) {
  c = c.replace(
    `import { authenticate } from "../../middlewares/auth.middleware.js";`,
    `import { authenticate } from "../../middlewares/auth.middleware.js";
import multer from "multer";`
  );
}

// Add multer instance before the routes
if (!c.includes("const upload =")) {
  c = c.replace(
    `router.post("/:id/avatar"`,
    `const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/:id/avatar"`
  );
}

fs.writeFileSync(file, c, "utf8");
console.log("Fixed! multer:", c.includes("const upload ="));
