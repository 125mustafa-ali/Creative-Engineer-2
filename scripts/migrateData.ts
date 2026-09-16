import { createClient } from '@sanity/client';
import { capabilities, siteConfig } from '../src/data/data.ts';

const client = createClient({
  projectId: 'xml5x7xn',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN || 'skxXqF0TyqyZs4FIGNU6MWOs6FvwMTEjKv4ox7DpGn2r4z0av73vvowXhDQhwOcOEyMkXeXgCBvXRsVbaO5f8jwJh9h138KTpqr027CqvxXfTyRnT6wROYK7yF4tb7Z5f4MT7ArZqVAnd65sCIKI0Jd6r8O7UtV3xsjjhbNdbmaRoSDvLhPN',
});

async function runHeroMigration() {
  console.log('----------------------------------------------------');
  console.log(' Starting Hero Singleton Data Migration');
  console.log('----------------------------------------------------\n');

  const heroDocument = {
    _id: 'hero-singleton',
    _type: 'heroSection',
    heading: siteConfig.heroStatement || 'CREATIVE ENGINEER',
    subheading: siteConfig.heroSubtext || '',
    backgroundVideoUrl: siteConfig.heroVideo?.url || '',
  };

  try {
    console.log('Upserting [ID: hero-singleton] "heroSection"...');
    const response = await client.createOrReplace(heroDocument);
    console.log(`Success: Singleton Document ID -> ${response._id} synchronized.`);
  } catch (err: any) {
    console.error(`Failed to upsert hero singleton: ${err.message}`);
    process.exit(1);
  }

  console.log('\n----------------------------------------------------');
  console.log(' Hero Singleton Migration Completed Successfully!');
  console.log('----------------------------------------------------');
}

async function runCapabilitiesMigration() {
  console.log('----------------------------------------------------');
  console.log(' Starting Capabilities Data Migration');
  console.log(` Total items to process: ${capabilities.length}`);
  console.log('----------------------------------------------------\n');

  let successCount = 0;
  let failureCount = 0;

  for (const [index, item] of capabilities.entries()) {
    try {
      // Deterministic ID constraint compliance
      const documentId = `capability-${index}`;

      const document = {
        _id: documentId,
        _type: 'capability',
        category: item.category || '',
        title: item.title || '',
        description: item.description || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
      };

      console.log(` Upserting [ID: ${documentId}] "${item.title}"...`);
      const response = await client.createOrReplace(document);
      console.log(` Success: Document ID -> ${response._id} synchronized.`);
      successCount++;
    } catch (err: any) {
      console.error(` Failed: [Index #${index}] "${item.title}" -> ${err.message}`);
      failureCount++;
    }
  }

  console.log('\n----------------------------------------------------');
  console.log(` Capabilities Migration Completed!`);
  console.log(` Successful: ${successCount} | Failed: ${failureCount}`);
  console.log('----------------------------------------------------');
}

async function main() {
  await runCapabilitiesMigration();
}

main().catch((err) => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
