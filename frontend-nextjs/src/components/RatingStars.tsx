/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { RatingService } from "../services/ratingService";
import { RatingStarsProps } from "../models/rating";
import { useAuthStore } from "@/stores/authStore";

const RatingStars: React.FC<RatingStarsProps> = ({
  storyId,
  userId,
  initialRating,
  ratingCount = 0,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(
    initialRating || null
  );
  const [totalRatings, setTotalRatings] = useState<number>(ratingCount || 0);

  // Sử dụng authStore thay vì cookies
  const { isLogged } = useAuthStore();

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        // Nếu không có initialRating, lấy từ API
        if (initialRating === undefined) {
          const ratingData = await RatingService.getRatingsByStoryId(storyId);
          setAverageRating(ratingData.average || 0);
          setTotalRatings(ratingData.count || 0);
        } else {
          setAverageRating(initialRating);
          setTotalRatings(ratingCount || 0);
        }

        // Nếu đã đăng nhập, lấy rating của user
        if (isLogged && userId) {
          try {
            const userRatingData = await RatingService.getRatingsByStoryId(
              storyId
            );
            const userRating =
              userRatingData.ratings?.find((r: any) => r.userId === userId)
                ?.rating || 0;
            setRating(userRating);
          } catch (err) {
            console.error("Không thể lấy rating của user:", err);
          }
        }
      } catch (err) {
        console.error("❌ Lỗi khi lấy dữ liệu rating:", err);
      }
    };

    fetchRatings();
  }, [storyId, userId, isLogged, initialRating, ratingCount]);

  const handleRating = async (starValue: number) => {
    if (!isLogged) {
      setError("Bạn cần đăng nhập để đánh giá!");
      return;
    }

    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      setRating(starValue);
      await RatingService.addRating(userId, storyId, starValue);

      // Cập nhật lại rating trung bình
      const ratingData = await RatingService.getRatingsByStoryId(storyId);
      setAverageRating(ratingData.average || 0);
      setTotalRatings(ratingData.count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start mt-2">
      <div className="flex items-center space-x-3">
        <div className="flex space-x-1">
          {Array.from({ length: 5 }).map((_, index) => {
            const starValue = index + 1;
            return (
              <span
                key={index}
                className={`text-4xl cursor-pointer transition-all duration-300 ${
                  starValue <= (hover || rating)
                    ? "text-yellow-500"
                    : "text-gray-300"
                } hover:scale-125 hover:text-yellow-400 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => handleRating(starValue)}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(0)}
              >
                ★
              </span>
            );
          })}
        </div>

        <span className="text-lg font-semibold text-gray-700 pt-2">
          ({averageRating !== null ? averageRating.toFixed(1) : "0"}/5) -{" "}
          {totalRatings} đánh giá
        </span>
      </div>

      {/* Hiển thị cảnh báo nếu chưa đăng nhập */}
      {error && (
        <p className="text-red-500 mt-2">
          {error}{" "}
          {!isLogged && (
            <a href="/auth/signin" className="underline text-blue-500">
              Đăng nhập ngay
            </a>
          )}
        </p>
      )}
    </div>
  );
};

export default RatingStars;
