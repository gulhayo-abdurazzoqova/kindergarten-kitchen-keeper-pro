
import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKitchenStore } from '@/store';
import { Meal, MealIngredient } from '@/utils/data';
import { Plus, Trash } from 'lucide-react';

interface MealFormProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal | null;
}

interface FormValues {
  name: string;
  description: string;
  servingSize: number;
  ingredients: {
    ingredientId: string;
    quantity: number;
  }[];
}

const MealForm: React.FC<MealFormProps> = ({ isOpen, onClose, meal }) => {
  const { ingredients, addMeal, updateMeal } = useKitchenStore();
  
  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      servingSize: 0,
      ingredients: [{ ingredientId: '', quantity: 0 }]
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients"
  });
  
  // Reset form when editing different meals
  useEffect(() => {
    if (meal) {
      form.reset({
        name: meal.name,
        description: meal.description,
        servingSize: meal.servingSize,
        ingredients: meal.ingredients.length > 0 ? 
          meal.ingredients : 
          [{ ingredientId: '', quantity: 0 }]
      });
    } else {
      form.reset({
        name: '',
        description: '',
        servingSize: 0,
        ingredients: [{ ingredientId: '', quantity: 0 }]
      });
    }
  }, [meal, form]);
  
  const onSubmit = (values: FormValues) => {
    // Filter out empty ingredients
    const validIngredients = values.ingredients.filter(
      ing => ing.ingredientId && ing.quantity > 0
    );
    
    if (meal) {
      updateMeal(meal.id, {
        name: values.name,
        description: values.description,
        servingSize: values.servingSize,
        ingredients: validIngredients
      });
    } else {
      addMeal({
        name: values.name,
        description: values.description,
        servingSize: values.servingSize,
        ingredients: validIngredients
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {meal ? 'Edit Meal' : 'Add New Meal'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Meal name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Short description of the meal"
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="servingSize"
              rules={{ 
                required: 'Serving size is required',
                min: { value: 1, message: 'Serving size must be greater than 0' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serving Size (g/portion)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1}
                      step={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <FormLabel>Ingredients</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ ingredientId: '', quantity: 0 })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Ingredient
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2 mb-3">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.ingredientId`}
                    rules={{ required: 'Ingredient is required' }}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className={index !== 0 ? 'sr-only' : ''}>
                          Ingredient
                        </FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ingredient" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ingredients.map(ingredient => (
                              <SelectItem key={ingredient.id} value={ingredient.id}>
                                {ingredient.name} ({ingredient.quantity} {ingredient.unit} available)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.quantity`}
                    rules={{ 
                      required: 'Quantity is required',
                      min: { value: 1, message: 'Quantity must be greater than 0' }
                    }}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel className={index !== 0 ? 'sr-only' : ''}>
                          Quantity
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1}
                            step={1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="mb-1"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <FormDescription>
                For each ingredient, specify the amount needed per portion.
              </FormDescription>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-kitchen-green hover:bg-kitchen-green/90"
              >
                {meal ? 'Save Changes' : 'Add Meal'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MealForm;
