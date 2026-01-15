const { uploadToCloudinary } = require("./cloudinary");
const sharp = require("sharp")

const compressAndUpload = async (fileBuffer, folder) => {
    const optimizedBuffer = await sharp(fileBuffer)
        .webp({ quality: 80 })
        .toBuffer();

  return await uploadToCloudinary(optimizedBuffer, folder);
};

module.exports = {compressAndUpload}
