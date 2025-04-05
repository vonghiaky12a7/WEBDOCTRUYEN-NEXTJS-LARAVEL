// components/search/StoryGrid.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pagination } from "@heroui/react";
import { Story } from "@/models/story";
import { Genre } from "@/models/genre";
import TiltedCard from "../../reactbits/TiltedCard";

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
}: StoryGridProps) {
  // State for current page
  const [currentPage, setCurrentPage] = useState(1);
  const storiesPerPage = 8; // 8 stories per page

  // Calculate total pages
  const totalPages = Math.ceil(stories.length / storiesPerPage);

  // Slice stories for the current page
  const startIndex = (currentPage - 1) * storiesPerPage;
  const endIndex = startIndex + storiesPerPage;
  const paginatedStories = stories.slice(startIndex, endIndex);

  // Function to render star rating
  const renderRating = (rating: number | undefined) => {
    if (rating === undefined) return "0.0";
    return rating.toFixed(1);
  };

  return (
    <div className="container mx-auto py-4 px-4 flex flex-col min-h-screen">
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
        <div className="flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedStories.map((story) => (
              <Link
                key={story.storyId}
                href={`/stories/${story.storyId}`}
                className="block"
              >
                <TiltedCard
                  imageSrc={story.coverImage || "/app/public/placeholder.svg"}
                  altText={`${story.title} Cover`}
                  captionText={`${story.title} - ${story.author}`}
                  containerHeight="400px"
                  containerWidth="100%"
                  imageHeight="400px"
                  imageWidth="100%"
                  rotateAmplitude={12}
                  scaleOnHover={1.1}
                  showMobileWarning={false}
                  showTooltip={true}
                  displayOverlayContent={true}
                  overlayContent={
                    <div className="p-3 text-white bg-black/60 w-full rounded-b-[15px]">
                      {/* Top Section: Title and Author */}
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-base uppercase truncate">
                          {story.title}
                        </h3>
                        <p className="text-xs opacity-80">
                          Tác giả: {story.author}
                        </p>
                      </div>

                      {/* Bottom Section: Genres, Chapters, and Rating */}
                      <div className="mt-1">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {story.genreIds.map((genreId) => {
                            const genre = genres.find(
                              (g) => g.genreId === genreId
                            );
                            return genre ? (
                              <span
                                key={genreId}
                                className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] uppercase"
                              >
                                {genre.genreName}
                              </span>
                            ) : null;
                          })}
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>{story.chapters || 0} chương</span>
                          <span>
                            Rating:{" "}
                            {renderRating(
                              story.rating || storyRatings[story.storyId]
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 justify-center flex">
          <Pagination
            total={totalPages}
            initialPage={1}
            showControls
            variant="bordered"
            classNames={{
              item: "h-8 w-8",
            }}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
}
