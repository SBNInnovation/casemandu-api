const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
const streamifier = require("streamifier");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
// const api_key = process.env.CLOUDINARY_API_KEY;
// const api_secret = process.env.CLOUDINARY_API_SECRET;

// console.log(cloud_name, api_key, api_secret);


// console.log(process.env.CLOUDINARY_API_KEY)

// console.log(cloud_name,api_key,api_secret)

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("Cloudinary config not found");
  process.exit(1);
}

// const uploadToCloudinary = (buffer, folder) => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder: `Casemandu/${folder}`,
//         resource_type: "image",
//       },
//       (error, result) => {
//         if (error) return reject(error);
//         resolve(result);
//       }
//     );

//     streamifier.createReadStream(buffer).pipe(uploadStream);
//   });
// };


// const uploadToCloudinary = (buffer, folder) => {
//   return new Promise((resolve, reject) => {
//     const timeout = setTimeout(() => {
//       reject(new Error("Cloudinary upload timed out"));
//     }, 10000); // 10 sec

//     const uploadStream = cloudinary.uploader.upload(
//       {
//         folder: `Casemandu/${folder}`,
//         resource_type: "image",
//         format: "webp",
//       },
//       (error, result) => {
//         clearTimeout(timeout);
//         if (error) {
//           console.log("Cloudinary Error:", error);
//           return reject(error);
//         }
//         resolve(result);
//       }
//     );

//     const stream = streamifier.createReadStream(buffer);
//     stream.pipe(uploadStream);
//   });
// };


const uploadToCloudinary = async (base64String, folder) => {
  try {
    const uploaded = await cloudinary.uploader.upload(base64String, {
      folder: `Casemandu/${folder}`,
      resource_type: "image",
      format: "webp",
    });
    return uploaded;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

const deleteFile = async (secureUrl) => {
  try {
    if (!secureUrl) throw new Error("secureUrl is required");

    const publicId = secureUrl
      .split("/")
      .slice(7)
      .join("/")
      .replace(/\.[^/.]+$/, "");

    const decoded = decodeURIComponent(publicId);

    const result = await cloudinary.uploader.destroy(decoded);

    if (result.result !== "ok") {
      throw new Error(`Cloudinary deletion failed: ${JSON.stringify(result)}`);
    }

    return true;
  } catch (error) {
    console.error("Error in deleteImage function:", error);
    throw new Error(
      `Error deleting image: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

// No uploadFile function, so only export what exists
module.exports = { uploadToCloudinary, deleteFile };
