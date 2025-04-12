/* eslint-disable @typescript-eslint/no-unused-vars */
// services/readingProgressService.ts
import debounce from "lodash.debounce";
import axiosInstance from "@/utils/axiosInstance";

interface ReadingProgressData {
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
  private debounceTime = 5000;
  private pendingUpdates: Map<string, ReadingProgressData> = new Map();
  private debouncedSave = debounce(async () => {
    if (this.pendingUpdates.size === 0) return;
    const updates = Array.from(this.pendingUpdates.entries());
    this.pendingUpdates.clear();
    await Promise.all(updates.map(([_, data]) => this.saveToApi(data)));
  }, this.debounceTime);

  private constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", this.handleBeforeUnload.bind(this));
    }
  }

  public static getInstance(): ReadingProgressService | null {
    if (typeof window === "undefined") {
      return null;
    }
    if (!ReadingProgressService.instance) {
      ReadingProgressService.instance = new ReadingProgressService();
    }
    return ReadingProgressService.instance;
  }

  private getReadingState(): ReadingState {
    const raw = localStorage.getItem("story_state");
    return raw ? JSON.parse(raw) : {};
  }

  private saveReadingState(
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
    const accessToken = (typeof window !== "undefined") ? (document.cookie.match(/access_token=([^;]+)/)?.[1] ?? null) : null;
    const refreshToken = (typeof window !== "undefined") ? (document.cookie.match(/refresh_token=([^;]+)/)?.[1] ?? null) : null;

    if (!accessToken || !refreshToken) {
      console.warn("No access or refresh token, skip saving progress to API");
      return;
    }

    await axiosInstance.post("/reading-progress", data);
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
