import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;                               // check if the file path is valid
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // file has been uploaded successfully
        console.log("File uploaded successfully on cloudinary at url : ", response.url);    // printing the url of the uploaded file
        fs.unlinkSync(localFilePath)      // removing the files from local machine after successfull upload on cloudinary (as it's not needed anymore)
        return response;        // returning the response
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        fs.unlinkSync(localFilePath) // remove the file from the local storage if the upload fails
        return null;        // returning null if the upload fails
    }
}


// Delete file from cloudinary
const deleteFromCloudinary = async (fileUrl, resourceType = "image") => {
    try {
        if (!fileUrl) return null;

        // Extract public_id from the Cloudinary URL
        // Example URL: http://res.cloudinary.com/username/image/upload/v1234567/public_id.jpg
        const publicId = fileUrl.split('/').pop().split('.')[0];

        const response = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        console.log("File deleted successfully from cloudinary");
        return response;
    } catch (error) {
        console.error("Cloudinary delete failed:", error);
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };