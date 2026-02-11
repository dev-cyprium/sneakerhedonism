import type { Block } from 'payload'

export const ImageCarousel: Block = {
  slug: 'imageCarousel',
  interfaceName: 'ImageCarouselBlock',
  labels: {
    singular: 'Image Carousel',
    plural: 'Image Carousels',
  },
  fields: [
    {
      name: 'images',
      type: 'array',
      required: true,
      minRows: 2,
      labels: {
        singular: 'Image',
        plural: 'Images',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}
