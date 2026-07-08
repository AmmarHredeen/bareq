/** نتيجة مرقّمة من قاعدة البيانات. */
export interface PaginatedResult<T> {
  data: T[];
  count: number;
}

/** معطيات الاستعلام المشتركة (بحث، ترقيم، ترتيب). */
export interface QueryParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
