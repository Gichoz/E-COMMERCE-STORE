import { useState } from "react";
import { BarChart, PlusCircle, ShoppingBag } from "lucide-react";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import AnalyticsTab from "../components/AnalyticsTab";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("create");

  const tabs = [
    { id: "create", label: "Create Product", icon: PlusCircle },
    { id: "products", label: "Products", icon: ShoppingBag },
    { id: "analytics", label: "Analytics", icon: BarChart },
  ];

  return (
    <div className='min-h-screen bg-gray-900 text-white relative overflow-hidden pt-20'>
      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <h1 className='text-4xl font-bold text-emerald-400 mb-8 text-center'>Admin Dashboard</h1>

        <div className='flex justify-center mb-8 gap-4'>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center px-4 py-2 rounded-md transition-colors ${activeTab === tab.id ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                <Icon className='mr-2 h-5 w-5' /> {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "create" && <CreateProductForm />}
        {activeTab === "products" && <ProductsList />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
};

export default AdminDashboard;