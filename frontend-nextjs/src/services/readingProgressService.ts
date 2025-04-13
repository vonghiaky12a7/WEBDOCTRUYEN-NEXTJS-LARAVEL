// services/readingProgressService.ts
import axiosInstance from "@/utils/axiosInstance";

export interface ReadingProgressData {
  storyId: string;
  lastChapterId: string | null;
  lastPage: number;
  lastReadAt?: string;
}

interface ReadingState {
  [storyId: string]: { [chapterId: string]: number };
}

export class ReadingProgressService {
  private static instance: ReadingProgressService;
  private debounceTime = 1000;
  private pendingUpdates: Map<string, ReadingProgressData> = new Map();
  private debouncedSave = debounce(async () => {
    if (this.pendingUpdates.size === 0) return;
    const updates = Array.from(this.pendingUpdates.entries());
    this.pendingUpdates.clear();
    await Promise.all(updates.map(([_, data]) => this.saveToApi(data)));
  }, this.debounceTime);

  private constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener(
        "beforeunload",
        this.handleBeforeUnload.bind(this)
      );
    }
  }

  public static getInstance(): ReadingProgressService | null {
    if (typeof window === "undefined") {
      return null;
    }
  },

  // Gửi tiến độ đọc mới lên server
  async createProgress(
    storyId: string,
    chapterId: string,
    page: number
  ): void {
    const state = this.getReadingState();
    if (!state[storyId]) state[storyId] = {};
    state[storyId][chapterId] = page;
    localStorage.setItem("story_state", JSON.stringify(state));
  }

  private async saveToApi(data: ReadingProgressData): Promise<void> {
    try {
      await axiosInstance.post("/reading-progress", data);
    } catch (error) {
      console.error("Failed to save reading progress:", error);
    }
  }


  public async getProgress(
    storyId: string
  ): Promise<ReadingProgressData | null> {
    const response = await axiosInstance.get(`/reading-progress/${storyId}`);
    return response.data.progress;
  }

  public updateProgress(
    storyId: string,
    chapterId: string,
    page: number
  ): void {
    this.saveReadingState(storyId, chapterId, page);
    const progressData: ReadingProgressData = {
      storyId,
      lastChapterId: chapterId,
      lastPage: page,
      lastReadAt: new Date().toISOString(),
    };
    this.pendingUpdates.set(storyId, progressData);
    this.debouncedSave();
  }

  private async handleBeforeUnload(event: BeforeUnloadEvent): Promise<void> {
    if (this.pendingUpdates.size > 0) {
      this.debouncedSave.cancel();
      const updates = Array.from(this.pendingUpdates.entries());
      updates.forEach(([_, data]) => {
        this.saveReadingState(
          data.storyId,
          data.lastChapterId || "",
          data.lastPage
        );
      });
      await Promise.all(updates.map(([_, data]) => this.saveToApi(data)));
    }
  }

  public destroy(): void {
    this.debouncedSave.cancel();
    window.removeEventListener(
      "beforeunload",
      this.handleBeforeUnload.bind(this)
    );
  }
}
let instance: ReadingProgressService | null = null;

export function getReadingProgressService(): ReadingProgressService | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (!instance) {
    instance = ReadingProgressService.getInstance();
  }
  return instance;
}
export default ReadingProgressService.getInstance();
