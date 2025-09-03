const fs = require("fs");

const envContent = `MONGODB_URI=mongodb+srv://bodysh2019:1fvYHtlP5PESxtdM@myou.j6sr5u0.mongodb.net/?retryWrites=true&w=majority&appName=Myou
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
CLOUDINARY_CLOUD_NAME=dbf5zfdx8
CLOUDINARY_API_KEY=139946622523681
CLOUDINARY_API_SECRET=0fQifD6AD62ir5ISuCJD0g2sESA`;

fs.writeFileSync(".env", envContent, "utf8");
console.log(".env file created successfully");
