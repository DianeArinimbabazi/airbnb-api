const fs = require("fs");
const file = "src/routes/v1/users.routes.ts";
let c = fs.readFileSync(file, "utf8");

// Use .any() instead of .single("avatar") to accept any field name
c = c.replace(
  `multer({ storage: multer.memoryStorage() }).single("avatar")`,
  `multer({ storage: multer.memoryStorage() }).any()`
);

fs.writeFileSync(file, c, "utf8");
console.log("Fixed!");
