export type Role = "ADMIN" | "SELLER" | "BUYER";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  nim: string;
  role: Role;
  approvalStatus: ApprovalStatus;
  phone?: string;
}

export interface ProductWithSeller {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    phone: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
}

export interface CategoryType {
  id: string;
  name: string;
  icon: string | null;
  _count?: {
    products: number;
  };
}
