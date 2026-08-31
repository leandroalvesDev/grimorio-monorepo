export interface ReaderPosition {
  cfi?: string;
  page?: number;
}

export interface ReaderHandle {
  next: () => void;
  prev: () => void;
  restart: () => void;
  saveNow: () => void;
}