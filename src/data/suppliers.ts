// Sample supplier data — replace with your real suppliers
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  productsSupplied: string[];
}

export const suppliers: Supplier[] = [
  { id: "s1", name: "Sample Supplier A", contact: "John Doe", email: "contact@suppliera.com", phone: "+1-000-000-0001", productsSupplied: ["Smartphones", "Tablets"] },
  { id: "s2", name: "Sample Supplier B", contact: "Jane Smith", email: "contact@supplierb.com", phone: "+1-000-000-0002", productsSupplied: ["Laptops", "Accessories"] },
  { id: "s3", name: "Sample Supplier C", contact: "Bob Lee", email: "contact@supplierc.com", phone: "+1-000-000-0003", productsSupplied: ["Headphones"] },
  { id: "s4", name: "Sample Supplier D", contact: "Alice Wong", email: "contact@supplierd.com", phone: "+1-000-000-0004", productsSupplied: ["Smartphones", "Laptops", "Tablets"] },
  { id: "s5", name: "Sample Supplier E", contact: "Chris Park", email: "contact@suppliere.com", phone: "+1-000-000-0005", productsSupplied: ["Accessories", "Headphones"] },
];
