// src/app/core/models/user.model.ts
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin';
  token?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
