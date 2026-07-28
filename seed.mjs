import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDh9XihusSix89erKfOTHZEeUq3qyp05rw",
  authDomain: "brandwatches.firebaseapp.com",
  databaseURL: "https://brandwatches-default-rtdb.firebaseio.com",
  projectId: "brandwatches",
  storageBucket: "brandwatches.firebasestorage.app",
  messagingSenderId: "86001107680",
  appId: "1:86001107680:web:e04cd3989823dee9080685",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const newProducts = [
  {
    name: "Rado Quartz Green Dial",
    description: "Premium Rado Quartz watch featuring a striking green dial, elegant gold-tone bezel accents, and a rich brown leather strap. Comes with luxury presentation box.",
    price: 32000,
    category: "Men Watches",
    stock: 12,
    images: ["/images/product-1.jpeg"],
    discountPercent: 0,
    brand: "Rado",
    createdAt: new Date().toISOString()
  },
  {
    name: "Rado Quartz Blue Dial",
    description: "Classic Rado Quartz watch with a deep blue dial, sophisticated gold-tone bezel, and a premium brown leather strap. Includes original presentation box.",
    price: 32000,
    category: "Men Watches",
    stock: 8,
    images: ["/images/product-2.jpeg"],
    discountPercent: 0,
    brand: "Rado",
    createdAt: new Date().toISOString()
  },
  {
    name: "Rado Quartz Blue & Silver",
    description: "Elegant Rado Quartz watch with a blue dial, silver-tone faceted bezel, and a sleek black leather strap. Perfect for formal occasions.",
    price: 31000,
    category: "Men Watches",
    stock: 5,
    images: ["/images/product-3.jpeg"],
    discountPercent: 5,
    brand: "Rado",
    createdAt: new Date().toISOString()
  },
  {
    name: "Rado Quartz Black & Silver",
    description: "Minimalist Rado Quartz watch featuring a stark black dial with diamond accents, silver-tone bezel, and a black leather strap.",
    price: 31000,
    category: "Men Watches",
    stock: 15,
    images: ["/images/product-4.jpeg"],
    discountPercent: 0,
    brand: "Rado",
    createdAt: new Date().toISOString()
  },
  {
    name: "Matturi Chronograph Silver",
    description: "Bold Matturi square-face chronograph watch. Features a silver/white dial, robust stainless steel bracelet, and precision sub-dials for timing.",
    price: 25000,
    category: "Men Watches",
    stock: 10,
    images: ["/images/product-5.jpeg"],
    discountPercent: 10,
    brand: "Matturi",
    createdAt: new Date().toISOString()
  },
  {
    name: "Matturi Chronograph Stealth",
    description: "All-black Matturi square-face chronograph. A stealthy, aggressive design with a black dial and matching black steel bracelet.",
    price: 26000,
    category: "Men Watches",
    stock: 7,
    images: ["/images/product-6.jpeg"],
    discountPercent: 0,
    brand: "Matturi",
    createdAt: new Date().toISOString()
  },
  {
    name: "Matturi Chronograph Royal Blue",
    description: "Striking Matturi chronograph with a vibrant royal blue dial, gold accents, and a distinctive two-tone blue/gold steel bracelet.",
    price: 28000,
    category: "Men Watches",
    stock: 4,
    images: ["/images/product-7.jpeg"],
    discountPercent: 0,
    brand: "Matturi",
    createdAt: new Date().toISOString()
  },
  {
    name: "Rado Quartz Black & Gold",
    description: "Luxurious Rado Quartz watch with a black dial, radiant gold-tone bezel, and a premium black leather strap. Includes presentation box.",
    price: 34000,
    category: "Men Watches",
    stock: 9,
    images: ["/images/product-8.jpeg"],
    discountPercent: 15,
    brand: "Rado",
    createdAt: new Date().toISOString()
  },
  {
    name: "Matturi Chronograph Gold Edition",
    description: "Premium Matturi square chronograph featuring a black dial with gold indices, gold-tone case, and a bold black steel bracelet.",
    price: 28500,
    category: "Men Watches",
    stock: 6,
    images: ["/images/product-9.jpeg"],
    discountPercent: 0,
    brand: "Matturi",
    createdAt: new Date().toISOString()
  },
  {
    name: "Tissot PRX Green Dial",
    description: "The iconic Tissot PRX with a stunning green dial and a matching green leather strap. A perfect blend of retro and modern design.",
    price: 45000,
    category: "Men Watches",
    stock: 11,
    images: ["/images/product-10.jpeg"],
    discountPercent: 0,
    brand: "Tissot",
    createdAt: new Date().toISOString()
  },
  {
    name: "Tissot PRX Copper Dial",
    description: "Tissot PRX featuring a unique copper/brown dial and a premium brown leather strap. Vintage appeal with modern Swiss precision.",
    price: 45000,
    category: "Men Watches",
    stock: 8,
    images: ["/images/product-11.jpeg"],
    discountPercent: 0,
    brand: "Tissot",
    createdAt: new Date().toISOString()
  },
  {
    name: "Tissot PRX Black & Gold",
    description: "Elegant Tissot PRX with a sleek black dial, luxurious gold-tone case, and a black leather strap. The ultimate dress watch.",
    price: 48000,
    category: "Men Watches",
    stock: 5,
    images: ["/images/product-12.jpeg"],
    discountPercent: 0,
    brand: "Tissot",
    createdAt: new Date().toISOString()
  },
  {
    name: "Tissot PRX Brown & Gold",
    description: "Sophisticated Tissot PRX featuring a brown dial, gold-tone case, and a matching brown leather strap. Warm and luxurious.",
    price: 48000,
    category: "Men Watches",
    stock: 4,
    images: ["/images/product-13.jpeg"],
    discountPercent: 5,
    brand: "Tissot",
    createdAt: new Date().toISOString()
  },
  {
    name: "Tissot PRX Blue & Gold",
    description: "Stunning Tissot PRX with a deep blue dial, gold-tone case, and a matching blue leather strap. A statement piece.",
    price: 48000,
    category: "Men Watches",
    stock: 6,
    images: ["/images/product-14.jpeg"],
    discountPercent: 0,
    brand: "Tissot",
    createdAt: new Date().toISOString()
  },
  {
    name: "Tissot PRX Black & Silver",
    description: "Classic Tissot PRX with a timeless black dial, silver-tone case, and a sleek black leather strap. Versatile and sharp.",
    price: 42000,
    category: "Men Watches",
    stock: 14,
    images: ["/images/product-15.jpeg"],
    discountPercent: 10,
    brand: "Tissot",
    createdAt: new Date().toISOString()
  },
  {
    name: "Tissot PRX Blue & Silver",
    description: "The classic Tissot PRX with a radiant blue dial, silver-tone case, and a premium blue leather strap. Everyday elegance.",
    price: 42000,
    category: "Men Watches",
    stock: 10,
    images: ["/images/product-16.jpeg"],
    discountPercent: 0,
    brand: "Tissot",
    createdAt: new Date().toISOString()
  }
];

async function seed() {
  console.log("Seeding products...");
  const productsCol = collection(db, "products");
  for (const product of newProducts) {
    try {
      await addDoc(productsCol, product);
      console.log("Added:", product.name);
    } catch (e) {
      console.error("Failed to add", product.name, e);
    }
  }
  console.log("Seeding complete!");
  process.exit(0);
}

seed();
