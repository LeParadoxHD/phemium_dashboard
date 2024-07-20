export type Environmented<T> = {
  [env: string]: T;
};

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  rows_per_page: number;
  sort_column: string;
  sort_type: string;
  total_rows: number;
}
