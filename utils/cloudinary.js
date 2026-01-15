const cloudinary = require("cloudinary").v2;
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

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {folder: `Casemandu/${folder}`, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
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
