"use client";

import * as React from "react";
import { Search, MapPin, X, ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CampaignCard } from "@/components/campaign/campaign-card";
import type { Campaign, Category } from "@/lib/dummy-data";

interface CampaignListContentProps {
  initialCampaigns: Campaign[];
  categories: Category[];
}

export function CampaignListContent({ initialCampaigns, categories }: CampaignListContentProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("latest");
  const [selectedLocation, setSelectedLocation] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  // Extract unique locations from campaigns
  const uniqueLocations = React.useMemo(() => {
    const locs = initialCampaigns.map(
      (c) => c.beneficiaryLocation.split(",")[1]?.trim() || c.beneficiaryLocation
    );
    return Array.from(new Set(locs));
  }, [initialCampaigns]);

  // Filter & sort logic
  const filteredCampaigns = React.useMemo(() => {
    return initialCampaigns
      .filter((c) => {
        const matchSearch =
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.beneficiaryLocation.toLowerCase().includes(searchQuery.toLowerCase());

        const matchCategory =
          selectedCategory === "all" ||
          c.categoryId === selectedCategory ||
          c.categoryName.toLowerCase().includes(selectedCategory.toLowerCase());

        const matchLocation =
          selectedLocation === "all" ||
          c.beneficiaryLocation.toLowerCase().includes(selectedLocation.toLowerCase());

        return matchSearch && matchCategory && matchLocation;
      })
      .sort((a, b) => {
        if (sortBy === "urgent") {
          return (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0);
        }
        if (sortBy === "most_donated") {
          return b.collectedAmount - a.collectedAmount;
        }
        if (sortBy === "almost_reached") {
          const percentA = a.collectedAmount / a.targetAmount;
          const percentB = b.collectedAmount / b.targetAmount;
          return percentB - percentA;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [initialCampaigns, searchQuery, selectedCategory, sortBy, selectedLocation]);

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage) || 1;
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8">
      {/* Filter & Search Bar Card */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama pasien, sekolah, bencana, atau kota..."
              className="pl-10 h-11"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Location Select */}
          <div className="md:col-span-3">
            <select
              aria-label="Pilih Wilayah"
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 rounded-lg border border-border bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            >
              <option value="all">📍 Semua Wilayah</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Select */}
          <div className="md:col-span-3">
            <select
              aria-label="Urutkan Kampanye"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 rounded-lg border border-border bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            >
              <option value="latest">⏱️ Terbaru</option>
              <option value="urgent">🚨 Paling Mendesak</option>
              <option value="most_donated">🔥 Donasi Terbanyak</option>
              <option value="almost_reached">🎯 Mendekati Target</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory("all");
              setCurrentPage(1);
            }}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === "all"
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-100 text-muted-foreground hover:bg-slate-200"
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat.slug
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 text-muted-foreground hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Badges */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
        <p>
          Menampilkan <span className="font-bold text-foreground">{filteredCampaigns.length}</span> kampanye
        </p>
        {(searchQuery || selectedCategory !== "all" || selectedLocation !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedLocation("all");
            }}
            className="text-xs text-red-600 hover:text-red-700 h-8 gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Reset Filter
          </Button>
        )}
      </div>

      {/* Campaign Grid */}
      {paginatedCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-border space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-muted-foreground">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-foreground">Tidak Ada Kampanye Ditemukan</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Coba gunakan kata kunci pencarian yang lebih umum atau ubah filter wilayah dan kategori.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedLocation("all");
            }}
          >
            Reset Semua Filter
          </Button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Sebelumnya
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`h-9 w-9 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? "bg-primary text-white shadow-xs"
                      : "bg-white border border-border text-foreground hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}
