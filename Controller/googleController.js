const { Storage } = require('@google-cloud/storage');
const Profile = require('../Models/profileModel');
const path = require('path');

const projectId = 'tactical-hope-475616-q7';
const keyFilename = path.join(__dirname, '..', 'Google_storage', 'tactical-hope-475616-q7-4bb9908b0051.json');

// Initialize Google Cloud Storage
const storage = new Storage({ projectId, keyFilename });

// Define the bucket name
const bucket = storage.bucket('testing-auditale-1');

async function handleAddUpdateProfileImage(req, res) {
    try {
        const userId = req.user.userData._id;
        const profileImage = req.file;

        if (!profileImage) {
            return res.status(400).json({ error: "Please provide a profile image file." });
        }

        const buffer = profileImage.buffer;
        const fileName = `${userId}_profile_${Date.now()}.png`;

        // Ensure the fileName is a valid string
        if (typeof fileName !== 'string' || !fileName.trim()) {
            return res.status(400).json({ error: "Invalid file name generated." });
        }

        const file = bucket.file(fileName);  // Creating the file reference

        // Upload the image using file.save()
        await file.save(buffer, {
            contentType: profileImage.mimetype,
            resumable: false,
        });

        const profileData = await Profile.findOneAndUpdate(
            { userId },
            { userId, profileImage: fileName },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (!profileData) {
            await Profile.create({ userId, profileImage: fileName });
        }

        return res.status(201).json({
            message: "Profile image added or updated successfully.",
            profileImage: fileName,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

module.exports = {
    handleAddUpdateProfileImage
}