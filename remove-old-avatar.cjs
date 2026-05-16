const fs = require("fs");
const file = "src/routes/upload.routes.ts";
let c = fs.readFileSync(file, "utf8");

// Remove the avatar routes from old upload router completely
c = c.replace(
  `router.post("/:id/avatar", authenticate, (req: any, res: any, next: any) => {
  console.log("Content-Type:", req.headers["content-type"]);
  next();
}, upload.single("avatar"), uploadAvatar);
router.delete("/:id/avatar", authenticate, deleteAvatar);`,
  ``
);

// Also try simpler version
c = c.replace(`router.post("/:id/avatar", authenticate, upload.single("avatar"), uploadAvatar);`, ``);
c = c.replace(`router.delete("/:id/avatar", authenticate, deleteAvatar);`, ``);

fs.writeFileSync(file, c, "utf8");
console.log("Remaining routes in upload.routes.ts:");
c.split("\n").filter(l => l.includes("router.")).forEach(l => console.log(l));
