export interface User {
  id: string; // uuid v4
  login: string;
  password: string;
  version: number;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}
