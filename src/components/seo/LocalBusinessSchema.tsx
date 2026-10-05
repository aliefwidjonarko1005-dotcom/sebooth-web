import React from 'react'

export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://www.sebooth.in/#localbusiness',
    name: 'Sebooth Photobooth Semarang & Tembalang',
    alternateName: ['Sebooth', 'Sebooth Photobooth', 'Sewa Photobooth Semarang'],
    description: 'Vendor sewa photobooth terbaik di Semarang dan Tembalang untuk wedding, wisuda UNDIP, gathering kantor, festival kampus, dan event. Cetak instan lab-grade, live video softfile ke HP, dan frame kustom aesthetic.',
    url: 'https://www.sebooth.in',
    telephone: '+6281234567890',
    priceRange: 'IDR 850.000 - IDR 3.500.000',
    image: [
      'https://www.sebooth.in/images/products/mini_studio_booth.webp',
      'https://www.sebooth.in/images/products/vending_machine_booth.webp',
      'https://www.sebooth.in/images/products/partner_sebooth.webp'
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Prof. Soedarto, Tembalang',
      addressLocality: 'Semarang',
      addressRegion: 'Jawa Tengah',
      postalCode: '50275',
      addressCountry: 'ID'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -7.0506,
      longitude: 110.4357
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Kota Semarang'
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Tembalang'
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Banyumanik'
      },
      {
        '@type': 'City',
        name: 'Ungaran'
      },
      {
        '@type': 'City',
        name: 'Salatiga'
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Jawa Tengah'
      }
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ],
        opens: '08:00',
        closes: '23:00'
      }
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Paket Sewa Photobooth Semarang',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Paket Photobooth Tembalang Mahasiswa & Wisuda UNDIP',
            description: 'Layanan photobooth hemat untuk perayaan wisuda dan event organisasi mahasiswa di Tembalang Semarang.'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Paket Photobooth Wedding & Event Semarang Unlimited',
            description: 'Layanan sewa photobooth cetak tanpa batas selama durasi acara untuk resepsi pernikahan dan gathering di Semarang.'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Vending Machine Photobooth Semarang',
            description: 'Mesin photobooth mandiri otomatis untuk kafe, mall, expo dan festival di Jawa Tengah.'
          }
        }
      ]
    },
    sameAs: [
      'https://www.instagram.com/sebooth.id',
      'https://www.tiktok.com/@sebooth.id'
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
