const fs = require("fs");
const file = "src/routes/v1/users.routes.ts";
let c = fs.readFileSync(file, "utf8");

// Remove all avatar route attempts
c = c.replace(`const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
router.post("/:id/avatar", authenticate, upload.single("avatar"), uploadAvatar);
router.delete("/:id/avatar", authenticate, deleteAvatar);
router.post("/:id/avatar", authenticate, upload.single("avatar"), uploadAvatar);
router.delete("/:id/avatar", authenticate, deleteAvatar);`, 
`router.post("/:id/avatar", authenticate, multer({ storage: multer.memoryStorage() }).single("avatar"), uploadAvatar);
router.delete("/:id/avatar", authenticate, deleteAvatar);`);

fs.writeFileSync(file, c, "utf8");
console.log("Fixed! Lines around avatar:");
c.split("\n").forEach((l, i) => { if (l.includes("avatar")) console.log(i+1 + ": " + l); });
