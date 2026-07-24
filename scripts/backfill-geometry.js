const mongoose = require('mongoose');
const axios = require('axios');
const Listing = require('../models/listing');

async function geocodeLocation(query) {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: query, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'Wanderlust-App' },
            timeout: 10000,
        });

        if (response.data.length > 0) {
            return {
                type: 'Point',
                coordinates: [
                    parseFloat(response.data[0].lon),
                    parseFloat(response.data[0].lat),
                ],
            };
        }
    } catch (err) {
        console.error(`Geocoding failed for ${query}: ${err.message}`);
    }

    return null;
}

(async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
        const listings = await Listing.find({
            $or: [{ geometry: { $exists: false } }, { geometry: null }],
        });

        console.log(`Found ${listings.length} listings missing geometry.`);

        let updated = 0;
        let skipped = 0;

        for (const listing of listings) {
            const query = `${listing.location}, ${listing.country}`;
            const geometry = await geocodeLocation(query);

            if (geometry) {
                const update = { geometry };
                if (!listing.category) {
                    update.category = 'Trending';
                }
                await Listing.collection.updateOne(
                    { _id: listing._id },
                    { $set: update }
                );
                updated += 1;
                console.log(`Updated: ${listing.title}`);
            } else {
                skipped += 1;
                console.log(`Skipped: ${listing.title}`);
            }
        }

        console.log(`Done. Updated ${updated}, skipped ${skipped}.`);
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
})();
