const fs = require('fs');
const { Client } = require('pg');

async function migrate() {
    const env = fs.readFileSync('.env.local', 'utf8');
    const dbUrl = env.match(/DATABASE_URL=(.+)/)[1].trim().replace(/^\"|\"$/g, '');
    const client = new Client({ connectionString: dbUrl });

    await client.connect();
    try {
        process.stdout.write('Renaming tables and columns...\n');

        // 1. Rename junction table
        await client.query('ALTER TABLE event_instructors RENAME TO training_instructors');
        await client.query('ALTER TABLE training_instructors RENAME COLUMN event_id TO training_id');

        // 2. Rename events table
        await client.query('ALTER TABLE events RENAME TO trainings');

        // 3. Rename columns in applications table
        await client.query('ALTER TABLE applications RENAME COLUMN event_id TO training_id');
        await client.query('ALTER TABLE applications RENAME COLUMN event_date TO training_date');
        await client.query('ALTER TABLE applications RENAME COLUMN event_title TO training_title');

        process.stdout.write('Migration successful!\n');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

migrate();
