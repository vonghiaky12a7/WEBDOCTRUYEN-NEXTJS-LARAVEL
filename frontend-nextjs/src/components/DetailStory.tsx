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
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuthStore } from "@/stores/authStore";

function DetailStory() {
  const { id } = useParams() as { id?: string };
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newestStories, setNewestStories] = useState<Story[]>([]);
  const [topStories, setTopStories] = useState<Story[]>([]);
  const [activeTab, setActiveTab] = useState<"newest" | "top">("newest");
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Lấy user từ authStore
  const { user } = useAuthStore();
  const userId = user?.id || null;

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Gọi API song song
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

  // Chọn danh sách truyện theo tab
  const storiesToShow = activeTab === "newest" ? newestStories : topStories;
  console.log("storiesToShow:", storiesToShow);

  useEffect(() => {}, [activeTab, storiesToShow]);

  return (
    <section className="my-10 container mx-auto px-6">
      <LoadingError isLoading={isLoading} error={error} />
      {story && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phần thông tin truyện */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-lg border shadow-lg flex">
              <Image
                src={story.coverImage}
                alt={story.title}
                width={160}
                height={240}
                className="object-cover rounded-lg mr-4 h-[240px]"
              />

              <div>
                <h1 className="text-black text-4xl font-bold mt-4 mb-4">
                  {story.title}
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                  Tác giả: {story.author}
                </p>
                <p className="text-lg text-gray-700 mt-2 mb-2">
                  {story.description}
                </p>

                <p className="text-gray-500 mt-2 mb-2">
                  Ngày phát hành:{" "}
                  {new Date(story.releaseDate).toLocaleDateString("vi-VN")}
                </p>

                {/* Hiển thị RatingStars */}
                <RatingStars
                  storyId={story.storyId}
                  userId={userId || ""}
                  initialRating={story.rating}
                  ratingCount={story.ratingCount}
                />
              </div>
            </div>

            <div className="bg-white p-6 mt-6 border rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold mb-5 text-gray-800">
                📖 Danh sách chương
              </h2>

              {chapters.length > 0 ? (
                <ul className="divide-y divide-gray-300">
                  {chapters.map((chapter) => (
                    <li
                      key={chapter.chapterId}
                      className="py-3 flex items-center justify-between transition-all duration-200 hover:bg-gray-100 px-4 rounded-lg"
                    >
                      <Link
                        href={`/stories/${story.storyId}/chapter/${chapter.chapterId}`}
                        className="text-blue-600 font-medium hover:underline text-lg flex-grow"
                      >
                        {`Chương ${chapter.chapterNumber}: ${chapter.title}`}
                      </Link>
                      <span className="text-gray-500 text-sm">
                        {chapter.createdAt
                          ? formatDistanceToNow(new Date(chapter.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })
                          : "Không xác định"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center p-4">
                  Chưa có chương nào.
                </p>
              )}
            </div>
          </div>

          {/* Danh sách Top Truyện */}
          <div className="flex flex-col space-y-6 w-full">
            <div className="flex flex-col items-center w-full">
              <div
                className="bg-white p-6 rounded-lg border shadow-lg w-full max-w-md"
                style={{ height: "500px", paddingTop: "0" }}
              >
                {/* Tabs chọn Mới nhất & Top truyện */}
                <div className="flex border-b justify-center sticky top-0 bg-white z-10">
                  {["newest", "top"].map((tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-2 text-lg mx-6 font-semibold ${
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

                {/* Danh sách truyện theo tab */}
                <ul
                  className="mt-4 space-y-2 overflow-y-auto"
                  style={{ maxHeight: "430px" }}
                >
                  {storiesToShow.map((storyItem, index) => {
                    console.log("Rendering storyItem:", storyItem); // 📌 Debug storyItem tại đây

                    return (
                      <Link
                        key={storyItem.storyId}
                        href={`/stories/${storyItem.storyId}`}
                        passHref
                      >
                        <li className="flex items-center space-x-3 border-b pb-2 cursor-pointer hover:bg-gray-100 transition pt-2 relative">
                          <span
                            className={`text-lg font-bold ${
                              index < 3 ? "text-red-500" : "text-gray-600"
                            }`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <Image
                            src={storyItem.coverImage}
                            alt={storyItem.title}
                            width={50}
                            height={50}
                            className="rounded-lg object-cover fixed-image"
                          />

                          <div className="flex-1">
                            <p className="text-gray-900 font-semibold truncate">
                              {storyItem.title}
                            </p>
                            {activeTab === "newest" && (
                              <p className="text-gray-500 text-sm">
                                {new Date(
                                  storyItem.releaseDate
                                ).toLocaleDateString("vi-VN")}
                              </p>
                            )}
                          </div>
                          {activeTab === "top" && (
                            <p className="absolute right-2 text-gray-600 text-sm">
                              ⭐{" "}
                              {typeof storyItem.rating === "number"
                                ? storyItem.rating.toFixed(1)
                                : "0.0"}{" "}
                              ({storyItem.ratingCount || 0})
                            </p>
                          )}
                        </li>
                      </Link>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Bình luận */}
            <div className="bg-white p-6 rounded-lg border shadow-lg">
              <h2 className="text-black text-xl font-semibold">Bình luận</h2>
              <p className="text-gray-500">
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
