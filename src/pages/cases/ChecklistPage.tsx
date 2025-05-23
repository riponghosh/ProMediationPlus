import React, { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, CheckSquare, Plus, Trash2, Edit3, X } from "lucide-react";
import {
  getItem,
  addChecklistItem,
  getChecklistItemsForCase,
  updateChecklistItem,
  deleteChecklistItem
} from "@/services/localDbService";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Case as CaseModel, ChecklistItem } from "@/types/models";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ChecklistPage = () => {
  const { id: caseId } = useParams<{ id: string }>();
  const [currentCase, setCurrentCase] = useState<CaseModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

  const isMobile = useIsMobile();

  const loadChecklistData = useCallback(async () => {
    if (!caseId) {
      setError("No case ID provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const caseData = await getItem('cases', caseId);
      if (caseData) {
        setCurrentCase(caseData as CaseModel);
        const checklistData = await getChecklistItemsForCase(caseId);
        setItems(checklistData);
        setError(null);
      } else {
        setError("Case not found.");
        setCurrentCase(null);
        setItems([]);
      }
    } catch (e) {
      console.error("Error loading checklist data:", e);
      setError("Failed to load checklist data.");
      setCurrentCase(null);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadChecklistData();
  }, [loadChecklistData]);

  const handleToggleComplete = async (item: ChecklistItem) => {
    const updatedItem = { ...item, completed: !item.completed, updatedAt: new Date().toISOString() };
    try {
      await updateChecklistItem(updatedItem);
      setItems(prevItems => prevItems.map(i => i.id === item.id ? updatedItem : i));
      toast.success(`Item "${item.text.substring(0,20)}..." status updated.`);
    } catch (e) {
      console.error("Error updating checklist item:", e);
      toast.error("Failed to update item.");
    }
  };

  const handleAddItem = async () => {
    if (!caseId || !newItemText.trim()) {
      toast.error("Item text cannot be empty.");
      return;
    }
    const newItem: ChecklistItem = {
      id: `cl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      caseId,
      text: newItemText.trim(),
      completed: false,
      category: newItemCategory.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await addChecklistItem(newItem);
      setItems(prevItems => [...prevItems, newItem].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      setNewItemText("");
      setNewItemCategory("");
      setIsAddItemDialogOpen(false);
      toast.success("Checklist item added.");
    } catch (e) {
      console.error("Error adding checklist item:", e);
      toast.error("Failed to add item.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteChecklistItem(itemId);
      setItems(prevItems => prevItems.filter(i => i.id !== itemId));
      toast.success("Item deleted.");
    } catch (e) {
      console.error("Error deleting item:", e);
      toast.error("Failed to delete item.");
    }
  };

  const handleEditItem = (item: ChecklistItem) => {
    setEditingItem(item);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editingItem.text.trim()) {
      toast.error("Item text cannot be empty.");
      return;
    }
    try {
      const itemToUpdate = { ...editingItem, updatedAt: new Date().toISOString() };
      await updateChecklistItem(itemToUpdate);
      setItems(prevItems => prevItems.map(i => i.id === editingItem.id ? itemToUpdate : i));
      setEditingItem(null);
      toast.success("Item updated.");
    } catch (e) {
      console.error("Error saving item:", e);
      toast.error("Failed to save item.");
    }
  };

  if (isLoading) {
    return <Layout><div className="p-4 md:p-6">Loading checklist...</div></Layout>;
  }

  if (error || !currentCase) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
          <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold mb-2`}>{error || "Case Not Found"}</h1>
          <p className="text-muted-foreground mb-4">The case you're looking for doesn't exist or couldn't be loaded.</p>
          <Button size={isMobile ? "sm" : "default"} asChild>
            <Link to="/case-files">Back to Case Files</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";
  const completedItemsCount = items.filter(i => i.completed).length;

  return (
    <Layout>
      <div className={`flex flex-col ${isMobile ? "space-y-4" : "space-y-6"} p-4 md:p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link to={`/case-files/${caseId}`}> {/* Link back to specific case details */}
                <ChevronLeft className={iconSizeClass} />
              </Link>
            </Button>
            <div>
              <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Checklist</h1>
              <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                {currentCase.title} • {currentCase.caseFileNumber || currentCase.id}
              </div>
            </div>
          </div>
          <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
            <DialogTrigger asChild>
              <Button size={isMobile ? "sm" : "default"} onClick={() => setIsAddItemDialogOpen(true)}>
                <Plus className={`${iconSizeClass} mr-1.5`} />
                {isMobile ? "Add" : "Add Item"}
              </Button>
            </DialogTrigger>
            <DialogContent className={isMobile ? "max-w-[95vw] p-4" : "sm:max-w-[425px]"}>
              <DialogHeader>
                <DialogTitle>Add New Checklist Item</DialogTitle>
                <DialogDescription>
Enter the details for the new checklist item.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="newItemText">Item Text</Label>
                  <Input 
                    id="newItemText" 
                    value={newItemText} 
                    onChange={(e) => setNewItemText(e.target.value)} 
                    placeholder="E.g., Send welcome email to client"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="newItemCategory">Category (Optional)</Label>
                  <Input 
                    id="newItemCategory" 
                    value={newItemCategory} 
                    onChange={(e) => setNewItemCategory(e.target.value)} 
                    placeholder="E.g., Intake, Documents"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Separator className={isMobile ? "my-1.5" : ""} />

        <Card>
          <CardHeader className={isMobile ? "p-4" : ""}>
            <CardTitle className={`flex items-center ${isMobile ? "text-base" : ""}`}>
              <CheckSquare className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} mr-2 text-primary`} />
              Case Checklist
            </CardTitle>
            <CardDescription>Track the progress of key tasks for this case. {completedItemsCount} of {items.length} items completed.</CardDescription>
          </CardHeader>
          <CardContent className={`${isMobile ? "p-4 pt-0" : "p-6 pt-0"} ${items.length === 0 ? 'flex items-center justify-center' : ''}`}>
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className={`flex items-center justify-between ${isMobile ? "p-2 text-sm" : "p-3"} border rounded-md hover:bg-muted/50 group`}>
                    <div className="flex items-center space-x-2 md:space-x-3 flex-grow">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={() => handleToggleComplete(item)}
                        className={`${isMobile ? "h-3.5 w-3.5" : "h-4 w-4"}`}
                      />
                      <label
                        htmlFor={`item-${item.id}`}
                        className={`flex-1 ${isMobile ? "text-xs" : "text-sm"} ${item.completed ? 'line-through text-muted-foreground' : ''} cursor-pointer`}
                        onClick={() => handleToggleComplete(item)} // Allow clicking label to toggle
                      >
                        {item.text}
                      </label>
                    </div>
                    <div className="flex items-center space-x-1 md:space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.category && (
                        <Badge variant="outline" className={`${isMobile ? "text-[10px] px-1.5 py-0.5 h-5" : "text-xs"} hidden sm:inline-flex`}>
                          {item.category}
                        </Badge>
                      )}
                      <Button variant="ghost" size="icon" className={`${isMobile ? "h-6 w-6" : "h-7 w-7"}`} onClick={() => handleEditItem(item)}>
                        <Edit3 className={isMobile ? "h-3 w-3" : "h-3.5 w-3.5"} />
                      </Button>
                      <Button variant="ghost" size="icon" className={`${isMobile ? "h-6 w-6 text-destructive" : "h-7 w-7 text-destructive"} hover:text-destructive`} onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className={isMobile ? "h-3 w-3" : "h-3.5 w-3.5"} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center ${isMobile ? "py-4" : "py-8"}`}>
                <p className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"} mb-3`}>
                  No checklist items yet for this case.
                </p>
                <Button 
                  variant="outline" 
                  size={isMobile ? "sm" : "default"}
                  onClick={() => setIsAddItemDialogOpen(true)}
                >
                  <Plus className={`${iconSizeClass} mr-1.5`} />
                  Add First Item
                </Button>
              </div>
            )}
          </CardContent>
          {items.length > 0 && (
            <CardFooter className={`${isMobile ? "p-4 pt-2" : "p-6 pt-2"} flex justify-end`}>
              <p className={`${isMobile ? "text-[10px]" : "text-xs"} text-muted-foreground`}>
                {completedItemsCount} of {items.length} items completed.
              </p>
            </CardFooter>
          )}
        </Card>

        {/* Edit Item Dialog */}
        {editingItem && (
          <Dialog open={!!editingItem} onOpenChange={(isOpen) => !isOpen && setEditingItem(null)}>
            <DialogContent className={isMobile ? "max-w-[95vw] p-4" : "sm:max-w-[425px]"}>
              <DialogHeader>
                <DialogTitle>Edit Checklist Item</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="editText">Item Text</Label>
                  <Input 
                    id="editText" 
                    value={editingItem.text} 
                    onChange={(e) => setEditingItem(prev => prev ? {...prev, text: e.target.value} : null)} 
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="editCategory">Category (Optional)</Label>
                  <Input 
                    id="editCategory" 
                    value={editingItem.category || ""} 
                    onChange={(e) => setEditingItem(prev => prev ? {...prev, category: e.target.value} : null)} 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

export default ChecklistPage;
