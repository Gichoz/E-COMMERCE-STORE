import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import ProductCard from "../components/ProductCard";

const CategoryPage = () => {
  const { category } = useParams();
  const { fetchProductsByCategory, products, loading } = useProductStore();

  useEffect(() => {
    fetchProductsByCategory(category);
  }, [category, fetchProductsByCategory]);

  return (
    <div className="min-h-screen pt-20 px-4 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-emerald-400 mb-8 capitalize">
        {category.replace("-", " ")}
      </h1>

      {loading ? (
        <div className="text-center text-xl text-gray-400">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center text-xl text-gray-400">
          No products found in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;