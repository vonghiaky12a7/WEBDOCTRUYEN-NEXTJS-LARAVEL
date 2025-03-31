import { Story } from "@/models/story";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StoryService } from "../services/storyService";

const TrendingStories: React.FC = () => {
  const [trendingStories, setTrendingStories] = useState<Story[]>([]);
  const [newStories, setNewStories] = useState<Story[]>([]);

  useEffect(() => {
    const fetchDataStories = async () => {
      try {
        // Lấy top stories theo rating - đã có đầy đủ thông tin
        const topStories = await StoryService.getAllRatingsDESC(5);
        setTrendingStories(topStories);

        // Lấy stories mới nhất - đã có đầy đủ thông tin
        const newStories = await StoryService.fetchStoriesDesc({
          limit: 5,
          sort: "newest",
        });
        setNewStories(newStories);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách truyện:", error);
      }
    };

    fetchDataStories();
  }, []);

  return (
    <div className="mb-10 px-36">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* New Stories */}
        <div>
          <h1 className="text-xl font-bold mb-4 ps-2">🎨 New</h1>
          <div className="space-y-4">
            {newStories.map((story, index) => (
              <Link
                key={story.storyId}
                href={`/stories/${story.storyId}`}
                className="flex items-center gap-5 p-3 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition w-full h-28"
              >
                <Image
                  src={story.coverImage || "/placeholder.svg"}
                  alt={story.title}
                  width={96}
                  height={96}
                  className="rounded-md object-cover w-24 h-24"
                />
                <div className="flex-1 flex justify-between">
                  <div>
                    <h3 className="font-semibold text-md text-black dark:text-white">
                      {index + 1}. {story.title}
                    </h3>
                    <p className="text-sm text-gray-500">{story.author}</p>
                  </div>
                  <span className="text-gray-500 text-sm">
                    📅{" "}
                    {new Intl.DateTimeFormat("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(new Date(story.releaseDate))}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Trending Stories */}
        <div>
          <h1 className="text-xl font-bold mb-4 ps-2">🔥 Trending</h1>
          <div className="space-y-4">
            {trendingStories.map((story, index) => (
              <Link
                key={story.storyId}
                href={`/stories/${story.storyId}`}
                className="flex items-center gap-5 p-3 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition w-full h-28"
              >
                <Image
                  src={story.coverImage || "/placeholder.svg"}
                  alt={story.title}
                  width={96}
                  height={96}
                  className="rounded-md object-cover w-24 h-24"
                />
                <div className="flex-1 flex justify-between">
                  <div>
                    <h3 className="font-semibold text-md text-black dark:text-white">
                      {index + 1}. {story.title}
                    </h3>
                    <p className="text-sm text-gray-500">{story.author}</p>
                  </div>
                  <span className="text-gray-500 text-sm">
                    ⭐ {story.rating?.toFixed(1) || "0"} (
                    {story.ratingCount || 0} đánh giá)
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingStories;
