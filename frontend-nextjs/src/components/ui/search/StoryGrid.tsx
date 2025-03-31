// components/search/StoryGrid.tsx
"use client";

import React from "react";
import { Pagination } from "@heroui/react";
import { Story } from "@/models/story";
import { Genre } from "@/models/genre";
import StoryCard from "./StoryCard";

interface StoryGridProps {
  stories: Story[];
  genres: Genre[];
  storyRatings: { [key: string]: number };
  isLoading: boolean;
  searchTerm: string;
  priorityCount: number;
}

export default function StoryGrid({
  stories,
  genres,
  storyRatings,
  isLoading,
  searchTerm,
  priorityCount,
}: StoryGridProps) {
  return (
    <div className="container mx-auto py-4 px-4">
      <h2 className="text-2xl font-bold mb-6">
        {searchTerm ? `Kết quả tìm kiếm cho "${searchTerm}"` : "Tất cả truyện"}
        <span className="text-muted-foreground ml-2 text-sm font-normal">
          ({stories.length})
        </span>
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Không tìm thấy truyện</h3>
          <p className="text-muted-foreground">
            Hãy thử điều chỉnh lại từ khóa tìm kiếm hoặc bộ lọc của bạn
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {stories.map((story, index) => (
            <StoryCard
              key={story.storyId}
              story={story}
              genres={genres}
              storyRatings={storyRatings}
              priority={index < priorityCount}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <Pagination
          total={10}
          initialPage={1}
          showControls
          variant="bordered"
          classNames={{
            item: "h-8 w-8",
          }}
        />
      </div>
    </div>
  );
}
