
import { Ingredient, Meal, MealIngredient } from './data';

// Calculate how many portions can be made from current ingredients
export const calculatePossiblePortions = (
  meal: Meal,
  ingredients: Ingredient[]
): number => {
  const portionLimits: number[] = [];

  meal.ingredients.forEach((mealIngredient) => {
    const ingredient = ingredients.find(i => i.id === mealIngredient.ingredientId);
    
    if (ingredient) {
      // How many portions can be made with this ingredient
      const possiblePortions = Math.floor(ingredient.quantity / mealIngredient.quantity);
      portionLimits.push(possiblePortions);
    } else {
      // If ingredient not found, no portions can be made
      portionLimits.push(0);
    }
  });

  // Return the minimum (limiting factor)
  return Math.min(...portionLimits) || 0;
};

// Check if we have enough ingredients for a certain number of portions
export const hasEnoughIngredients = (
  meal: Meal,
  ingredients: Ingredient[],
  portions: number
): boolean => {
  return calculatePossiblePortions(meal, ingredients) >= portions;
};

// Calculate total ingredients needed for a meal with given portions
export const calculateIngredientsNeeded = (
  meal: Meal,
  portions: number
): MealIngredient[] => {
  return meal.ingredients.map(ingredient => ({
    ingredientId: ingredient.ingredientId,
    quantity: ingredient.quantity * portions
  }));
};

// Deduct ingredients from inventory after serving
export const deductIngredientsFromInventory = (
  ingredients: Ingredient[],
  mealIngredients: MealIngredient[]
): Ingredient[] => {
  const updatedIngredients = [...ingredients];
  
  mealIngredients.forEach(mealIngredient => {
    const ingredientIndex = updatedIngredients.findIndex(
      i => i.id === mealIngredient.ingredientId
    );
    
    if (ingredientIndex !== -1) {
      updatedIngredients[ingredientIndex] = {
        ...updatedIngredients[ingredientIndex],
        quantity: updatedIngredients[ingredientIndex].quantity - mealIngredient.quantity
      };
    }
  });
  
  return updatedIngredients;
};

// Check which ingredients are below minimum quantity
export const checkLowStockIngredients = (
  ingredients: Ingredient[]
): Ingredient[] => {
  return ingredients.filter(
    ingredient => ingredient.quantity < ingredient.minimumQuantity
  );
};

// Generate monthly consumption report
export const generateMonthlyReport = (
  mealServings: { mealId: string; portions: number; date: string }[],
  meals: Meal[],
  ingredients: Ingredient[]
) => {
  // Filter servings for current month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthlyServings = mealServings.filter(serving => {
    const servingDate = new Date(serving.date);
    return (
      servingDate.getMonth() === currentMonth &&
      servingDate.getFullYear() === currentYear
    );
  });
  
  // Calculate total portions served and total ingredients used
  const totalPortionsServed = monthlyServings.reduce(
    (sum, serving) => sum + serving.portions,
    0
  );
  
  // Calculate total possible portions based on start-of-month inventory
  // This is simplified - a real implementation would need to track inventory changes
  const totalPossiblePortions = meals.reduce((sum, meal) => {
    return sum + calculatePossiblePortions(meal, ingredients);
  }, 0);
  
  // Calculate difference percentage
  const difference = totalPossiblePortions > 0
    ? ((totalPossiblePortions - totalPortionsServed) / totalPossiblePortions) * 100
    : 0;
  
  return {
    month: currentDate.toLocaleString('default', { month: 'long' }),
    year: currentYear,
    totalPortionsServed,
    totalPossiblePortions,
    difference,
    isMisuse: difference > 15
  };
};
