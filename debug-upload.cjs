const fs = require("fs");
const file = "src/routes/upload.routes.ts";
let c = fs.readFileSync(file, "utf8");

// Add debug middleware before the route
c = c.replace(
  `router.post("/:id/avatar", authenticate, upload.single("avatar"), uploadAvatar);`,
  `router.post("/:id/avatar", authenticate, (req: any, res: any, next: any) => {
  console.log("Content-Type:", req.headers["content-type"]);
  next();
}, upload.single("avatar"), uploadAvatar);`
);

fs.writeFileSync(file, c, "utf8");
console.log("Done!");
