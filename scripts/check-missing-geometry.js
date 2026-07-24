const mongoose = require('mongoose');
const Listing = require('../models/listing');

(async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
        const count = await Listing.countDocuments({
            $or: [{ geometry: { $exists: false } }, { geometry: null }],
        });
        console.log(`Missing geometry: ${count}`);
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
})();
