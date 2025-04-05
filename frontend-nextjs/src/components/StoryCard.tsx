"use client";

import Image from "next/image";
import Link from "next/link";
import { Story } from "../models/story";

interface StoryCardProps {
  story: Story;
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  const rating = story.rating || 0;
  const chapters = story.chapters || 0;

  const renderStars = (rating: number) => {
    if (!rating || isNaN(rating)) rating = 0;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-xs md:text-sm">
            ★
          </span>
        ))}
        {hasHalfStar && (
          <span className="text-yellow-400 text-xs md:text-sm">☆</span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span
            key={i + fullStars}
            className="text-gray-300 text-xs md:text-sm"
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <Link href={`/stories/${story.storyId}`} className="hover:no-underline">
      <div className="bg-white dark:bg-transparent hover:border-red-300 shadow-md border border-gray-50 rounded-xl overflow-hidden flex flex-col cursor-pointer w-full max-w-[150px] sm:max-w-[180px] md:max-w-[240px]">
        {/* Ảnh */}
        <div className="w-full h-[180px] sm:h-[200px] md:h-[240px] relative">
          <Image
            src={story.coverImage || "/placeholder.svg"}
            alt={story.title}
            fill
            sizes="(max-width: 640px) 150px, (max-width: 768px) 180px, 200px"
            className="rounded-t-xl object-cover"
          />
        </div>

        {/* Nội dung */}
        <div className="p-2 flex flex-col flex-grow">
          <h3 className="font-bold text-gray-600 dark:text-white text-xs sm:text-sm md:text-base line-clamp-1">
            {story.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-white truncate">
            Tác giả: {story.author}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500 dark:text-white">
              📖 {chapters} chương
            </p>
            <div className="flex items-center gap-1">
              {renderStars(rating)}
              <span className="text-xs text-gray-600 dark:text-white">
                ({rating ? rating.toFixed(1) : "0.0"})
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StoryCard;
