import Image from "next/image";
import Link from "next/link";
import { addToast } from "@heroui/toast";
import RatingStars from "./RatingStars";
import { Story } from "@/models/story";
import { FavoriteService } from "@/services/favoriteService";

interface StoryInfoProps {
  story: Story;
  isLiked: boolean;
  setIsLiked: (value: boolean) => void;
  userId: string | null;
}

export default function StoryInfo({
  story,
  isLiked,
  setIsLiked,
  userId,
}: StoryInfoProps) {
  const handleToggleFavorite = async () => {
    if (!userId) {
      addToast({
        description: "Bạn cần đăng nhập để thực hiện chức năng này",
        color: "warning",
        timeout: 2500,
      });
      return;
    }

    try {
      if (isLiked) {
        await FavoriteService.removeFavorite(userId, story.storyId);
        setIsLiked(false);
        addToast({
          description: "Đã xóa khỏi danh sách yêu thích",
          color: "success",
          timeout: 2500,
        });
      } else {
        await FavoriteService.addFavorite(userId, story.storyId);
        setIsLiked(true);
        addToast({
          description: "Đã thêm vào danh sách yêu thích",
          color: "success",
          timeout: 2500,
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      addToast({
        description: "Có lỗi xảy ra, vui lòng thử lại sau",
        color: "danger",
        timeout: 2500,
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="relative w-full md:w-48 aspect-[2/3] shrink-0">
        <Image
          src={story.coverImage}
          alt={story.title}
          fill
          className="rounded-lg object-cover"
          priority
        />
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
              {story.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
              Tác giả: {story.author}
            </p>
          </div>
          <button
            onClick={handleToggleFavorite}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              isLiked
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {isLiked ? "❤️ Đã thích" : "🤍 Yêu thích"}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {story.genres.map((genre) => (
              <Link
                key={genre.genreId}
                href={`/searchpage?genres=${genre.genreId}`}
                className="px-3 py-1 text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                {genre.genreName}
              </Link>
            ))}
          </div>

          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line line-clamp-4">
            {story.description}
          </p>
        </div>

        <p className="text-gray-600 dark:text-gray-400">
          Ngày phát hành:{" "}
          {new Date(story.releaseDate).toLocaleDateString("vi-VN")}
        </p>

        <RatingStars
          storyId={story.storyId}
          userId={userId || ""}
          initialRating={story.rating}
          ratingCount={story.ratingCount}
        />
      </div>
    </div>
  );
}