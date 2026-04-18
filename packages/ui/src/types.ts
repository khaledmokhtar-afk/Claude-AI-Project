export type Mode = "demo" | "ai";

export type StreamState = {
  text: string;
  isStreaming: boolean;
  error: string | null;
  done: boolean;
};
