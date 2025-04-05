// app/searchpage/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { StoryService } from "@/services/storyService";
import { Story } from "@/models/story";
import { Genre } from "@/models/genre";
import Breadcrumb from "@/components/Breadcrumbs";
import SearchFilters from "@/components/ui/search/SearchFilters";
import StoryGridTilted from "@/components/ui/search/StoryGridTilted";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("title") || "");
  const [selectedGenres, setSelectedGenres] = useState<number[]>(
    searchParams.get("genres")
      ? searchParams.get("genres")!.split(",").map(Number)
      : []
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [storyRatings, setStoryRatings] = useState<{ [key: string]: number }>(
    {}
  );

  // Breakpoints for responsive design
  const isLg = useMediaQuery({ minWidth: 1024 });
  const isMd = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isSm = useMediaQuery({ minWidth: 640, maxWidth: 767 });

  // Calculate priority count based on breakpoint
  const priorityCount = isLg ? 16 : isMd ? 9 : isSm ? 4 : 1;

  // Fetch genres on component mount
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await StoryService.fetchGenres();
        setGenres(data);
      } catch (error) {
        console.error("Error loading genres:", error);
      }
    };
    loadGenres();
  }, []);

  // Function to fetch stories with filters
  const fetchFilteredStories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await StoryService.searchStories({
        title: searchTerm,
        genres: selectedGenres,
        sortBy,
      });
      setStories(Array.isArray(data) ? data : []);

      if (Array.isArray(data) && data.length > 0) {
        const ratingsMap: { [key: string]: number } = {};
        data.forEach((story) => {
          ratingsMap[story.storyId] = story.rating || 0;
        });
        setStoryRatings(ratingsMap);
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedGenres, sortBy]);

  // Fetch stories when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchFilteredStories();
    }, 500); // Debounce 500ms
    return () => clearTimeout(debounceTimer);
  }, [fetchFilteredStories]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateSearchParams(value, selectedGenres, sortBy);
  };

  // Handle sort change
  const handleSortChange = (
    keys: "all" | (Set<React.Key> & { anchorKey?: string; currentKey?: string })
  ) => {
    if (keys === "all") return;

    const selectedKeys = Array.from(keys) as string[];
    if (selectedKeys.length > 0) {
      const newSortBy = selectedKeys[0];
      setSortBy(newSortBy);
      updateSearchParams(searchTerm, selectedGenres, newSortBy);
    }
  };

  // Handle genre selection change
  const handleGenreChange = (
    keys: "all" | (Set<React.Key> & { anchorKey?: string; currentKey?: string })
  ) => {
    if (keys === "all") return;

    const selectedKeys = Array.from(keys) as string[];
    const newGenres = selectedKeys.map(Number);
    setSelectedGenres(newGenres);
    updateSearchParams(searchTerm, newGenres, sortBy);
  };

  // Update URL with search parameters
  const updateSearchParams = (
    title: string,
    genres: number[],
    sort: string
  ) => {
    const params = new URLSearchParams();
    if (title) params.set("title", title);
    if (genres.length) params.set("genres", genres.join(","));
    params.set("sortBy", sort);
    router.push(`/searchpage?${params.toString()}`, { scroll: false });
  };

  return (
    <section className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/50">
        <div className="container mx-auto py-2 px-4">
          <Breadcrumb items={[{ label: "Tìm Truyện" }]} />
        </div>
      </div>

      {/* Search and Filter Bar */}
      <SearchFilters
        searchTerm={searchTerm}
        selectedGenres={selectedGenres}
        sortBy={sortBy}
        genres={genres}
        handleSearchChange={handleSearchChange}
        handleSortChange={handleSortChange}
        handleGenreChange={handleGenreChange}
      />

      {/* Story Grid */}
      <StoryGridTilted
        stories={stories}
        genres={genres}
        storyRatings={storyRatings}
        isLoading={isLoading}
        searchTerm={searchTerm}
        priorityCount={priorityCount}
      />
    </section>
  );
}
