// create a zustand store to store the url of the pdf so that it can be accessed globally

import { create } from 'zustand';

interface UrlStore {
  url: string;
  setUrl: (url: string) => void;
  fileName: string;
  setFileName: (fileName: string) => void;
}

export const useUrlStore = create<UrlStore>((set) => ({
  url: '',
  setUrl: (url: string) => set({ url }),
  fileName: '',
  setFileName: (fileName: string) => set({ fileName }),
}));


