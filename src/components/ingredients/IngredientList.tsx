
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Edit, Trash } from 'lucide-react';
import { useKitchenStore } from '@/store';
import { Ingredient } from '@/utils/data';
import IngredientForm from './IngredientForm';

const IngredientList: React.FC = () => {
  const { ingredients, deleteIngredient } = useKitchenStore();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  
  const handleDeleteClick = (id: string) => {
    setIngredientToDelete(id);
    setDeleteConfirmOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (ingredientToDelete) {
      deleteIngredient(ingredientToDelete);
      setDeleteConfirmOpen(false);
      setIngredientToDelete(null);
    }
  };
  
  const handleEditClick = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingIngredient(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ingredients</h2>
        <Button 
          onClick={handleAddNew}
          className="bg-kitchen-green hover:bg-kitchen-green/90"
        >
          Add Ingredient
        </Button>
      </div>
      
      {ingredients.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No ingredients added yet</p>
          <Button 
            onClick={handleAddNew} 
            variant="link" 
            className="mt-2 text-kitchen-green"
          >
            Add your first ingredient
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Min. Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">{ingredient.name}</TableCell>
                  <TableCell>{ingredient.quantity}</TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell>{new Date(ingredient.deliveryDate).toLocaleDateString()}</TableCell>
                  <TableCell>{ingredient.minimumQuantity}</TableCell>
                  <TableCell>
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${
                        ingredient.quantity <= ingredient.minimumQuantity
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {ingredient.quantity <= ingredient.minimumQuantity ? 'Low Stock' : 'In Stock'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditClick(ingredient)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(ingredient.id)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this ingredient
              from the inventory.
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
      
      {/* Add/Edit Ingredient Form */}
      <IngredientForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        ingredient={editingIngredient}
      />
    </div>
  );
};

export default IngredientList;
