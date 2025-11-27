import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProductStore } from "@/store/productStore";
import { useProductData } from "@/hooks/useProductData";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import SearchSuggestions from "@/components/ui/search-suggestions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Filter, Search, Zap, ShoppingBag, Package, Grid3x3, List, TrendingUp, DollarSign, Star } from "lucide-react";
import { Button } from "@/components/ui/enhanced-button";
import shopHeroBg from "@/assets/shop-hero-bg.jpg";
import electricalPattern from "@/assets/electrical-pattern.jpg";
import emptyCart from "@/assets/empty-cart.jpg";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, fetchProducts, productsFetched } = useProductStore();
  const { loading } = useProductData();
  
  // Fetch products when the Shop page loads
  useEffect(() => {
    if (!productsFetched) {
      fetchProducts();
    }
  }, [productsFetched, fetchProducts]);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    brand: searchParams.get('brand') || '',
    availability: searchParams.get('availability') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [itemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Update filters when URL params change
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || 'all',
      brand: searchParams.get('brand') || '',
      availability: searchParams.get('availability') || 'all',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
    });
  }, [searchParams]);

  // Transform categories for filtering
  const categoryOptions = categories.map(cat => ({ id: cat.id, name: cat.name }));
  
  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !filters.search ||
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.brand.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCategory = filters.category === 'all' || product.category_id === filters.category;
    const matchesBrand = !filters.brand || product.brand.toLowerCase().includes(filters.brand.toLowerCase());
    const matchesAvailability = filters.availability === 'all' ||
      (filters.availability === 'In Stock' ? product.in_stock : !product.in_stock);

    const matchesPrice = (!filters.minPrice || product.price >= parseFloat(filters.minPrice)) &&
                        (!filters.maxPrice || product.price <= parseFloat(filters.maxPrice));

    return matchesSearch && matchesCategory && matchesBrand && matchesAvailability && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'newest':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case 'featured':
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

  // Paginate products
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  const searchQuery = filters.search.trim().toLowerCase();
  const suggestions = searchQuery
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery) || (p.brand || '').toLowerCase().includes(searchQuery)
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const hasQuery = filters.search.trim().length > 0;
    setShowSuggestions(hasQuery);
    if (!hasQuery) setHighlightedIndex(-1);
  }, [filters.search]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => 
    value && value !== 'all'
  ).length;
  const uniqueBrands = [...new Set(products.map(p => p.brand))];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_70%_50%,rgba(147,51,234,0.1),transparent_50%)]" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.4
        }} />

        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-center w-full">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 animate-pulse" />
                <Zap className="relative h-16 w-16 text-yellow-400" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in tracking-tight">
              Premium Electrical Store
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto font-light">
              Power Your World with Quality Products
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-200">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="text-lg font-medium">Top Quality</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
                <ShoppingBag className="h-5 w-5 text-yellow-400" />
                <span className="text-lg font-medium">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
                <DollarSign className="h-5 w-5 text-yellow-400" />
                <span className="text-lg font-medium">Best Prices</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <div className="relative flex items-center w-full">
                <Input
                  placeholder="Search for electrical products, brands, categories..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pr-12 h-12 text-base border focus:border-primary shadow-md rounded-md"
                  onFocus={() => setShowSuggestions(suggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                  onKeyDown={(e) => {
                    if (suggestions.length === 0) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                      e.preventDefault();
                      const sel = suggestions[highlightedIndex];
                      window.location.href = `/product/${sel.id}`;
                    } else if (e.key === 'Escape') {
                      setShowSuggestions(false);
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  variant="default" 
                  size="icon"
                  className="absolute right-1 h-10 w-10 bg-primary text-white rounded-md"
                >
                  <Search className="h-5 w-5" />
                </Button>
                <SearchSuggestions 
                  items={suggestions}
                  visible={showSuggestions}
                  highlightedIndex={highlightedIndex}
                  onHover={setHighlightedIndex}
                  onSelect={(item) => {
                    window.location.href = `/product/${item.id}`;
                  }}
                />
              </div>
            </form>
          </div>
        </div>


        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-80">
            <div className="sticky top-24">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full h-12"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Button>
              </div>

              {/* Filter Panel */}
              <div className={`bg-card rounded-xl border shadow-elegant p-6 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xl text-foreground flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-primary" />
                    Filters
                  </h2>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center">
                    <Package className="h-4 w-4 mr-2 text-primary" />
                    Category
                  </label>
                  <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">
                    Brand
                  </label>
                  <Input
                    placeholder="Search by brand..."
                    value={filters.brand}
                    onChange={(e) => updateFilter('brand', e.target.value)}
                    className="h-12"
                  />
                  {uniqueBrands.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {uniqueBrands.slice(0, 5).map((brand) => (
                        <Badge
                          key={brand}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => updateFilter('brand', brand)}
                        >
                          {brand}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Min Rs."
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      className="h-12"
                    />
                    <Input
                      type="number"
                      placeholder="Max Rs."
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">
                    Availability
                  </label>
                  <Select value={filters.availability} onValueChange={(value) => updateFilter('availability', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="All Products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Decorative Element */}
                <div 
                  className="h-32 rounded-lg bg-cover bg-center opacity-20"
                  style={{ backgroundImage: `url(${electricalPattern})` }}
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {sortedProducts.length} Products Found
                </h2>
                <p className="text-muted-foreground">
                  {activeFiltersCount > 0 ? 'Filtered results' : 'Showing all products'}
                </p>
              </div>

              {/* Sort and View Controls */}
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-10">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge
                variant={filters.availability === 'In Stock' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => updateFilter('availability', filters.availability === 'In Stock' ? 'all' : 'In Stock')}
              >
                In Stock Only
              </Badge>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.search && (
                  <Badge variant="secondary" className="px-3 py-1">
                    Search: {filters.search}
                    <X
                      className="h-3 w-3 ml-2 cursor-pointer"
                      onClick={() => updateFilter('search', '')}
                    />
                  </Badge>
                )}
                {filters.category && filters.category !== 'all' && (
                  <Badge variant="secondary" className="px-3 py-1">
                    Category: {filters.category}
                    <X
                      className="h-3 w-3 ml-2 cursor-pointer"
                      onClick={() => updateFilter('category', 'all')}
                    />
                  </Badge>
                )}
                {filters.brand && (
                  <Badge variant="secondary" className="px-3 py-1">
                    Brand: {filters.brand}
                    <X
                      className="h-3 w-3 ml-2 cursor-pointer"
                      onClick={() => updateFilter('brand', '')}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div
                className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4 md:gap-6`}
                aria-busy="true"
                aria-label="Loading products"
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-card rounded-lg animate-pulse" role="presentation"></div>
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div
                  className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4 md:gap-6 px-2 sm:px-0`}
                  role="region"
                  aria-label="Products grid"
                >
                  {paginatedProducts.map((product) => (
                    <div key={product.id} className="animate-fade-in hover-scale">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i}
                          variant={currentPage === i + 1 ? 'default' : 'outline'}
                          onClick={() => setCurrentPage(i + 1)}
                          className="w-10"
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div 
                className="text-center py-16"
                role="region"
                aria-label="No products found"
              >
                <img 
                  src={emptyCart} 
                  alt="No products found" 
                  className="w-32 h-32 mx-auto mb-6 opacity-50"
                />
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  No Products Found
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                </p>
                <Button 
                  variant="outline" 
                  onClick={clearFilters} 
                  className="px-8"
                  aria-label="Clear all filters"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
