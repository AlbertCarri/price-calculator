"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, Calculator, Moon, Sun } from "lucide-react";
import { stringify } from "querystring";
import { parse } from "path";

interface RawMaterial {
  id: string;
  name: string;
  pricePerKg: number;
}

interface Ingredient {
  id: string;
  materialId: string;
  grams: number;
}

interface Product {
  title: string;
  quantity: number;
  ingredients: Ingredient[];
}

/*localStorage.setItem(
  "rawMaterials",
  JSON.stringify([{ id: "1", name: "fgjh", pricePerKg: 100 }])
);*/

export default function CostCalculator() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [newMaterial, setNewMaterial] = useState({ name: "", pricePerKg: 0 });
  const [product, setProduct] = useState<Product>({
    title: "",
    quantity: 1,
    ingredients: [],
  });

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setIsDarkMode(storedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDark);
    }
    const localRawMaterial = localStorage.getItem("rawMaterials");
    const arrayMaterial = localRawMaterial ? JSON.parse(localRawMaterial) : [];
    setRawMaterials(arrayMaterial);
    console.log("array:", arrayMaterial);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const addRawMaterial = () => {
    if (
      newMaterial.name.trim() &&
      newMaterial.pricePerKg &&
      newMaterial.pricePerKg > 0
    ) {
      const material: RawMaterial = {
        id: Date.now().toString(),
        name: newMaterial.name.trim(),
        pricePerKg: newMaterial.pricePerKg,
      };
      setRawMaterials([...rawMaterials, material]);
      localStorage.setItem(
        "rawMaterials",
        JSON.stringify([...rawMaterials, material])
      );
      setNewMaterial({ name: "", pricePerKg: 0 });
    }
  };

  const removeRawMaterial = (id: string) => {
    setRawMaterials(rawMaterials.filter((m) => m.id !== id));
    setProduct((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((ing) => ing.materialId !== id),
    }));
  };

  const addIngredient = () => {
    const ingredient: Ingredient = {
      id: Date.now().toString(),
      materialId: "",
      grams: 0,
    };
    setProduct((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ingredient],
    }));
  };

  const updateIngredient = (
    id: string,
    field: keyof Ingredient,
    value: string | number
  ) => {
    setProduct((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  const removeIngredient = (id: string) => {
    setProduct((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((ing) => ing.id !== id),
    }));
  };

  const getIngredientCost = (materialId: string, grams: number) => {
    const material = rawMaterials.find((m) => m.id === materialId);
    if (!material) return 0;
    return (material.pricePerKg * grams) / 1000;
  };

  const totalRawMaterialCost = product.ingredients.reduce((total, ing) => {
    return total + getIngredientCost(ing.materialId, ing.grams);
  }, 0);

  const totalWithProfit = (totalRawMaterialCost * 100) / 35;
  const pricePerUnit =
    product.quantity > 0 ? totalWithProfit / product.quantity : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="flex items-center gap-2 bg-transparent"
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-4 w-4" />
                  Modo Claro
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Modo Oscuro
                </>
              )}
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Calculator className="h-8 w-8 text-primary" />
            Calculadora de Costos de Productos
          </h1>
          <p className="text-muted-foreground">
            Calcula el costo final de tus productos basado en materia prima
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">
                Datos de Materia Prima
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="materialName">Nombre del Producto</Label>
                  <Input
                    id="materialName"
                    value={newMaterial.name}
                    onChange={(e) =>
                      setNewMaterial((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Ej: Harina de trigo"
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerKg">Precio por Kg ($)</Label>
                  <Input
                    id="pricePerKg"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newMaterial.pricePerKg || ""}
                    onChange={(e) =>
                      setNewMaterial((prev) => ({
                        ...prev,
                        pricePerKg: Number.parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <Button
                onClick={addRawMaterial}
                className="w-full"
                disabled={
                  !newMaterial.name.trim() ||
                  !newMaterial.pricePerKg ||
                  newMaterial.pricePerKg <= 0
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Materia Prima
              </Button>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Precio por Kg</TableHead>
                      <TableHead className="w-16">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawMaterials.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground"
                        >
                          No hay materias primas cargadas
                        </TableCell>
                      </TableRow>
                    ) : (
                      rawMaterials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium">
                            {material.name}
                          </TableCell>
                          <TableCell>
                            ${material.pricePerKg.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeRawMaterial(material.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">
                Cálculo del precio de venta del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productTitle">Título del Producto</Label>
                  <Input
                    id="productTitle"
                    value={product.title}
                    onChange={(e) =>
                      setProduct((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Ej: Pan integral"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Cantidad que se obtiene</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={product.quantity || ""}
                    onChange={(e) =>
                      setProduct((prev) => ({
                        ...prev,
                        quantity: Number(e.target.value),
                      }))
                    }
                    placeholder="1"
                  />
                </div>
              </div>

              <Button
                onClick={addIngredient}
                className="w-full"
                disabled={rawMaterials.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Ingrediente
              </Button>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingrediente</TableHead>
                      <TableHead>Gramos</TableHead>
                      <TableHead>Costo</TableHead>
                      <TableHead className="w-16">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.ingredients.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground"
                        >
                          No hay ingredientes agregados
                        </TableCell>
                      </TableRow>
                    ) : (
                      product.ingredients.map((ingredient) => (
                        <TableRow key={ingredient.id}>
                          <TableCell>
                            <Select
                              value={ingredient.materialId}
                              onValueChange={(value) =>
                                updateIngredient(
                                  ingredient.id,
                                  "materialId",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar ingrediente" />
                              </SelectTrigger>
                              <SelectContent>
                                {rawMaterials.map((material) => (
                                  <SelectItem
                                    key={material.id}
                                    value={material.id}
                                  >
                                    {material.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={ingredient.grams || ""}
                              onChange={(e) =>
                                updateIngredient(
                                  ingredient.id,
                                  "grams",
                                  Number(e.target.value)
                                )
                              }
                              placeholder="0"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            $
                            {getIngredientCost(
                              ingredient.materialId,
                              ingredient.grams
                            ).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeIngredient(ingredient.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <Card className="bg-accent/10 border-accent">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Resultados del Cálculo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Costo total materia prima:
                    </span>
                    <span className="text-lg font-bold">
                      ${totalRawMaterialCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Costo con ganancia:</span>
                    <span className="text-lg font-bold text-primary">
                      ${totalWithProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="font-medium">Precio por unidad:</span>
                    <span className="text-xl font-bold text-accent">
                      ${pricePerUnit.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
