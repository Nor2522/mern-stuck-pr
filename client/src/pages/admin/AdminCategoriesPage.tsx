import { useState } from "react"
import { Ellipsis, Pencil, Plus, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useRenameCategory,
} from "@/features/admin/api"
import { CategoryForm } from "@/features/admin/components/CategoryForm"
import { FilterSelect } from "@/features/admin/components/FilterSelect"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import type { AdminCategory } from "@/types/category"

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

const AdminCategoriesPage = () => {
  useDocumentTitle("Categories")
  const categories = useAdminCategories()
  const createCategory = useCreateCategory()
  const renameCategory = useRenameCategory()
  const deleteCategory = useDeleteCategory()

  const [createOpen, setCreateOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<AdminCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null)
  const [reassignTo, setReassignTo] = useState("")

  const items = categories.data ?? []

  const reassignOptions = items
    .filter((category) => category._id !== deleteTarget?._id)
    .map((category) => ({ value: category._id, label: category.name }))

  const closeDelete = () => {
    setDeleteTarget(null)
    setReassignTo("")
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteCategory.mutate(
      {
        id: deleteTarget._id,
        ...(deleteTarget.postsCount > 0 ? { reassignTo } : {}),
      },
      { onSettled: () => closeDelete() },
    )
  }

  const needsReassign = (deleteTarget?.postsCount ?? 0) > 0

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Categories</h1>
          <p className="mt-1 text-muted-foreground">
            Create and rename categories, and see how many posts use each one.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          New category
        </Button>
      </header>

      <div className="mt-6 rounded-xl border">
        <Table className="min-w-140">
          <TableHeader>
            <TableRow className="bg-muted/50 text-muted-foreground">
              <TableHead className="px-4 font-medium text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="px-4 font-medium text-muted-foreground">
                Slug
              </TableHead>
              <TableHead className="px-4 font-medium text-muted-foreground">
                Posts
              </TableHead>
              <TableHead className="px-4 font-medium text-muted-foreground">
                Created
              </TableHead>
              <TableHead className="px-4 text-right font-medium text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5} className="px-4 py-3">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : categories.isError ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-16 text-center">
                  <p className="font-medium">Could not load categories.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => categories.refetch()}
                  >
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-4 py-16 text-center text-muted-foreground"
                >
                  No categories yet. Create the first one.
                </TableCell>
              </TableRow>
            ) : (
              items.map((category) => (
                <TableRow key={category._id} className="hover:bg-muted/40">
                  <TableCell className="px-4 py-3 font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {category.slug}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {category.postsCount}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {formatDate(category.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for ${category.name}`}
                          >
                            <Ellipsis />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="min-w-40">
                        <DropdownMenuItem
                          onClick={() => setRenameTarget(category)}
                        >
                          <Pencil />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(category)}
                        >
                          <Trash2 />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
            <DialogDescription>
              The slug is generated from the name automatically.
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            submitLabel="Create category"
            submitting={createCategory.isPending}
            onSubmit={(values) =>
              createCategory.mutate(values.name, {
                onSuccess: () => setCreateOpen(false),
              })
            }
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(renameTarget)}
        onOpenChange={(open) => !open && setRenameTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename category</DialogTitle>
            <DialogDescription>
              Updating the name also updates its slug.
            </DialogDescription>
          </DialogHeader>
          {renameTarget && (
            <CategoryForm
              defaultName={renameTarget.name}
              submitLabel="Save changes"
              submitting={renameCategory.isPending}
              onSubmit={(values) =>
                renameCategory.mutate(
                  { id: renameTarget._id, name: values.name },
                  { onSuccess: () => setRenameTarget(null) },
                )
              }
              onCancel={() => setRenameTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && closeDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              {needsReassign
                ? `“${deleteTarget?.name}” is used by ${deleteTarget?.postsCount} ${
                    deleteTarget?.postsCount === 1 ? "post" : "posts"
                  }. Reassign those posts to another category, then it will be deleted.`
                : `“${deleteTarget?.name}” will be permanently removed. This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {needsReassign && (
            <div className="space-y-2">
              <FilterSelect
                ariaLabel="Reassign posts to"
                value={reassignTo}
                onChange={setReassignTo}
                options={[
                  { value: "", label: "Select a category" },
                  ...reassignOptions,
                ]}
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategory.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={
                deleteCategory.isPending || (needsReassign && !reassignTo)
              }
              onClick={(event) => {
                event.preventDefault()
                handleDelete()
              }}
            >
              {deleteCategory.isPending
                ? "Deleting…"
                : needsReassign
                  ? "Reassign & delete"
                  : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AdminCategoriesPage
