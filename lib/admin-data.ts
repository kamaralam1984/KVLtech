export const STATS = {
  revenue: { value: 3468850, change: 15.5, label: "Total Revenue" },
  orders: { value: 248, change: 12.3, label: "Total Orders" },
  leads: { value: 1842, change: 8.7, label: "New Leads" },
  conversion: { value: 13.5, change: 2.1, label: "Conversion Rate" },
  clients: { value: 5000, change: 22, label: "Happy Clients" },
  rating: { value: 4.9, change: 0.1, label: "Avg Rating" },
};

export const CHART_DATA = [
  { month: "Jan", revenue: 180000 },
  { month: "Feb", revenue: 220000 },
  { month: "Mar", revenue: 195000 },
  { month: "Apr", revenue: 280000 },
  { month: "May", revenue: 310000 },
  { month: "Jun", revenue: 265000 },
  { month: "Jul", revenue: 390000 },
  { month: "Aug", revenue: 420000 },
  { month: "Sep", revenue: 380000 },
  { month: "Oct", revenue: 460000 },
  { month: "Nov", revenue: 520000 },
  { month: "Dec", revenue: 648850 },
];

export type OrderStatus = "Pending" | "In Progress" | "Delivered" | "Cancelled";

export interface Order {
  id: string;
  client: string;
  product: string;
  plan: "Basic" | "Premium" | "Custom";
  amount: number;
  status: OrderStatus;
  date: string;
  phone: string;
  city: string;
}

export const ORDERS: Order[] = [
  { id: "KVL-1024", client: "Rajesh Kumar", product: "Restaurant Website", plan: "Premium", amount: 24999, status: "Delivered", date: "2024-12-28", phone: "+91 98765 11111", city: "Mumbai" },
  { id: "KVL-1023", client: "Priya Sharma", product: "School Management System", plan: "Custom", amount: 89999, status: "In Progress", date: "2024-12-27", phone: "+91 98765 22222", city: "Delhi" },
  { id: "KVL-1022", client: "Amit Patel", product: "E-commerce Platform", plan: "Premium", amount: 39999, status: "Delivered", date: "2024-12-26", phone: "+91 98765 33333", city: "Ahmedabad" },
  { id: "KVL-1021", client: "Sunita Rao", product: "Hotel Booking Website", plan: "Basic", amount: 24999, status: "Pending", date: "2024-12-25", phone: "+91 98765 44444", city: "Bangalore" },
  { id: "KVL-1020", client: "Vikram Singh", product: "Hospital Management System", plan: "Premium", amount: 99999, status: "In Progress", date: "2024-12-24", phone: "+91 98765 55555", city: "Noida" },
  { id: "KVL-1019", client: "Meera Joshi", product: "Real Estate Website", plan: "Premium", amount: 44999, status: "Delivered", date: "2024-12-23", phone: "+91 98765 66666", city: "Pune" },
  { id: "KVL-1018", client: "Arjun Mehta", product: "Restaurant Website", plan: "Basic", amount: 12999, status: "Delivered", date: "2024-12-22", phone: "+91 98765 77777", city: "Jaipur" },
  { id: "KVL-1017", client: "Kavita Nair", product: "School Management System", plan: "Premium", amount: 59999, status: "In Progress", date: "2024-12-21", phone: "+91 98765 88888", city: "Chennai" },
];

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  interest: string;
  source: string;
  status: "New" | "Contacted" | "Qualified" | "Converted" | "Lost";
  date: string;
  city: string;
  budget?: string;
}

export const LEADS: Lead[] = [
  { id: "L-201", name: "Rohit Verma", phone: "+91 97654 11111", email: "rohit@gmail.com", interest: "Restaurant Website", source: "WhatsApp", status: "New", date: "2024-12-28", city: "Lucknow", budget: "₹15,000-25,000" },
  { id: "L-202", name: "Anita Gupta", phone: "+91 97654 22222", email: "anita@school.in", interest: "School Management", source: "ChatBot", status: "Contacted", date: "2024-12-28", city: "Agra", budget: "₹30,000-60,000" },
  { id: "L-203", name: "Suresh Malhotra", phone: "+91 97654 33333", email: "suresh@hotel.com", interest: "Hotel Booking Website", source: "Google Ads", status: "Qualified", date: "2024-12-27", city: "Shimla", budget: "₹25,000-50,000" },
  { id: "L-204", name: "Deepika Iyer", phone: "+91 97654 44444", email: "deepika@clinic.in", interest: "Hospital Management", source: "Referral", status: "Converted", date: "2024-12-27", city: "Hyderabad", budget: "₹50,000+" },
  { id: "L-205", name: "Manoj Tiwari", phone: "+91 97654 55555", email: "manoj@fashion.com", interest: "E-commerce Platform", source: "Instagram", status: "New", date: "2024-12-26", city: "Surat", budget: "₹20,000-40,000" },
  { id: "L-206", name: "Pooja Kapoor", phone: "+91 97654 66666", email: "pooja@realty.in", interest: "Real Estate Website", source: "ChatBot", status: "Contacted", date: "2024-12-26", city: "Gurgaon", budget: "₹22,000-45,000" },
];

export const ACTIVITIES = [
  { type: "order", text: "New order: Rajesh Kumar — Restaurant Website (Premium)", time: "2 min ago", color: "#16A34A" },
  { type: "lead", text: "New lead: Rohit Verma interested in Restaurant Website", time: "8 min ago", color: "#C9A227" },
  { type: "chat", text: "Kavya chatbot: 3 new conversations this hour", time: "15 min ago", color: "#0891B2" },
  { type: "payment", text: "Payment received: ₹89,999 from Priya Sharma", time: "1 hr ago", color: "#7C3AED" },
  { type: "delivery", text: "Project delivered: Amit Patel — E-commerce Platform", time: "2 hr ago", color: "#16A34A" },
  { type: "review", text: "New 5★ review from Meera Joshi", time: "3 hr ago", color: "#C9A227" },
];

export const TOP_PRODUCTS = [
  { name: "Restaurant Website", orders: 48, revenue: 979952, growth: 22 },
  { name: "School Management System", orders: 31, revenue: 1399969, growth: 18 },
  { name: "E-commerce Platform", orders: 39, revenue: 1119961, growth: 35 },
  { name: "Hospital Management System", orders: 18, revenue: 1349982, growth: 12 },
  { name: "Hotel Booking Website", orders: 27, revenue: 899973, growth: 28 },
];
