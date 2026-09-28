export type Category = {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  createdAtUtc: string;
};

export type CategoryRequest = {
  name: string;
  description: string | null;
};
