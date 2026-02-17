// Test script for R2 connection
import { S3Client, ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'hk-media-dev';

console.log('🔧 Testing R2 Connection...\n');
console.log('Account ID:', R2_ACCOUNT_ID);
console.log('Bucket Name:', R2_BUCKET_NAME);
console.log('Access Key:', R2_ACCESS_KEY_ID?.substring(0, 8) + '...\n');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function testR2() {
  try {
    // Test 1: Upload a test file
    console.log('📤 Test 1: Uploading test file...');
    const testContent = `R2 Test File - ${new Date().toISOString()}`;
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: 'test/connection-test.txt',
        Body: Buffer.from(testContent),
        ContentType: 'text/plain',
      })
    );
    
    console.log('✅ Upload successful!\n');
    
    // Test 2: Check public URL
    console.log('🌐 Public URL should be:');
    console.log(`   https://pub-[bucket-id].r2.dev/test/connection-test.txt`);
    console.log('   (Get exact URL from Cloudflare R2 bucket settings)\n');
    
    console.log('✅ R2 connection is working perfectly!\n');
    console.log('📋 Next steps:');
    console.log('   1. Go to Cloudflare R2 → hk-media-dev bucket');
    console.log('   2. Check "Settings" → Find "Bucket Public URL"');
    console.log('   3. Update R2_PUBLIC_URL in .env with that URL');
    console.log('   4. Enable public access if needed');
    
  } catch (error) {
    console.error('❌ R2 Connection Failed:', error);
    process.exit(1);
  }
}

testR2();
