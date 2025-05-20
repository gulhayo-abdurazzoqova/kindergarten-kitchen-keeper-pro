
// Types
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'cook' | 'manager';
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: 'g' | 'kg' | 'ml' | 'l' | 'pcs';
  deliveryDate: string;
  minimumQuantity: number;
}

export interface MealIngredient {
  ingredientId: string;
  quantity: number;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  ingredients: MealIngredient[];
  servingSize: number;
}

export interface ServingRecord {
  id: string;
  mealId: string;
  servingDate: string;
  portions: number;
  userId: string;
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'misuse';
  message: string;
  date: string;
  isRead: boolean;
}

// Sample users
export const sampleUsers: User[] = [
  { id: 'user1', name: 'Admin User', role: 'admin' },
  { id: 'user2', name: 'Cook User', role: 'cook' },
  { id: 'user3', name: 'Manager User', role: 'manager' }
];

// Sample ingredients
export const sampleIngredients: Ingredient[] = [
  { 
    id: 'ing1', 
    name: 'Potatoes', 
    quantity: 10000, 
    unit: 'g', 
    deliveryDate: '2025-05-15', 
    minimumQuantity: 1000 
  },
  { 
    id: 'ing2', 
    name: 'Carrots', 
    quantity: 5000, 
    unit: 'g', 
    deliveryDate: '2025-05-16', 
    minimumQuantity: 500 
  },
  { 
    id: 'ing3', 
    name: 'Chicken', 
    quantity: 7000, 
    unit: 'g', 
    deliveryDate: '2025-05-14', 
    minimumQuantity: 1000 
  },
  { 
    id: 'ing4', 
    name: 'Rice', 
    quantity: 6000, 
    unit: 'g', 
    deliveryDate: '2025-05-17', 
    minimumQuantity: 800 
  },
  { 
    id: 'ing5', 
    name: 'Milk', 
    quantity: 5000, 
    unit: 'ml', 
    deliveryDate: '2025-05-18', 
    minimumQuantity: 1000 
  },
  { 
    id: 'ing6', 
    name: 'Apples', 
    quantity: 20, 
    unit: 'pcs', 
    deliveryDate: '2025-05-17', 
    minimumQuantity: 5 
  }
];

// Sample meals
export const sampleMeals: Meal[] = [
  {
    id: 'meal1',
    name: 'Mashed Potatoes with Chicken',
    description: 'Creamy mashed potatoes served with roasted chicken',
    ingredients: [
      { ingredientId: 'ing1', quantity: 150 },
      { ingredientId: 'ing3', quantity: 100 },
      { ingredientId: 'ing5', quantity: 50 }
    ],
    servingSize: 250
  },
  {
    id: 'meal2',
    name: 'Vegetable Rice',
    description: 'Healthy rice with mixed vegetables',
    ingredients: [
      { ingredientId: 'ing2', quantity: 80 },
      { ingredientId: 'ing4', quantity: 120 }
    ],
    servingSize: 200
  },
  {
    id: 'meal3',
    name: 'Fruit Salad',
    description: 'Fresh fruit salad with apples',
    ingredients: [
      { ingredientId: 'ing6', quantity: 1 }
    ],
    servingSize: 100
  }
];

// Sample serving records
export const sampleServings: ServingRecord[] = [
  {
    id: 'serv1',
    mealId: 'meal1',
    servingDate: '2025-05-19T10:30:00',
    portions: 20,
    userId: 'user2'
  },
  {
    id: 'serv2',
    mealId: 'meal2',
    servingDate: '2025-05-19T12:00:00',
    portions: 15,
    userId: 'user2'
  },
  {
    id: 'serv3',
    mealId: 'meal3',
    servingDate: '2025-05-18T14:30:00',
    portions: 25,
    userId: 'user2'
  }
];

// Sample alerts
export const sampleAlerts: Alert[] = [
  {
    id: 'alert1',
    type: 'low_stock',
    message: 'Rice is running low',
    date: '2025-05-18T09:00:00',
    isRead: false
  },
  {
    id: 'alert2',
    type: 'misuse',
    message: 'Unusual consumption detected for Chicken',
    date: '2025-05-17T16:45:00',
    isRead: true
  }
];
