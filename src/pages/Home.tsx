import React, { useEffect, lazy, Suspense } from 'react';
import { useProductStore } from '@/store/productStore';
import { useProductData } from '@/hooks/useProductData';
import HeroSectionNew from '@/components/HeroSectionNew';
import { useIdle } from '@/hooks/useIdle';
import { WhyChooseUsSection } from '@/components/WhyChooseUsSection';
const StatsSection = lazy(() => import('@/components/StatsSection'));
const TestimonialsSection = lazy(() => import('@/components/TestimonialsSection'));
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/enhanced-button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { featuredProducts } = useProductStore();
  const { loading } = useProductData();
  const isIdle = useIdle(0);

  return (
    <main className="min-h-screen">
      <HeroSectionNew />

      {/* Featured Products Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Latest Products
              </h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our handpicked selection of premium electrical products
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-card rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredProducts.map((product) => (
                <div key={product.id} className="animate-fade-in hover-scale">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Featured Products Yet
              </h3>
              <p className="text-muted-foreground">
                Check back soon for our featured electrical products!
              </p>
            </div>
          )}

          <div className="text-center">
            <Link to="/shop">
              <InteractiveHoverButton
                text="View All"
                className="w-44 h-12 text-base shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <WhyChooseUsSection />

      {isIdle && (
        <Suspense fallback={null}>
          <TestimonialsSection />
        </Suspense>
      )}
    </main>
  );
};

export default Home;
