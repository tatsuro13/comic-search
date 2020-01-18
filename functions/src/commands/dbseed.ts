import commander from 'commander';
import admin from 'firebase-admin';
import fs from 'fs';
import parse from 'csv-parse/lib/sync'

import { Publisher } from '../services/comic_search/models/publisher';
import { collectionName } from '../services/comic_search/constants';
import { addCounter } from '../firestore-admin/record-counter';

import serviceAccount from '../manga-search13-firebase-adminsdk-5xjpo-dfb0d41aa4.json'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();

const uploadSeed = async (collection: string, seedFile: string) => {
  const buffer = fs.readFileSync(seedFile);
  const records = parse(buffer.toString(), {
    columns: true,
    delimiter: '¥t',
    skip_empty_lines: true,
  });
  const ref = db.collection(collection);

  switch (collection) {
    case collectionName.publichers: {
      const docs =
        records.map((record: Publisher) => ({
          ...record,
          website: record.website ? record.website : null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })) || [];
      for await (const doc of docs) {
        const { id } = doc;
        const docWithoutId = { ...doc };
        delete docWithoutId.id;
        await ref.doc(id).set(docWithoutId);
      }
      await addCounter(db, collection, docs.length);

      return;
    }

    default: {
      throw new Error('specify target collection');
    }
  }
};

commander
  .version('0.1.0', '-v, --version')
  .arguments('<collection> <seedFile>')
  .action(uploadSeed);

commander.parse(process.argv);