const fs = require("fs");

// Add avatar upload to v1 users routes
const file = "C:/Users/HP/Desktop/airbnb-api/src/routes/v1/users.routes.ts";
let c = fs.readFileSync(file, "utf8");

// Add imports at top
c = c.replace(
  `import { authenticate } from "../../middlewares/auth.middleware.js";`,
  `import { authenticate } from "../../middlewares/auth.middleware.js";
import { uploadAvatar, deleteAvatar } from "../../controllers/upload.controller.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });`
);

// Add routes before module.exports or at end before export
c = c.replace(
  `export default router;`,
  `router.post("/:id/avatar", authenticate, upload.single("avatar"), uploadAvatar);
router.delete("/:id/avatar", authenticate, deleteAvatar);

export default router;`
);

fs.writeFileSync(file, c, "utf8");
console.log("Avatar routes added:", c.includes("upload.single"));
