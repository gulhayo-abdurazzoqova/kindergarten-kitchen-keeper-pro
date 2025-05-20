
import React, { useState } from 'react';
import { useKitchenStore } from '@/store';
import { Meal } from '@/utils/data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash, Utensils } from 'lucide-react';
import { calculatePossiblePortions } from '@/utils/calculations';
import MealForm from './MealForm';

const MealList: React.FC = () => {
  const { meals, ingredients, deleteMeal } = useKitchenStore();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  
  const handleDeleteClick = (id: string) => {
    setMealToDelete(id);
    setDeleteConfirmOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (mealToDelete) {
      deleteMeal(mealToDelete);
      setDeleteConfirmOpen(false);
      setMealToDelete(null);
    }
  };
  
  const handleEditClick = (meal: Meal) => {
    setEditingMeal(meal);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingMeal(null);
    setIsFormOpen(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meals</h2>
        <Button 
          onClick={handleAddNew}
          className="bg-kitchen-green hover:bg-kitchen-green/90"
        >
          Add Meal
        </Button>
      </div>
      
      {meals.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No meals added yet</p>
          <Button 
            onClick={handleAddNew} 
            variant="link" 
            className="mt-2 text-kitchen-green"
          >
            Add your first meal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meals.map((meal) => {
            const possiblePortions = calculatePossiblePortions(meal, ingredients);
            
            return (
              <Card key={meal.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-kitchen-green/10 to-kitchen-blue/10">
                  <CardTitle>{meal.name}</CardTitle>
                  <CardDescription>{meal.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">Ingredients:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {meal.ingredients.map((ing) => {
                          const ingredient = ingredients.find(i => i.id === ing.ingredientId);
                          return (
                            <li key={ing.ingredientId}>
                              {ingredient?.name}: {ing.quantity} {ingredient?.unit}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium text-sm">Serving size:</h4>
                        <p className="text-sm">{meal.servingSize}g per portion</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Available:</h4>
                        <p className={`text-sm font-medium ${possiblePortions === 0 ? 'text-red-500' : 'text-kitchen-green'}`}>
                          {possiblePortions} portions
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-gray-50 flex justify-between">
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditClick(meal)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteClick(meal.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this meal
              from the menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Add/Edit Meal Form */}
      <MealForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        meal={editingMeal}
      />
    </div>
  );
};

export default MealList;
