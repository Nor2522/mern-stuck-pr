import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { ApiSuccess } from "@/types/api"
import type { Category } from "@/types/category"

export const categoriesKeys = {
  all: ["categories"] as const,
}

export const useCategories = () =>
  useQuery({
    queryKey: categoriesKeys.all,
    queryFn: async (): Promise<Category[]> => {
      const { data } = await api.get<ApiSuccess<{ categories: Category[] }>>(
        "/categories",
      )
      return data.data.categories
    },
  })