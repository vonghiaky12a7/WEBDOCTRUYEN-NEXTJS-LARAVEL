"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LoadingError from "./LoadingError";
import { Story } from "../models/story";
import Image from "next/image";
import { StoryService } from "../services/storyService";
import RatingStars from "./RatingStars";
import Link from "next/link";
import { ChapterService } from "../services/chapterService";
import { Chapter } from "../models/chapter";
// import { formatDistanceToNow } from "date-fns";
// import { vi } from "date-fns/locale";
import { useAuthStore } from "@/stores/authStore";
import { Heart } from "lucide-react";

function DetailStory() {
  const { id } = useParams() as { id?: string };
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newestStories, setNewestStories] = useState<Story[]>([]);
  const [topStories, setTopStories] = useState<Story[]>([]);
  const [activeTab, setActiveTab] = useState<"newest" | "top">("newest");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuthStore();
  const userId = user?.id || null;

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const [storyData, newestData, topStories, chapters] = await Promise.all(
          [
            StoryService.fetchStoryById(id),
            StoryService.fetchStoriesDesc({ limit: 7, sort: "newest" }),
            StoryService.getAllRatingsDESC(7),
            ChapterService.getChaptersByStory(id),
          ]
        );

        setStory(storyData);
        setNewestStories(newestData);
        setChapters(chapters);
        setTopStories(topStories);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const storiesToShow = activeTab === "newest" ? newestStories : topStories;

  return (
    <section className="my-6 px-4 sm:my-10 sm:px-6 lg:px-8">
      <LoadingError isLoading={isLoading} error={error} />
      {story && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {/* Phần thông tin truyện */}
          <div className="md:col-span-2">
            <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-lg flex flex-col sm:flex-row gap-4">
              <Image
                src={story.coverImage}
                alt={story.title}
                width={120}
                height={180}
                className="object-cover rounded-lg w-full sm:w-32 md:w-40 h-48 sm:h-60 flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-black text-xl sm:text-2xl md:text-3xl font-bold truncate">
                    {story.title}
                  </h1>
                  <Heart
                    className={`w-5 h-5 sm:w-6 sm:h-6 cursor-pointer flex-shrink-0 ${
                      isLiked ? "text-red-500 fill-red-500" : "text-gray-500"
                    }`}
                    onClick={() => setIsLiked(!isLiked)}
                  />
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-2">
                  Tác giả: {story.author}
                </p>
                <p className="text-sm sm:text-base text-gray-700 mb-2 line-clamp-3">
                  {story.description}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mb-2">
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

            <div className="bg-white p-4 sm:p-6 mt-4 sm:mt-6 border rounded-2xl shadow-xl">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">
                📖 Danh sách chương
              </h2>
              {chapters.length > 0 ? (
                <ul className="divide-y divide-gray-300">
                  {chapters.map((chapter) => (
                    <li
                      key={chapter.chapterId}
                      className="py-2 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-100 px-2 sm:px-4 rounded-lg transition-all duration-200"
                    >
                      <Link
                        href={`/stories/${story.storyId}/chapter/${chapter.chapterId}`}
                        className="text-blue-600 font-medium hover:underline text-sm sm:text-base flex-grow mb-1 sm:mb-0 truncate"
                      >
                        {`Chương ${chapter.chapterNumber}: ${chapter.title}`}
                      </Link>
                      {/* <span className="text-gray-500 text-xs sm:text-sm">
                        {chapter.createdAt
                          ? formatDistanceToNow(new Date(chapter.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })
                          : "Không xác định"}
                      </span> */}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center p-4 text-sm sm:text-base">
                  Chưa có chương nào.
                </p>
              )}
            </div>
          </div>

          {/* Danh sách Top Truyện */}
          <div className="flex flex-col space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-lg">
              {/* Tabs */}
              <div className="flex border-b justify-center sticky top-0 bg-white z-10">
                {["newest", "top"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-3 py-2 text-sm sm:text-base font-semibold ${
                      activeTab === tab
                        ? "border-b-2 border-purple-600 text-black"
                        : "text-gray-500"
                    }`}
                    onClick={() => setActiveTab(tab as "newest" | "top")}
                  >
                    {tab === "newest" ? "Mới nhất" : "Top truyện"}
                  </button>
                ))}
              </div>

              {/* Danh sách truyện */}
              <ul
                className="mt-4 space-y-2 overflow-y-auto"
                style={{ maxHeight: "430px" }}
              >
                {storiesToShow.map((storyItem, index) => (
                  <Link
                    key={storyItem.storyId}
                    href={`/stories/${storyItem.storyId}`}
                    passHref
                  >
                    <li className="flex items-center space-x-2 sm:space-x-3 border-b pb-2 cursor-pointer hover:bg-gray-100 transition pt-2 relative">
                      <span
                        className={`text-sm sm:text-base font-bold ${
                          index < 3 ? "text-red-500" : "text-gray-600"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <Image
                        src={storyItem.coverImage}
                        alt={storyItem.title}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover w-10 h-10"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-semibold text-sm truncate">
                          {storyItem.title}
                        </p>
                        {activeTab === "newest" && (
                          <p className="text-gray-500 text-xs">
                            {new Date(storyItem.releaseDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        )}
                      </div>
                      {activeTab === "top" && (
                        <p className="text-gray-600 text-xs whitespace-nowrap">
                          ⭐{" "}
                          {typeof storyItem.rating === "number"
                            ? storyItem.rating.toFixed(1)
                            : "0.0"}{" "}
                          ({storyItem.ratingCount || 0})
                        </p>
                      )}
                    </li>
                  </Link>
                ))}
              </ul>
            </div>

            {/* Bình luận */}
            <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-lg">
              <h2 className="text-lg sm:text-xl font-semibold text-black">
                Bình luận
              </h2>
              <p className="text-gray-500 text-sm sm:text-base">
                (Tính năng bình luận sẽ sớm ra mắt!)
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default DetailStory;
