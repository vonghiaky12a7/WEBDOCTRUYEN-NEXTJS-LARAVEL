export interface Story {
  storyId: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  genreIds: number[];
  chapters?: number;
  releaseDate: string;
  rating?: number;
  ratingCount?: number;
}
