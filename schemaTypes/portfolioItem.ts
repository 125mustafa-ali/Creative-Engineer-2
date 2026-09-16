import { defineType, defineField } from 'sanity';

export const portfolioItem = defineType({
  name: 'portfolioItem',
  title: 'Portfolio Item',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    defineField({ name: 'client', title: 'Client / Brand', type: 'string' }),
    defineField({ name: 'year', title: 'Year', type: 'string' }),
    defineField({ name: 'discipline', title: 'Discipline', type: 'string' }),
    defineField({
      name: 'size',
      title: 'Grid Size',
      type: 'string',
      options: { list: ['LARGE', 'SMALL'], layout: 'radio' }
    }),
    defineField({ name: 'videoUrl', title: 'Main Video URL (Cloudinary)', type: 'url' }),
    defineField({ name: 'thumbnailVideo', title: 'Thumbnail Video URL', type: 'url' }),
    defineField({ name: 'markdownContext', title: 'Context (Markdown)', type: 'text' }),
    defineField({ 
      name: 'isAnthology', 
      title: 'Is this an Anthology / Gallery?', 
      type: 'boolean', 
      initialValue: false 
    }),
    defineField({
      name: 'spots',
      title: 'Sub-Videos / Spots (Only for Anthology/Gallery)',
      type: 'array',
      hidden: ({ document }) => !document?.isAnthology,
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Spot Title', type: 'string' }),
          defineField({ name: 'videoUrl', title: 'Video URL', type: 'url' }),
          defineField({ name: 'duration', title: 'Duration (e.g., 0:33)', type: 'string' }),
          defineField({ 
            name: 'aspectRatio', 
            title: 'Aspect Ratio', 
            type: 'string',
            options: { list: ['16:9', '9:16'], layout: 'radio' }
          }),
          defineField({ name: 'badge', title: 'Badge Text', type: 'string' }),
          defineField({ name: 'tag', title: 'Tag (e.g., Spec, Live)', type: 'string' }),
          defineField({ name: 'markdownContext', title: 'Context (Markdown)', type: 'text' }),
        ]
      }]
    })
  ]
});

export default portfolioItem;
