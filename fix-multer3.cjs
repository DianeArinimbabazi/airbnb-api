const fs = require("fs");
const file = "src/routes/v1/users.routes.ts";
let c = fs.readFileSync(file, "utf8");

console.log("Has multer import:", c.includes("import multer"));
console.log("First line:", c.split("\n")[0]);

// Remove any broken multer attempts and add correct ESM import
c = c.replace(/import multer from "multer";\n/g, "");
c = `import multer from "multer";\n` + c;

// Also check if multer is installed
fs.writeFileSync(file, c, "utf8");
console.log("Done! multer at top:", c.startsWith('import multer'));
