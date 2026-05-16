const fs = require("fs");

// Fix the old upload router to not intercept avatar at all
let c = fs.readFileSync("src/routes/upload.routes.ts", "utf8");
c = c.replace(
  `router.post("/:id/avatar", authenticate, upload.any(), uploadAvatar);`,
  `router.post("/:id/avatar", authenticate, upload.single("avatar"), uploadAvatar);`
);
fs.writeFileSync("src/routes/upload.routes.ts", c, "utf8");

// Fix the multer config to allow any field name by removing fileFilter restriction
let m = fs.readFileSync("src/config/multer.ts", "utf8");
m = `import multer from "multer";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
export default upload;
`;
fs.writeFileSync("src/config/multer.ts", m, "utf8");
console.log("Done!");
