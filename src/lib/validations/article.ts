import { z } from "zod";

export const articleSchema = z.object({
  categoryId: z.string().min(1, "Category is required."),

  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title is too long."),

  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters.")
    .max(220, "Slug is too long.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens.",
    ),

  summary: z
    .string()
    .trim()
    .max(500, "Summary is too long.")
    .optional(),

  content: z
    .string()
    .trim()
    .min(20, "Content must be at least 20 characters."),

  coverImage: z
    .string()
    .trim()
    .url("Cover image must be a valid URL.")
    .optional(),

  status: z
    .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .optional(),
});

export type ArticleInput = z.infer<typeof articleSchema>;

export const articleCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters.")
    .max(100, "Category name is too long."),

  description: z
    .string()
    .trim()
    .max(500, "Description is too long.")
    .optional(),
});

export type ArticleCategoryInput = z.infer<
  typeof articleCategorySchema
>;