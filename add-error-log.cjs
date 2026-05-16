const fs = require("fs");
const file = "src/controllers/upload.controller.ts";
let c = fs.readFileSync(file, "utf8");

c = c.replace(
  `  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
export const deleteAvatar`,
  `  } catch (error: any) {
    console.error("AVATAR UPLOAD ERROR:", error);
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
};
export const deleteAvatar`
);

fs.writeFileSync(file, c, "utf8");
console.log("Done!");
