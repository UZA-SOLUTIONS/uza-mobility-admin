'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';
import { usePermissions } from '@/hooks/permissions';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  NumberInput,
  numberRegisterOptions,
} from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tag, ShoppingCart, List, Plus, Edit, Trash2 } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdminCategoriesFilters } from '@/lib/api/categories';
import {
  useAddSubcategory,
  useAdminCategories,
  useCreateCategory,
  useDeactivateCategory,
  useDeleteSubcategory,
  usePermanentlyDeleteCategory,
  useReactivateCategory,
  useUpdateCategory,
  useUpdateSubcategory,
} from '@/queries/admin';
import {
  createCategorySchema,
  updateCategorySchema,
  updateSubcategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type UpdateSubcategoryInput,
} from '@/schemas/admin';
import type { Category, Subcategory } from '@/types/admin/marketplace';

const categoryTypes = [
  { value: 'PASSENGER_EV', label: 'Passenger EV' },
  { value: 'TWO_THREE_WHEEL', label: '2–3 wheel' },
  { value: 'COMMERCIAL_EV', label: 'Commercial EV' },
  { value: 'EV_PARTS_ACCESSORIES', label: 'Parts & accessories' },
  { value: 'EV_INFRASTRUCTURE_ENERGY', label: 'Infrastructure & energy' },
] as const;

type ViewFilter = 'active' | 'inactive' | 'all';

const viewToApiFilter: Record<ViewFilter, AdminCategoriesFilters> = {
  active: { isActive: true },
  inactive: { isActive: false },
  all: {},
};

type CategoryCardProps = {
  category: Category;
};

function CategoryCard({ category }: CategoryCardProps) {
  const { isSuperAdmin, hasAdminAccess } = usePermissions();
  const deactivate = useDeactivateCategory();
  const reactivate = useReactivateCategory();
  const deletePermanent = usePermanentlyDeleteCategory();
  const deleteSub = useDeleteSubcategory();
  const addSub = useAddSubcategory();
  const updateCategory = useUpdateCategory();
  const updateSub = useUpdateSubcategory();

  const [subOpen, setSubOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSub, setEditSub] = useState<Subcategory | null>(null);
  const [subName, setSubName] = useState('');
  const [confirm, setConfirm] = useState<
    | 'deactivate-category'
    | 'reactivate-category'
    | 'delete-category'
    | { type: 'delete-sub'; sub: Subcategory }
    | null
  >(null);

  const listingCount = category._count?.listings ?? 0;
  const busy =
    deactivate.isPending ||
    reactivate.isPending ||
    deletePermanent.isPending ||
    deleteSub.isPending ||
    updateCategory.isPending ||
    updateSub.isPending;

  const closeConfirm = () => setConfirm(null);

  const handleConfirm = () => {
    if (confirm === 'deactivate-category') {
      deactivate.mutate(category.id, { onSuccess: closeConfirm });
      return;
    }
    if (confirm === 'reactivate-category') {
      reactivate.mutate(category.id, { onSuccess: closeConfirm });
      return;
    }
    if (confirm === 'delete-category') {
      deletePermanent.mutate(category.id, { onSuccess: closeConfirm });
      return;
    }
    if (
      confirm &&
      typeof confirm === 'object' &&
      confirm.type === 'delete-sub'
    ) {
      deleteSub.mutate(
        { categoryId: category.id, subId: confirm.sub.id },
        { onSuccess: closeConfirm },
      );
    }
  };

  const confirmCopy = (() => {
    if (confirm === 'deactivate-category') {
      return {
        title: 'Deactivate category?',
        description: `"${category.name}" will be hidden from the public marketplace. You can reactivate it later.`,
        confirmLabel: 'Deactivate',
        variant: 'destructive' as const,
      };
    }
    if (confirm === 'reactivate-category') {
      return {
        title: 'Reactivate category?',
        description: `"${category.name}" will be visible on the marketplace again.`,
        confirmLabel: 'Reactivate',
        variant: 'default' as const,
      };
    }
    if (confirm === 'delete-category') {
      return {
        title: 'Delete category permanently?',
        description: `"${category.name}" and its subcategories will be removed. This cannot be undone.`,
        confirmLabel: 'Delete permanently',
        variant: 'destructive' as const,
      };
    }
    if (
      confirm &&
      typeof confirm === 'object' &&
      confirm.type === 'delete-sub'
    ) {
      return {
        title: 'Delete subcategory?',
        description: `"${confirm.sub.name}" will be removed. This cannot be undone.`,
        confirmLabel: 'Delete',
        variant: 'destructive' as const,
      };
    }
    return null;
  })();

  return (
    <>
      <Card className={!category.isActive ? 'opacity-80' : undefined}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">{category.name}</CardTitle>
                {!category.isActive ? (
                  <Badge variant="secondary">Inactive</Badge>
                ) : null}
              </div>
              <CardDescription className="flex items-center gap-2">
                <span className="truncate text-muted-foreground">
                  {category.slug} · {category.type.replaceAll('_', ' ')}
                </span>
                {listingCount > 0 ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ShoppingCart className="size-4" />
                    {listingCount}
                  </span>
                ) : null}
              </CardDescription>
            </div>
            {hasAdminAccess ? (
              <div className="flex flex-wrap justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => setEditOpen(true)}
                >
                  Edit
                </Button>
                {category.isActive ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setConfirm('deactivate-category')}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => setConfirm('reactivate-category')}
                  >
                    Reactivate
                  </Button>
                )}
                {isSuperAdmin && listingCount === 0 ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={busy}
                    onClick={() => setConfirm('delete-category')}
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {category.subcategories?.length ? (
            <Accordion type="single" collapsible>
              <AccordionItem value={String(category.id)}>
                <AccordionTrigger>
                  <div className="flex w-full cursor-pointer items-center justify-between">
                    <div className="flex items-center gap-2">
                      <List className="size-4 text-muted-foreground" />
                      <span className="text-sm">Subcategories</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {category.subcategories.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm">
                    {category.subcategories.map((sub) => (
                      <li
                        key={sub.id}
                        className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium">
                              {sub.name}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              ({sub.slug})
                            </span>
                          </div>
                        </div>
                        {hasAdminAccess ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              disabled={busy}
                              onClick={() => setEditSub(sub)}
                            >
                              <Edit className="size-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-destructive"
                              disabled={busy}
                              onClick={() =>
                                setConfirm({ type: 'delete-sub', sub })
                              }
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </Button>
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <p className="text-sm text-muted-foreground">
              No subcategories yet.
            </p>
          )}
          {category.isActive ? (
            <Button size="sm" variant="ghost" onClick={() => setSubOpen(true)}>
              <Plus className="size-4" />
              Add subcategory
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <EditCategoryDialog
        category={category}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(body) =>
          updateCategory.mutate(
            { id: category.id, body },
            { onSuccess: () => setEditOpen(false) },
          )
        }
        loading={updateCategory.isPending}
      />

      <EditSubcategoryDialog
        subcategory={editSub}
        open={editSub !== null}
        onOpenChange={(open) => !open && setEditSub(null)}
        onSave={(body) => {
          if (!editSub) return;
          updateSub.mutate(
            { categoryId: category.id, subId: editSub.id, body },
            { onSuccess: () => setEditSub(null) },
          );
        }}
        loading={updateSub.isPending}
      />

      <Dialog open={subOpen} onOpenChange={setSubOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add subcategory</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={addSub.isPending || !subName.trim()}
              onClick={() =>
                addSub.mutate(
                  {
                    categoryId: category.id,
                    body: { name: subName.trim() },
                  },
                  {
                    onSuccess: () => {
                      setSubOpen(false);
                      setSubName('');
                    },
                  },
                )
              }
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {confirmCopy ? (
        <ConfirmDialog
          open={confirm !== null}
          onOpenChange={(open) => !open && closeConfirm()}
          title={confirmCopy.title}
          description={confirmCopy.description}
          confirmLabel={confirmCopy.confirmLabel}
          variant={confirmCopy.variant}
          loading={busy}
          onConfirm={handleConfirm}
        />
      ) : null}
    </>
  );
}

function EditCategoryDialog({
  category,
  open,
  onOpenChange,
  onSave,
  loading,
}: {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (body: UpdateCategoryInput) => void;
  loading: boolean;
}) {
  const form = useForm<UpdateCategoryInput>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: category.name,
      type: category.type,
      description: category.description ?? '',
      displayOrder: category.displayOrder,
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit category</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input {...form.register('name')} />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={form.watch('type') ?? category.type}
              onValueChange={(value) =>
                form.setValue('type', value as CreateCategoryInput['type'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input {...form.register('description')} />
          </div>
          <div className="space-y-1.5">
            <Label>Display order</Label>
            <NumberInput
              min={0}
              {...form.register('displayOrder', numberRegisterOptions())}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditSubcategoryDialog({
  subcategory,
  open,
  onOpenChange,
  onSave,
  loading,
}: {
  subcategory: Subcategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (body: UpdateSubcategoryInput) => void;
  loading: boolean;
}) {
  const form = useForm<UpdateSubcategoryInput>({
    resolver: zodResolver(updateSubcategorySchema),
    values: subcategory
      ? {
          name: subcategory.name,
          description: subcategory.description ?? '',
          displayOrder: subcategory.displayOrder,
        }
      : undefined,
  });

  if (!subcategory) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit subcategory</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input {...form.register('name')} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input {...form.register('description')} />
          </div>
          <div className="space-y-1.5">
            <Label>Display order</Label>
            <NumberInput
              min={0}
              {...form.register('displayOrder', numberRegisterOptions())}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminCategoriesPanel() {
  const [view, setView] = useState<ViewFilter>('all');
  const filters = viewToApiFilter[view];
  const { data, isLoading, isError, error } = useAdminCategories(filters);
  const createCategory = useCreateCategory();
  const [createOpen, setCreateOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      type: 'PASSENGER_EV' as const,
      displayOrder: 0,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createCategory.mutate(values, {
      onSuccess: () => {
        setCreateOpen(false);
        form.reset();
        setView('active');
      },
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Categories"
          description="Manage marketplace categories and subcategories. Deactivated items are hidden from the public catalog."
        />
        <Button onClick={() => setCreateOpen(true)}>New category</Button>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as ViewFilter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : 'Failed to load categories.'}
        </p>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : data?.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No categories in this view.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {data?.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create category</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input id="cat-name" {...form.register('name')} />
              {form.formState.errors.name ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(value) =>
                  form.setValue('type', value as CreateCategoryInput['type'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createCategory.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
