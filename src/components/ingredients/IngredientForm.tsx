
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
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
import { Ingredient } from '@/utils/data';

interface IngredientFormProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
}

interface FormValues {
  name: string;
  quantity: number;
  unit: 'g' | 'kg' | 'ml' | 'l' | 'pcs';
  deliveryDate: string;
  minimumQuantity: number;
}

const IngredientForm: React.FC<IngredientFormProps> = ({ 
  isOpen, 
  onClose, 
  ingredient 
}) => {
  const { addIngredient, updateIngredient } = useKitchenStore();
  
  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      quantity: 0,
      unit: 'g',
      deliveryDate: new Date().toISOString().split('T')[0],
      minimumQuantity: 0
    }
  });
  
  // Reset form when editing different ingredients
  useEffect(() => {
    if (ingredient) {
      form.reset({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        deliveryDate: ingredient.deliveryDate.split('T')[0],
        minimumQuantity: ingredient.minimumQuantity
      });
    } else {
      form.reset({
        name: '',
        quantity: 0,
        unit: 'g',
        deliveryDate: new Date().toISOString().split('T')[0],
        minimumQuantity: 0
      });
    }
  }, [ingredient, form]);
  
  const onSubmit = (values: FormValues) => {
    if (ingredient) {
      updateIngredient(ingredient.id, {
        name: values.name,
        quantity: values.quantity,
        unit: values.unit,
        deliveryDate: values.deliveryDate,
        minimumQuantity: values.minimumQuantity
      });
    } else {
      addIngredient({
        name: values.name,
        quantity: values.quantity,
        unit: values.unit,
        deliveryDate: values.deliveryDate,
        minimumQuantity: values.minimumQuantity
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {ingredient ? 'Edit Ingredient' : 'Add New Ingredient'}
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingredient name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantity"
              rules={{ 
                required: 'Quantity is required',
                min: { value: 0, message: 'Quantity must be positive' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0}
                      step={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="g">grams (g)</SelectItem>
                      <SelectItem value="kg">kilograms (kg)</SelectItem>
                      <SelectItem value="ml">milliliters (ml)</SelectItem>
                      <SelectItem value="l">liters (l)</SelectItem>
                      <SelectItem value="pcs">pieces (pcs)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deliveryDate"
              rules={{ required: 'Delivery date is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="minimumQuantity"
              rules={{ 
                required: 'Minimum quantity is required',
                min: { value: 0, message: 'Minimum quantity must be positive' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0}
                      step={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
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
                {ingredient ? 'Save Changes' : 'Add Ingredient'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default IngredientForm;
