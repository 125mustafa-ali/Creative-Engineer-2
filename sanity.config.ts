'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';

export const structure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // Pin Hero Singleton directly to top of sidebar
      S.listItem()
        .title('Hero Section')
        .id('hero-singleton')
        .child(
          S.document()
            .schemaType('heroSection')
            .documentId('hero-singleton')
        ),
      S.divider(),
      // Filter out singleton from the rest of the document types list
      ...S.documentTypeListItems().filter(
        (listItem: any) => !['heroSection'].includes(listItem.getId())
      ),
    ]);

export const config = defineConfig({
  name: 'default',
  title: 'Creative Engineer Portfolio',

  // Strictly hardcoded strings. No process.env references.
  projectId: 'xml5x7xn',
  dataset: 'production',

  basePath: '/studio',

  plugins: [
    structureTool({
      structure,
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev: any[], context: { schemaType: string }) => {
      if (context.schemaType === 'heroSection') {
        // Restrict actions: Disallow create, delete, and duplicate for singletons
        return prev.filter(
          (action) => !['CreateAction', 'DeleteAction', 'DuplicateAction'].includes(action.name)
        );
      }
      return prev;
    },
  },
});

export default config;
