"use client";

import { useState, useEffect } from "react";
import { Story } from "../models/story";
import { StoryService } from "../services/storyService";
import StoryCard from "./StoryCard";
import LoadingError from "./LoadingError";
import TrendingStories from "./TrendingStories";

function StoryList() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const data = await StoryService.fetchStories();
        // Dữ liệu trả về đã bao gồm đầy đủ thông tin
        setStories(data);
      } catch (err) {
        console.error(err);
        setError("Error fetching stories. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadStories();
  }, []);

  return (
    <section className="my-10">
      {/* Phần New & Trending + Originals */}
      <TrendingStories />
      <hr className="pb-2" />
      {/* Danh sách truyện mới cập nhật */}
      <div className="px-8">
        <h2 className="text-2xl font-bold mb-4 ps-2">Truyện Mới Cập Nhật</h2>
        <LoadingError isLoading={isLoading} error={error} />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stories.map((story) => (
            <StoryCard key={story.storyId} story={story} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default StoryList;
