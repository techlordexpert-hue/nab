import { Product, StoreSettings } from '../types.ts';

export const initialSettings: StoreSettings = {
  brandName: "NAB’s FRAMES",
  contactNumber: "0246782648",
  whatsappNumber: "233246782648",
  location: "Agona Nkwanta",
  adminPin: "2648", // Last 4 digits of phone number
};

export const initialProducts: Product[] = [
  // Picture Frames
  {
    id: "pf-10x12-ring",
    name: "10 by 12 with ring",
    category: "picture_frames",
    price: 95,
    stock: 25,
    inStock: true,
    size: "10 x 12 inches",
    withRing: true,
    description: "Premium handcrafted photo frame with stylish metal hanging ring. Perfect for portraits, graduation, and family memories.",
    image: "/images/picture_frames.jpg",
    badge: "Popular"
  },
  {
    id: "pf-10x12-no-ring",
    name: "10 by 12 without ring",
    category: "picture_frames",
    price: 85,
    stock: 20,
    inStock: true,
    size: "10 x 12 inches",
    withRing: false,
    description: "Classic border photo frame without ring, ready for flush wall mount or stand display.",
    image: "/images/picture_frames.jpg",
  },
  {
    id: "pf-12x16-ring",
    name: "12 by 16 with ring",
    category: "picture_frames",
    price: 140,
    stock: 18,
    inStock: true,
    size: "12 x 16 inches",
    withRing: true,
    description: "Medium-large statement photo frame with signature top decorative hanging ring. Very elegant finish.",
    image: "/images/picture_frames.jpg",
    badge: "Best Seller"
  },
  {
    id: "pf-12x16-no-ring",
    name: "12 by 16 without ring",
    category: "picture_frames",
    price: 130,
    stock: 15,
    inStock: true,
    size: "12 x 16 inches",
    withRing: false,
    description: "Clean minimalist 12x16 border frame for high-detail enlargements and studio prints.",
    image: "/images/picture_frames.jpg",
  },
  {
    id: "pf-15x19-ring",
    name: "15 by 19 with ring",
    category: "picture_frames",
    price: 200,
    stock: 12,
    inStock: true,
    size: "15 x 19 inches",
    withRing: true,
    description: "Grand showcase portrait frame with ornate ring accent. Ideal for wedding photos and milestone celebrations.",
    image: "/images/picture_frames.jpg",
    badge: "Premium"
  },
  {
    id: "pf-15x19-no-ring",
    name: "15 by 19 without ring",
    category: "picture_frames",
    price: 185,
    stock: 10,
    inStock: true,
    size: "15 x 19 inches",
    withRing: false,
    description: "Large format 15x19 photo frame with seamless modern border.",
    image: "/images/picture_frames.jpg",
  },
  {
    id: "pf-16x20-ring",
    name: "16 by 20 with ring",
    category: "picture_frames",
    price: 230,
    stock: 10,
    inStock: true,
    size: "16 x 20 inches",
    withRing: true,
    description: "Executive oversized wall portrait frame with reinforced hanging ring. Top choice for master living rooms and offices.",
    image: "/images/picture_frames.jpg",
    badge: "Executive"
  },

  // Canvas Frames
  {
    id: "cf-3-in-1",
    name: "Canvas 3 in 1",
    category: "canvas_frames",
    price: 250,
    stock: 12,
    inStock: true,
    size: "3 Panels Split",
    description: "Triptych 3-piece split gallery canvas frame. Your single image or 3 photos printed on textured, high-grade canvas wrap.",
    image: "/images/canvas_frames.jpg",
    badge: "Top Canvas"
  },
  {
    id: "cf-4-in-1",
    name: "Canvas 4 in 1",
    category: "canvas_frames",
    price: 300,
    stock: 8,
    inStock: true,
    size: "4 Panels Ensemble",
    description: "Modern 4-piece panoramic canvas composition. Makes a vibrant gallery wall transformation for your home or office.",
    image: "/images/canvas_frames.jpg",
  },
  {
    id: "cf-5-in-1",
    name: "Canvas 5 in 1",
    category: "canvas_frames",
    price: 400,
    stock: 6,
    inStock: true,
    size: "5 Panels Masterpiece",
    description: "Grand 5-panel curved or staggered canvas arrangement. High-definition color depth with durable wooden inner frame.",
    image: "/images/canvas_frames.jpg",
    badge: "Luxury"
  },

  // Customize Chains
  {
    id: "cc-photo-pendant",
    name: "Custom Photo Pendant Chain",
    category: "custom_chains",
    price: 120,
    stock: 25,
    inStock: true,
    description: "Personalized stainless steel/gold-tone necklace with your uploaded portrait sealed in a crystal-clear waterproof dome.",
    image: "/images/custom_chains.jpg",
    badge: "Gift Favorite"
  },
  {
    id: "cc-name-engraved",
    name: "Custom Name / Text Chain",
    category: "custom_chains",
    price: 110,
    stock: 20,
    inStock: true,
    description: "Custom engraved nameplate necklace or bar chain. Enter your name, initials, or special date.",
    image: "/images/custom_chains.jpg",
  },

  // Customize Phone Cases
  {
    id: "cp-photo-case",
    name: "Custom Photo Phone Case",
    category: "phone_cases",
    price: 75,
    stock: 30,
    inStock: true,
    description: "Customized shockproof phone case with your personal photo, couple memory, or artwork. Available for iPhone, Samsung, Tecno, Infinix, etc.",
    image: "/images/custom_cases.jpg",
    badge: "Trending"
  },
  {
    id: "cp-aesthetic-case",
    name: "Custom Monogram & Name Case",
    category: "phone_cases",
    price: 70,
    stock: 25,
    inStock: true,
    description: "Sleek personalized phone case with stylish typography, initials, or custom background patterns.",
    image: "/images/custom_cases.jpg",
  }
];
