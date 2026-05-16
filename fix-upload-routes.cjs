const fs = require("fs");
const file = "src/routes/upload.routes.ts";
let c = fs.readFileSync(file, "utf8");

c = c.replace(
  `upload.single("image")`,
  `upload.any()`
);

fs.writeFileSync(file, c, "utf8");
console.log("Fixed:", c.includes('upload.any()'));
