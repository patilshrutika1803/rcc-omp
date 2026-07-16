export function validateTitle(title: string): string | null {
  if (!title.trim()) return "Title is required.";
  if (title.trim().length < 2) return "Title is too short.";
  return null;
}

export function validateContent(content: string): string | null {
  if (!content.trim()) return "Content is required.";
  return null;
}

export function validateTags(tags: string[]): string | null {
  if (!Array.isArray(tags)) return "Invalid tags.";
  if (tags.some((t) => !t.trim())) return "Tags cannot be empty.";
  return null;
}

export function validateFolder(folder: string): string | null {
  if (!folder.trim()) return "Folder is required.";
  return null;
}

