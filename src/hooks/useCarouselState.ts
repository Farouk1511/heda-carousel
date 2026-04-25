import { useState, useCallback } from "react";
import { POSTS, type Post } from "../data/posts";
import type { ThemeName } from "../data/themes";

export type AspectRatio = "1:1" | "4:5" | "9:16";

export interface CarouselState {
  posts: Post[];
  selectedPost: number;
  currentSlide: number;
  theme: ThemeName;
  editingSlide: number | null;
  sidebarCollapsed: boolean;
  exportRatio: AspectRatio;
  logoScale: number;
}

export function useCarouselState() {
  const [posts, setPosts] = useState<Post[]>(() =>
    JSON.parse(JSON.stringify(POSTS))
  );
  const [selectedPost, setSelectedPost] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [theme, setTheme] = useState<ThemeName>("standard");
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [exportRatio, setExportRatio] = useState<AspectRatio>("4:5");
  const [logoScale, setLogoScale] = useState(1);

  const post = posts[selectedPost];
  const slides = post.slides;
  const slide = slides[currentSlide];

  const selectPost = useCallback((i: number) => {
    setSelectedPost(i);
    setCurrentSlide(0);
    setEditingSlide(null);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((c) => Math.max(0, c - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((c) => Math.min(slides.length - 1, c + 1));
  }, [slides.length]);

  const goSlide = useCallback((i: number) => {
    setCurrentSlide(i);
  }, []);

  const toggleEdit = useCallback(
    (i: number) => {
      setEditingSlide(editingSlide === i ? null : i);
      setCurrentSlide(i);
    },
    [editingSlide]
  );

  const updateField = useCallback(
    (slideIdx: number, field: "headline" | "sub", value: string) => {
      setPosts((prev) => {
        const next = [...prev];
        next[selectedPost] = {
          ...next[selectedPost],
          slides: next[selectedPost].slides.map((s, i) =>
            i === slideIdx ? { ...s, [field]: value } : s
          ),
        };
        return next;
      });
    },
    [selectedPost]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((c) => !c);
  }, []);

  return {
    posts,
    selectedPost,
    currentSlide,
    theme,
    editingSlide,
    sidebarCollapsed,
    exportRatio,
    logoScale,
    post,
    slides,
    slide,
    selectPost,
    prevSlide,
    nextSlide,
    goSlide,
    setTheme,
    toggleEdit,
    updateField,
    toggleSidebar,
    setExportRatio,
    setLogoScale,
    setCurrentSlide,
  };
}
