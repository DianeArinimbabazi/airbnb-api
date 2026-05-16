const { v2: cloudinary } = require("cloudinary");
require("dotenv/config");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.api.ping().then(r => console.log("Cloudinary OK:", r)).catch(e => console.log("Cloudinary ERROR:", e.message));
