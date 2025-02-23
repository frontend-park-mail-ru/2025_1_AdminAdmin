export const restaurantList = [
  {
    id: 1,
    name: "Italiano Pizza",
    image: "images/italiano_pizza.jpg",
    rating: 4.8,
    distance: "1.2 km",
    time: "25-30 min",
    additionalInfo: "Authentic Italian pizza with fresh ingredients.",
    address: "123 Pizza Street, Downtown",
    workingHours: {
      Monday: { open: "10:00", close: "22:00" },
      Tuesday: { open: "10:00", close: "22:00" },
      Wednesday: { open: "10:00", close: "22:00" },
      Thursday: { open: "10:00", close: "22:00" },
      Friday: { open: "10:00", close: "23:00" },
      Saturday: { open: "11:00", close: "23:00" },
      Sunday: { open: "11:00", close: "21:00" }
    }
  },
  {
    id: 2,
    name: "Sushi Master",
    image: "images/sushi_master.jpg",
    rating: 4.6,
    distance: "2.5 km",
    time: "30-40 min",
    additionalInfo: "Traditional Japanese sushi and rolls.",
    address: "456 Sushi Avenue, Uptown",
    workingHours: {
      Monday: { open: "12:00", close: "22:00" },
      Tuesday: { open: "12:00", close: "22:00" },
      Wednesday: { open: "12:00", close: "22:00" },
      Thursday: { open: "12:00", close: "22:00" },
      Friday: { open: "12:00", close: "23:00" },
      Saturday: { open: "13:00", close: "23:00" },
      Sunday: { open: "13:00", close: "21:00" }
    }
  },
  {
    id: 3,
    name: "Burger House",
    image: "images/burger_house.jpg",
    rating: 4.5,
    distance: "800 m",
    time: "15-20 min",
    additionalInfo: "Juicy burgers with premium beef and homemade sauces.",
    address: "789 Burger Lane, Midtown",
    workingHours: {
      Monday: { open: "09:00", close: "23:00" },
      Tuesday: { open: "09:00", close: "23:00" },
      Wednesday: { open: "09:00", close: "23:00" },
      Thursday: { open: "09:00", close: "23:00" },
      Friday: { open: "09:00", close: "24:00" },
      Saturday: { open: "10:00", close: "24:00" },
      Sunday: { open: "10:00", close: "22:00" }
    }
  },
  {
    id: 4,
    name: "Vegan Delight",
    image: "images/vegan_delight.jpg",
    rating: 4.7,
    distance: "3 km",
    time: "20-25 min",
    additionalInfo: "Healthy and delicious vegan meals.",
    address: "101 Vegan Blvd, Green District",
    workingHours: {
      Monday: { open: "11:00", close: "21:00" },
      Tuesday: { open: "11:00", close: "21:00" },
      Wednesday: { open: "11:00", close: "21:00" },
      Thursday: { open: "11:00", close: "21:00" },
      Friday: { open: "11:00", close: "22:00" },
      Saturday: { open: "12:00", close: "22:00" },
      Sunday: { open: "12:00", close: "20:00" }
    }
  },
  {
    id: 5,
    name: "Steak & Grill",
    image: "images/steak_grill.jpg",
    rating: 4.9,
    distance: "5 km",
    time: "40-50 min",
    additionalInfo: "High-quality steaks and grilled dishes.",
    address: "202 Grill Road, West End",
    workingHours: {
      Monday: { open: "12:00", close: "23:00" },
      Tuesday: { open: "12:00", close: "23:00" },
      Wednesday: { open: "12:00", close: "23:00" },
      Thursday: { open: "12:00", close: "23:00" },
      Friday: { open: "12:00", close: "24:00" },
      Saturday: { open: "13:00", close: "24:00" },
      Sunday: { open: "13:00", close: "22:00" }
    }
  }
];


export const menuItems = {
  "Pizza": [
    { id: 101, name: "Margherita", price: 8.99, description: "Classic Margherita with fresh tomatoes, mozzarella, and basil." },
    { id: 102, name: "Pepperoni", price: 9.99, description: "Pepperoni pizza with spicy salami and cheese." }
  ],
  "Sushi": [
    { id: 201, name: "California Roll", price: 6.99, description: "Crab, avocado, cucumber, and rice wrapped in nori." },
    { id: 202, name: "Salmon Nigiri", price: 7.99, description: "Fresh salmon slice over seasoned rice." }
  ],
  "Burgers": [
    { id: 301, name: "Classic Cheeseburger", price: 10.99, description: "Beef patty, cheddar cheese, lettuce, and tomato." },
    { id: 302, name: "BBQ Bacon Burger", price: 12.99, description: "Beef patty with crispy bacon and BBQ sauce." }
  ],
  "Vegan": [
    { id: 401, name: "Vegan Buddha Bowl", price: 9.49, description: "Quinoa, chickpeas, avocado, and fresh veggies." },
    { id: 402, name: "Tofu Stir Fry", price: 8.99, description: "Tofu sautéed with vegetables and soy sauce." }
  ],
  "Steak": [
    { id: 501, name: "Ribeye Steak", price: 19.99, description: "Grilled ribeye steak with garlic butter." },
    { id: 502, name: "T-Bone Steak", price: 22.99, description: "Juicy T-bone steak cooked to perfection." }
  ]
};

export const restaurantMenu = {
  1: [101, 102],
  2: [201, 202],
  3: [301, 302],
  4: [401, 402],
  5: [501, 502]
};