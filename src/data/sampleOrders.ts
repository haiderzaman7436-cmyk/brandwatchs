export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;

  items: OrderItem[];
  total: number;

  status: "Pending" | "Dispatched" | "Completed" | "Cancelled";
  paymentMethod?: "cod" | "bank";
  transactionScreenshot?: string;

  date: string;
  dispatchDate?: string;
  completedDate?: string;
}

export const sampleOrders: Order[] = [];