import type { GlobalConfig } from 'payload'

export const EmailSettings: GlobalConfig = {
  slug: 'email-settings',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Settings',
    description: 'Email notification settings — sender, admin recipients, tracking URL templates.',
  },
  fields: [
    {
      name: 'storeName',
      type: 'text',
      label: 'Store Name',
      defaultValue: 'Sneaker Hedonism',
      admin: {
        description: 'Used in email subjects and headers.',
      },
    },
    {
      name: 'fromEmail',
      type: 'email',
      label: 'From Email',
      defaultValue: 'info@mail.sneakerhedonism.com',
      admin: {
        description: 'Sender address for all outgoing emails.',
      },
    },
    {
      name: 'adminEmails',
      type: 'array',
      label: 'Admin Notification Emails',
      minRows: 1,
      admin: {
        description: 'Email addresses that receive order notifications.',
      },
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
        },
      ],
    },
    {
      name: 'trackingUrlTemplate',
      type: 'text',
      label: 'Default Tracking URL Template',
      defaultValue:
        'https://www.posta.rs/cir/alati/pracenje-posiljke.aspx?broj={{trackingCode}}',
      admin: {
        description:
          'Fallback tracking URL when no carrier match is found. Use {{trackingCode}} as placeholder.',
      },
    },
    {
      name: 'carriers',
      type: 'array',
      label: 'Carriers',
      admin: {
        description: 'Per-carrier tracking URL templates.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Carrier Name',
        },
        {
          name: 'trackingUrlTemplate',
          type: 'text',
          required: true,
          label: 'Tracking URL Template',
          admin: {
            description: 'Use {{trackingCode}} as placeholder.',
          },
        },
      ],
      defaultValue: [
        {
          name: 'Pošta Srbije',
          trackingUrlTemplate:
            'https://www.posta.rs/cir/alati/pracenje-posiljke.aspx?broj={{trackingCode}}',
        },
      ],
    },
    {
      name: 'storeUrl',
      type: 'text',
      label: 'Store URL',
      defaultValue: process.env.NEXT_PUBLIC_SERVER_URL || 'https://sneakerhedonism.com',
      admin: {
        description: 'Base URL used for links in emails.',
      },
    },
  ],
}
