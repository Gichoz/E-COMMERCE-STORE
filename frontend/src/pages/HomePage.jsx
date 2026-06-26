import { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import CategoryItem from "../components/CategoryItem";
import FeaturedProducts from "../components/FeaturedProducts";

const categories = [
  { href: "/jeans", name: "Jeans", imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500" },
  { href: "/t-shirts", name: "T-Shirts", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500" },
  { href: "/shoes", name: "Shoes", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500" },
  { href: "/glasses", name: "Glasses", imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500" },
  { href: "/jackets", name: "Jackets", imageUrl: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500" },
  { href: "/suits", name: "Suits", imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500" },
  { href: "/bags", name: "Bags", imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500" },
];

const HomePage = () => {
  const { fetchFeaturedProducts, products, loading } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">
          Explore Our Categories
        </h1>
        <p className="text-center text-xl text-gray-300 mb-12">
          Discover the latest trends in eco-friendly fashion
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {categories.map((category) => (
            <CategoryItem key={category.name} category={category} />
          ))}
        </div>

        {!loading && products.length > 0 && (
          <FeaturedProducts featuredProducts={Array.isArray(products) ? products : []} />
        )}
      </div>
    </div>
  );
};

export default HomePage;