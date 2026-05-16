const fs = require("fs");
const file = "src/routes/v1/users.routes.ts";
let c = fs.readFileSync(file, "utf8");

// Remove everything from line 307 onwards and replace cleanly
const lines = c.split("\n");
// Find the line with export default router
let exportLine = lines.findIndex(l => l.includes("export default router"));
// Keep everything up to but not including the first avatar route
let avatarStart = lines.findIndex(l => l.includes("const upload =") || (l.includes('router.post("/:id/avatar")')));
if (avatarStart === -1) avatarStart = exportLine;

const clean = lines.slice(0, avatarStart).join("\n") + `
router.post("/:id/avatar", authenticate, multer({ storage: multer.memoryStorage() }).any(), uploadAvatar);
router.delete("/:id/avatar", authenticate, deleteAvatar);

export default router;
`;

fs.writeFileSync(file, clean, "utf8");
console.log("Done! Avatar lines:");
clean.split("\n").filter(l => l.includes("avatar")).forEach(l => console.log(l));
