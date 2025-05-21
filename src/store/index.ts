
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
import { api } from '../api/client';
import { toast } from '@/components/ui/sonner';

interface KitchenState {
  // Data
  ingredients: Ingredient[];
  meals: Meal[];
  servingRecords: ServingRecord[];
  alerts: Alert[];
  users: User[];
  currentUser: User | null;
  
  // API Status
  isLoading: boolean;
  
  // Ingredient actions
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => Promise<void>;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  
  // Meal actions
  addMeal: (meal: Omit<Meal, 'id'>) => Promise<void>;
  updateMeal: (id: string, updates: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  
  // Serving actions
  serveMeal: (mealId: string, portions: number) => Promise<{ success: boolean; message: string }>;
  
  // Alert actions
  markAlertAsRead: (id: string) => void;
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  
  // User actions
  login: (userId: string) => boolean;
  logout: () => void;
  
  // Data loading actions
  fetchIngredients: () => Promise<void>;
  fetchMeals: () => Promise<void>;
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
  isLoading: false,

  fetchIngredients: async () => {
    try {
      set({ isLoading: true });
      const response = await api.ingredients.getAll();
      if (response.ingredients) {
        set({ ingredients: response.ingredients });
      }
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
      toast.error('Failed to fetch ingredients');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMeals: async () => {
    try {
      set({ isLoading: true });
      const response = await api.meals.getAll();
      if (response.meals) {
        set({ meals: response.meals });
      }
    } catch (error) {
      console.error('Failed to fetch meals:', error);
      toast.error('Failed to fetch meals');
    } finally {
      set({ isLoading: false });
    }
  },
  
  addIngredient: async (ingredient) => {
    try {
      set({ isLoading: true });
      const response = await api.ingredients.create(ingredient);
      if (response.ingredient) {
        set((state) => ({
          ingredients: [...state.ingredients, response.ingredient]
        }));
        toast.success('Ingredient added successfully');
      }
    } catch (error) {
      console.error('Failed to add ingredient:', error);
      toast.error('Failed to add ingredient');
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateIngredient: async (id, updates) => {
    try {
      set({ isLoading: true });
      const response = await api.ingredients.update(id, updates);
      if (response.ingredient) {
        set((state) => ({
          ingredients: state.ingredients.map((ingredient) => 
            ingredient.id === id ? { ...ingredient, ...response.ingredient } : ingredient
          )
        }));
        toast.success('Ingredient updated successfully');
      }
    } catch (error) {
      console.error('Failed to update ingredient:', error);
      toast.error('Failed to update ingredient');
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteIngredient: async (id) => {
    try {
      set({ isLoading: true });
      await api.ingredients.delete(id);
      set((state) => ({
        ingredients: state.ingredients.filter((ingredient) => ingredient.id !== id)
      }));
      toast.success('Ingredient deleted successfully');
    } catch (error) {
      console.error('Failed to delete ingredient:', error);
      toast.error('Failed to delete ingredient');
    } finally {
      set({ isLoading: false });
    }
  },
  
  addMeal: async (meal) => {
    try {
      set({ isLoading: true });
      const response = await api.meals.create(meal);
      if (response.meal) {
        set((state) => ({
          meals: [...state.meals, response.meal]
        }));
        toast.success('Meal added successfully');
      }
    } catch (error) {
      console.error('Failed to add meal:', error);
      toast.error('Failed to add meal');
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateMeal: async (id, updates) => {
    try {
      set({ isLoading: true });
      const response = await api.meals.update(id, updates);
      if (response.meal) {
        set((state) => ({
          meals: state.meals.map((meal) => 
            meal.id === id ? { ...meal, ...response.meal } : meal
          )
        }));
        toast.success('Meal updated successfully');
      }
    } catch (error) {
      console.error('Failed to update meal:', error);
      toast.error('Failed to update meal');
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteMeal: async (id) => {
    try {
      set({ isLoading: true });
      await api.meals.delete(id);
      set((state) => ({
        meals: state.meals.filter((meal) => meal.id !== id)
      }));
      toast.success('Meal deleted successfully');
    } catch (error) {
      console.error('Failed to delete meal:', error);
      toast.error('Failed to delete meal');
    } finally {
      set({ isLoading: false });
    }
  },
  
  serveMeal: async (mealId, portions) => {
    try {
      set({ isLoading: true });
      const response = await api.serve.serveMeal({
        mealId,
        portions,
        userId: get().currentUser?.id || 'unknown'
      });
      
      if (response.success) {
        // Refresh ingredients after serving
        await get().fetchIngredients();
        toast.success(response.message || 'Meal served successfully');
        return { success: true, message: response.message || 'Meal served successfully' };
      }
      
      return { success: false, message: 'Failed to serve meal' };
    } catch (error) {
      console.error('Failed to serve meal:', error);
      toast.error(error.message || 'Failed to serve meal');
      return { success: false, message: error.message || 'Failed to serve meal' };
    } finally {
      set({ isLoading: false });
    }
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
