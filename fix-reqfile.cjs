const fs = require("fs");
const file = "src/controllers/upload.controller.ts";
let c = fs.readFileSync(file, "utf8");

c = c.replace(
  `    if (!req.file) return res.status(400).json({ error: "No file uploaded" });`,
  `    const reqFile = req.file || (req.files as any)?.[0];
    if (!reqFile) return res.status(400).json({ error: "No file uploaded" });`
);

c = c.replace(
  `    const { url, publicId } = await uploadToCloudinary(req.file.buffer, "airbnb/avatars");`,
  `    const { url, publicId } = await uploadToCloudinary(reqFile.buffer, "airbnb/avatars");`
);

fs.writeFileSync(file, c, "utf8");
console.log("Fixed:", c.includes("reqFile"));
