
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useKitchenStore } from '@/store';
import { calculatePossiblePortions } from '@/utils/calculations';
import { toast } from '@/components/ui/sonner';

const ServeMeal: React.FC = () => {
  const { meals, ingredients, serveMeal } = useKitchenStore();
  const { toast: uiToast } = useToast();
  const [selectedMealId, setSelectedMealId] = useState<string>('');
  const [portions, setPortions] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the selected meal
  const selectedMeal = meals.find(m => m.id === selectedMealId);
  
  // Calculate possible portions
  const possiblePortions = selectedMeal
    ? calculatePossiblePortions(selectedMeal, ingredients)
    : 0;

  const handleServeMeal = async () => {
    if (!selectedMealId) {
      toast.error('Please select a meal first');
      return;
    }

    if (portions < 1) {
      toast.error('Portions must be at least 1');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await serveMeal(selectedMealId, portions);
      
      if (result.success) {
        toast.success(result.message);
        // Reset form after successful serving
        setSelectedMealId('');
        setPortions(1);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to serve meal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Serve Meal</CardTitle>
          <CardDescription>
            Select a meal and specify how many portions to serve.
            When you serve a meal, ingredients will be deducted from the inventory.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meal">Select Meal</Label>
            <Select
              value={selectedMealId}
              onValueChange={setSelectedMealId}
            >
              <SelectTrigger id="meal">
                <SelectValue placeholder="Select a meal" />
              </SelectTrigger>
              <SelectContent>
                {meals.map(meal => (
                  <SelectItem 
                    key={meal.id} 
                    value={meal.id}
                  >
                    {meal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMeal && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">{selectedMeal.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{selectedMeal.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Ingredients:</h4>
                  <ul className="text-sm">
                    {selectedMeal.ingredients.map(ing => {
                      const ingredient = ingredients.find(i => i.id === ing.ingredientId);
                      return (
                        <li key={ing.ingredientId} className="flex justify-between">
                          <span>{ingredient?.name}</span>
                          <span>{ing.quantity}{ingredient?.unit}/portion</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <div className="bg-green-50 p-2 rounded-md border border-green-200">
                    <h4 className="text-sm font-medium">Available:</h4>
                    <p className={`text-xl font-bold ${possiblePortions === 0 ? 'text-red-500' : 'text-kitchen-green'}`}>
                      {possiblePortions} portions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="portions">Number of Portions</Label>
            <Input
              id="portions"
              type="number"
              min={1}
              max={possiblePortions}
              value={portions}
              onChange={e => setPortions(parseInt(e.target.value) || 1)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            onClick={handleServeMeal}
            disabled={isSubmitting || !selectedMealId || portions < 1 || portions > possiblePortions}
            className="bg-kitchen-green hover:bg-kitchen-green/90"
          >
            Serve Meal
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ServeMeal;
