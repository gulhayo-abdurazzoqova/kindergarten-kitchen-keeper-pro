
import { create } from 'zustand';
import { 
  Ingredient, 
  Meal, 
  ServingRecord, 
  Alert, 
  User, 
  sampleIngredients, 
  sampleMeals, 
  sampleServings, 
  sampleAlerts, 
  sampleUsers 
} from '../utils/data';
import { 
  calculateIngredientsNeeded, 
  deductIngredientsFromInventory,
  hasEnoughIngredients 
} from '../utils/calculations';

interface KitchenState {
  // Data
  ingredients: Ingredient[];
  meals: Meal[];
  servingRecords: ServingRecord[];
  alerts: Alert[];
  users: User[];
  currentUser: User | null;
  
  // Ingredient actions
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  
  // Meal actions
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  updateMeal: (id: string, updates: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  
  // Serving actions
  serveMeal: (mealId: string, portions: number) => { success: boolean; message: string };
  
  // Alert actions
  markAlertAsRead: (id: string) => void;
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  
  // User actions
  login: (userId: string) => boolean;
  logout: () => void;
}

// Helper for generating IDs
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const useKitchenStore = create<KitchenState>((set, get) => ({
  ingredients: sampleIngredients,
  meals: sampleMeals,
  servingRecords: sampleServings,
  alerts: sampleAlerts,
  users: sampleUsers,
  currentUser: sampleUsers[0], // Default to admin for demo

  addIngredient: (ingredient) => {
    const newIngredient = {
      ...ingredient,
      id: generateId()
    };
    set((state) => ({
      ingredients: [...state.ingredients, newIngredient]
    }));
  },
  
  updateIngredient: (id, updates) => {
    set((state) => ({
      ingredients: state.ingredients.map((ingredient) => 
        ingredient.id === id ? { ...ingredient, ...updates } : ingredient
      )
    }));
  },
  
  deleteIngredient: (id) => {
    set((state) => ({
      ingredients: state.ingredients.filter((ingredient) => ingredient.id !== id)
    }));
  },
  
  addMeal: (meal) => {
    const newMeal = {
      ...meal,
      id: generateId()
    };
    set((state) => ({
      meals: [...state.meals, newMeal]
    }));
  },
  
  updateMeal: (id, updates) => {
    set((state) => ({
      meals: state.meals.map((meal) => 
        meal.id === id ? { ...meal, ...updates } : meal
      )
    }));
  },
  
  deleteMeal: (id) => {
    set((state) => ({
      meals: state.meals.filter((meal) => meal.id !== id)
    }));
  },
  
  serveMeal: (mealId, portions) => {
    const state = get();
    const meal = state.meals.find(m => m.id === mealId);
    
    if (!meal) {
      return { success: false, message: "Meal not found" };
    }
    
    if (!hasEnoughIngredients(meal, state.ingredients, portions)) {
      // Create a low stock alert
      const newAlert: Omit<Alert, 'id'> = {
        type: 'low_stock',
        message: `Not enough ingredients to serve ${portions} portions of ${meal.name}`,
        date: new Date().toISOString(),
        isRead: false
      };
      state.addAlert(newAlert);
      
      return { success: false, message: "Not enough ingredients" };
    }
    
    // Calculate ingredients needed
    const ingredientsNeeded = calculateIngredientsNeeded(meal, portions);
    
    // Deduct ingredients from inventory
    const updatedIngredients = deductIngredientsFromInventory(
      state.ingredients, 
      ingredientsNeeded
    );
    
    // Create serving record
    const newServingRecord: ServingRecord = {
      id: generateId(),
      mealId: meal.id,
      servingDate: new Date().toISOString(),
      portions,
      userId: state.currentUser?.id || 'unknown'
    };
    
    set({
      ingredients: updatedIngredients,
      servingRecords: [...state.servingRecords, newServingRecord]
    });
    
    // Check for low stock after serving
    const lowStockIngredients = updatedIngredients.filter(
      ing => ing.quantity < ing.minimumQuantity
    );
    
    if (lowStockIngredients.length > 0) {
      lowStockIngredients.forEach(ing => {
        const newAlert: Omit<Alert, 'id'> = {
          type: 'low_stock',
          message: `${ing.name} is below minimum quantity`,
          date: new Date().toISOString(),
          isRead: false
        };
        state.addAlert(newAlert);
      });
    }
    
    return { 
      success: true, 
      message: `Successfully served ${portions} portions of ${meal.name}` 
    };
  },
  
  markAlertAsRead: (id) => {
    set((state) => ({
      alerts: state.alerts.map((alert) => 
        alert.id === id ? { ...alert, isRead: true } : alert
      )
    }));
  },
  
  addAlert: (alert) => {
    const newAlert = {
      ...alert,
      id: generateId()
    };
    set((state) => ({
      alerts: [newAlert, ...state.alerts]
    }));
  },
  
  login: (userId) => {
    const user = get().users.find(u => u.id === userId);
    if (user) {
      set({ currentUser: user });
      return true;
    }
    return false;
  },
  
  logout: () => {
    set({ currentUser: null });
  }
}));
