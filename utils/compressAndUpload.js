const { uploadToCloudinary } = require("./cloudinary");
const sharp = require("sharp")

const compressAndUpload = async (fileBuffer, folder) => {
  const optimizedBuffer = await sharp(fileBuffer)
    .webp({ quality: 80 })
    .toBuffer();

  const base64Data = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;

  return await uploadToCloudinary(base64Data, folder);
};

module.exports = {compressAndUpload}
