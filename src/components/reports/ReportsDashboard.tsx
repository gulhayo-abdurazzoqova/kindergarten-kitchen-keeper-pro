
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useKitchenStore } from '@/store';

const ReportsDashboard: React.FC = () => {
  const { servingRecords, meals, ingredients } = useKitchenStore();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  // Get the meal names for served meals
  const mealNames = new Map(meals.map(meal => [meal.id, meal.name]));

  // Calculate total portions served by meal
  const portionsByMeal = meals.map(meal => {
    const totalPortions = servingRecords
      .filter(record => record.mealId === meal.id)
      .reduce((sum, record) => sum + record.portions, 0);
    
    return {
      name: meal.name,
      portions: totalPortions
    };
  });

  // Sort by most served portions
  portionsByMeal.sort((a, b) => b.portions - a.portions);

  // Calculate serving history for time-based chart
  const now = new Date();
  const timeFilterMap = {
    day: 1,
    week: 7,
    month: 30
  };
  
  const timeFilter = timeFilterMap[period];
  const earliestDate = new Date();
  earliestDate.setDate(now.getDate() - timeFilter);

  const filteredServings = servingRecords.filter(record => {
    const recordDate = new Date(record.servingDate);
    return recordDate >= earliestDate;
  });

  // Group servings by date
  const servingsByDate = filteredServings.reduce((acc, record) => {
    const date = new Date(record.servingDate).toLocaleDateString();
    if (!acc[date]) acc[date] = { date, portions: 0 };
    acc[date].portions += record.portions;
    return acc;
  }, {} as Record<string, { date: string; portions: number }>);

  const servingTrend = Object.values(servingsByDate).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate ingredient usage percentages
  const ingredientUsage = ingredients.map(ingredient => {
    // Find all meal ingredients that use this ingredient
    const totalUsed = servingRecords.reduce((total, record) => {
      const meal = meals.find(m => m.id === record.mealId);
      if (!meal) return total;

      const mealIngredient = meal.ingredients.find(
        ing => ing.ingredientId === ingredient.id
      );
      
      if (mealIngredient) {
        return total + (mealIngredient.quantity * record.portions);
      }
      
      return total;
    }, 0);
    
    return {
      name: ingredient.name,
      value: totalUsed
    };
  });

  // Filter out ingredients with zero usage
  const usedIngredients = ingredientUsage.filter(item => item.value > 0);

  // Sort by usage (descending)
  usedIngredients.sort((a, b) => b.value - a.value);

  // Take top 5 ingredients
  const topIngredients = usedIngredients.slice(0, 5);

  const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF9800', '#F44336', '#9C27B0', '#3F51B5'];

  // Format serving records for table
  const recentServings = [...servingRecords]
    .sort((a, b) => new Date(b.servingDate).getTime() - new Date(a.servingDate).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Kitchen Reports</h2>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="meals">Meals</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Meals Served</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {servingRecords.reduce((sum, record) => sum + record.portions, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Portions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unique Meals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {new Set(servingRecords.map(record => record.mealId)).size}
                </div>
                <p className="text-xs text-muted-foreground">
                  Different meals served
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {ingredients.filter(ing => ing.quantity <= ing.minimumQuantity).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ingredients below minimum
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Serving Trend</CardTitle>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setPeriod('day')}
                    className={`px-2 py-1 text-xs rounded ${period === 'day' ? 'bg-kitchen-green text-white' : 'bg-gray-100'}`}
                  >
                    24h
                  </button>
                  <button
                    onClick={() => setPeriod('week')}
                    className={`px-2 py-1 text-xs rounded ${period === 'week' ? 'bg-kitchen-green text-white' : 'bg-gray-100'}`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setPeriod('month')}
                    className={`px-2 py-1 text-xs rounded ${period === 'month' ? 'bg-kitchen-green text-white' : 'bg-gray-100'}`}
                  >
                    30 Days
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={servingTrend}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="portions"
                        name="Portions Served"
                        stroke="#4CAF50"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Top Ingredients Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topIngredients}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {topIngredients.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Meals Tab */}
        <TabsContent value="meals">
          <Card>
            <CardHeader>
              <CardTitle>Meal Portions Served</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={portionsByMeal}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="portions" name="Portions Served" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ingredients Tab */}
        <TabsContent value="ingredients">
          <Card>
            <CardHeader>
              <CardTitle>Ingredient Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={usedIngredients} 
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Amount Used" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Meal Servings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Served By</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentServings.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(record.servingDate).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {mealNames.get(record.mealId) || 'Unknown Meal'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {record.portions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {record.userId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsDashboard;
