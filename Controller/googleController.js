const { Storage } = require('@google-cloud/storage');
const Profile = require('../Models/profileModel');

// Initialize Google Cloud Storage
const storage = new Storage({
    projectId: 'tactical-hope-475616-q7', // Replace with your project ID
    keyFilename: require('../Google_storage/tactical-hope-475616-q7-cf6d133e8d17.json')  // Replace with path to your service account key
});

// Define the bucket name
const bucket = storage.bucket('testing-auditale');  // Replace with your actual bucket name

console.log('Bucket:', bucket);
console.log('Bucket Name:', bucket.name);

async function handleAddUpdateProfileImage(req, res) {
    try {
        const userId = req.user.userData._id;
        const profileImage = req.file;

        if (!profileImage) {
            return res.status(400).json({ error: "Please provide a profile image file." });
        }

        const buffer = profileImage.buffer;
        const fileName = `${userId}_profile_${Date.now()}.png`;

        console.log("Generated file name:", fileName);

        // Ensure the fileName is a valid string
        if (typeof fileName !== 'string' || !fileName.trim()) {
            return res.status(400).json({ error: "Invalid file name generated." });
        }

        // Debug: Verify bucket and file creation
        console.log("Bucket Name:", bucket.name);  // Ensure bucket name is correct
        const file = bucket.file(fileName);  // Creating the file reference

        console.log("File reference created:", file.name);  // Check the file name

        // Upload the image using file.save()
        await file.save(buffer, {
            contentType: profileImage.mimetype,
            resumable: false,
        });

        const publicUrl = `https://storage.googleapis.com/testing-auditale/${fileName}`;

        const profileData = await Profile.findOneAndUpdate(
            { userId },
            { userId, profileImage: publicUrl },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (!profileData) {
            return res.status(400).json({ error: "Profile data not generated. Please try again later." });
        }

        return res.status(201).json({
            message: "Profile image added or updated successfully.",
            profileImage: publicUrl,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

module.exports = {
    handleAddUpdateProfileImage
}