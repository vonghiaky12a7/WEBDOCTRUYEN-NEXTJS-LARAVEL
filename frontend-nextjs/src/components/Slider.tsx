"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Import useRouter
import { StoryService } from "../services/storyService";
import { Story } from "../models/story"; // Import model Story

const Slider = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter(); // Sử dụng router để điều hướng

  // Lấy 5 truyện mới nhất khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await StoryService.fetchStoriesDesc({
          limit: 5,
          sort: "desc",
        });
        console.log("Dữ liệu API trả về:", JSON.stringify(data, null, 2));
        setStories(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách truyện:", error);
      }
    };
    fetchData();
  }, []);

  // Chuyển slide tự động mỗi 4 giây
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex, stories]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === stories.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleClickStory = (storyId: string) => {
    router.push(`/stories/${storyId}`);
  };

  return (
    <section
      className="relative w-full max-h-200 bg-cover bg-center bg-no-repeat my-5 rounded-lg"
      style={{ backgroundColor: "#EDECEC" }} // Đổi thành nền xám
    >
      {/* Layer 1: Full-width background */}
      <div className="absolute inset-0 bg-black/40 rounded-lg"></div>

      {/* Layer 2: Inner container with padding */}
      <div className="relative max-w-4xl mx-auto p-7">
        {/* Layer 3: Carousel Wrapper */}
        <div className="relative h-56 md:h-96 overflow-hidden rounded-lg">
          {stories.map((story, index) => (
            <div
              key={story.storyId} // Dùng index nếu storyId bị lỗi
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => handleClickStory(stories[currentIndex].storyId)}
              style={{ cursor: "pointer", pointerEvents: "auto" }}
            >
              <Image
                src={story.coverImage}
                alt={story.title}
                fill
                priority
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>

        {/* Indicators */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === currentIndex ? "bg-blue-300" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Slider;
