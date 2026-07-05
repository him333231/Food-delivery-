export type Dish = {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  restaurantId: string;
  restaurantName: string;
  description: string;
  ingredients: string[];
  veg: boolean;
  category: string;
};

export type Restaurant = {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  cuisine: string;
  deliveryFee: number;
  veg: boolean;
  offer?: string;
};

export const categories = [
  { id: "pizza", name: "Pizza", emoji: "🍕" },
  { id: "burger", name: "Burgers", emoji: "🍔" },
  { id: "sushi", name: "Sushi", emoji: "🍣" },
  { id: "salad", name: "Salads", emoji: "🥗" },
  { id: "dessert", name: "Desserts", emoji: "🍰" },
  { id: "drinks", name: "Drinks", emoji: "🥤" },
  { id: "asian", name: "Asian", emoji: "🍜" },
  { id: "mexican", name: "Mexican", emoji: "🌮" },
];

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=80`;

export const restaurants: Restaurant[] = [
  {
    id: "r1",
    name: "Bella Napoli",
    image: img("photo-1555396273-367ea4eb4db5"),
    rating: 4.7,
    deliveryTime: "25-30 min",
    distance: "1.2 km",
    cuisine: "Italian, Pizza",
    deliveryFee: 2.5,
    veg: false,
    offer: "20% OFF up to $5",
  },
  {
    id: "r2",
    name: "Sushi Zen",
    image: img("photo-1579584425555-c3ce17fd4351"),
    rating: 4.8,
    deliveryTime: "30-40 min",
    distance: "2.4 km",
    cuisine: "Japanese, Sushi",
    deliveryFee: 3.0,
    veg: false,
  },
  {
    id: "r3",
    name: "Green Bowl",
    image: img("photo-1512621776951-a57141f2eefd"),
    rating: 4.6,
    deliveryTime: "15-20 min",
    distance: "0.8 km",
    cuisine: "Healthy, Salads",
    deliveryFee: 1.5,
    veg: true,
    offer: "Free delivery",
  },
  {
    id: "r4",
    name: "Burger Republic",
    image: img("photo-1568901346375-23c9450c58cd"),
    rating: 4.5,
    deliveryTime: "20-25 min",
    distance: "1.6 km",
    cuisine: "American, Burgers",
    deliveryFee: 2.0,
    veg: false,
  },
  {
    id: "r5",
    name: "Taco Fiesta",
    image: img("photo-1565299585323-38d6b0865b47"),
    rating: 4.4,
    deliveryTime: "25-35 min",
    distance: "2.0 km",
    cuisine: "Mexican",
    deliveryFee: 2.5,
    veg: false,
    offer: "Buy 1 Get 1",
  },
  {
    id: "r6",
    name: "Noodle House",
    image: img("photo-1552611052-33e04de081de"),
    rating: 4.6,
    deliveryTime: "30-40 min",
    distance: "3.1 km",
    cuisine: "Asian, Chinese",
    deliveryFee: 2.0,
    veg: false,
  },
  {
    id: "r7",
    name: "Sweet Studio",
    image: img("photo-1488477181946-6428a0291777"),
    rating: 4.9,
    deliveryTime: "20-30 min",
    distance: "1.4 km",
    cuisine: "Desserts, Bakery",
    deliveryFee: 1.99,
    veg: true,
  },
  {
    id: "r8",
    name: "Spice Route",
    image: img("photo-1585937421612-70a008356fbe"),
    rating: 4.5,
    deliveryTime: "35-45 min",
    distance: "2.8 km",
    cuisine: "Indian",
    deliveryFee: 2.5,
    veg: false,
  },
];

export const dishes: Dish[] = [
  {
    id: "d1",
    name: "Pepperoni Pizza",
    price: 14.99,
    rating: 4.8,
    image: img("photo-1565299624946-b28f40a0ae38"),
    restaurantId: "r1",
    restaurantName: "Bella Napoli",
    description:
      "Wood-fired crust topped with san marzano tomato, mozzarella fior di latte, and spicy pepperoni.",
    ingredients: ["Mozzarella", "Pepperoni", "Tomato", "Basil", "Olive oil"],
    veg: false,
    category: "pizza",
  },
  {
    id: "d2",
    name: "Salmon Nigiri Set",
    price: 18.5,
    rating: 4.9,
    image: img("photo-1579871494447-9811cf80d66c"),
    restaurantId: "r2",
    restaurantName: "Sushi Zen",
    description: "Eight pieces of premium salmon nigiri served with wasabi and pickled ginger.",
    ingredients: ["Salmon", "Sushi rice", "Wasabi", "Nori"],
    veg: false,
    category: "sushi",
  },
  {
    id: "d3",
    name: "Buddha Bowl",
    price: 11.5,
    rating: 4.7,
    image: img("photo-1546793665-c74683f339c1"),
    restaurantId: "r3",
    restaurantName: "Green Bowl",
    description: "Quinoa, roasted chickpeas, avocado, hummus, and seasonal greens with tahini dressing.",
    ingredients: ["Quinoa", "Avocado", "Chickpeas", "Kale", "Tahini"],
    veg: true,
    category: "salad",
  },
  {
    id: "d4",
    name: "Classic Cheeseburger",
    price: 10.99,
    rating: 4.6,
    image: img("photo-1568901346375-23c9450c58cd"),
    restaurantId: "r4",
    restaurantName: "Burger Republic",
    description: "Angus beef patty, cheddar, house sauce, lettuce, tomato on a brioche bun.",
    ingredients: ["Beef", "Cheddar", "Brioche", "Lettuce", "Tomato"],
    veg: false,
    category: "burger",
  },
  {
    id: "d5",
    name: "Street Tacos (3)",
    price: 9.99,
    rating: 4.5,
    image: img("photo-1565299585323-38d6b0865b47"),
    restaurantId: "r5",
    restaurantName: "Taco Fiesta",
    description: "Three soft corn tortillas with your choice of protein, cilantro, and onion.",
    ingredients: ["Corn tortilla", "Cilantro", "Onion", "Lime"],
    veg: false,
    category: "mexican",
  },
  {
    id: "d6",
    name: "Ramen Tonkotsu",
    price: 13.5,
    rating: 4.7,
    image: img("photo-1552611052-33e04de081de"),
    restaurantId: "r6",
    restaurantName: "Noodle House",
    description: "24-hour pork broth, chashu, soft egg, scallions, and fresh noodles.",
    ingredients: ["Noodles", "Pork", "Egg", "Scallions"],
    veg: false,
    category: "asian",
  },
  {
    id: "d7",
    name: "Chocolate Lava Cake",
    price: 7.5,
    rating: 4.9,
    image: img("photo-1606313564200-e75d5e30476c"),
    restaurantId: "r7",
    restaurantName: "Sweet Studio",
    description: "Warm chocolate cake with a molten center, vanilla ice cream on the side.",
    ingredients: ["Chocolate", "Butter", "Egg", "Sugar"],
    veg: true,
    category: "dessert",
  },
  {
    id: "d8",
    name: "Butter Chicken",
    price: 13.99,
    rating: 4.6,
    image: img("photo-1585937421612-70a008356fbe"),
    restaurantId: "r8",
    restaurantName: "Spice Route",
    description: "Tender chicken in a creamy tomato and butter gravy, served with basmati rice.",
    ingredients: ["Chicken", "Tomato", "Butter", "Cream", "Spices"],
    veg: false,
    category: "asian",
  },
];

export const addOns = [
  { id: "a1", name: "Extra Cheese", price: 1.5 },
  { id: "a2", name: "Garlic Bread", price: 3.5 },
  { id: "a3", name: "Coca-Cola", price: 2.0 },
  { id: "a4", name: "Fries", price: 3.0 },
];

export const reviews = [
  { id: 1, name: "Sarah M.", rating: 5, text: "Absolutely delicious, arrived hot and fresh!" },
  { id: 2, name: "James K.", rating: 4, text: "Great flavor, portion could be a bit bigger." },
  { id: 3, name: "Priya R.", rating: 5, text: "My new favorite — ordering again this weekend." },
];

export function getDish(id: string) {
  return dishes.find((d) => d.id === id);
}
export function getRestaurant(id: string) {
  return restaurants.find((r) => r.id === id);
}
