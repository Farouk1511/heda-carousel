import { useState, useCallback, useEffect } from "react";
import {
  POSTS,
  type MockupLayout,
  type Post,
  type SlideMockup,
  type SlideTextTransform,
} from "../data/posts";
import type { ThemeName } from "../data/themes";
import type { PostStyleEntry, SlideStyle, StyleMap } from "../data/design/types";
import { loadStyles, saveStyles } from "../utils/stylePersistence";

export type AspectRatio = "1:1" | "4:5" | "9:16";

const SAFE_AREA_KEY = "heda.carousel.safearea";

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
  const [styles, setStyles] = useState<StyleMap>(() => loadStyles());
  const [safeArea, setSafeArea] = useState<boolean>(
    () => localStorage.getItem(SAFE_AREA_KEY) === "1"
  );

  useEffect(() => {
    saveStyles(styles);
  }, [styles]);

  useEffect(() => {
    localStorage.setItem(SAFE_AREA_KEY, safeArea ? "1" : "0");
  }, [safeArea]);

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

  const updateMockup = useCallback(
    (slideIdx: number, mockup: SlideMockup) => {
      setPosts((prev) => {
        const next = [...prev];
        next[selectedPost] = {
          ...next[selectedPost],
          slides: next[selectedPost].slides.map((s, i) =>
            i === slideIdx ? { ...s, mockup } : s
          ),
        };
        return next;
      });
    },
    [selectedPost]
  );

  const patchMockup = useCallback(
    (slideIdx: number, patch: Partial<SlideMockup>) => {
      setPosts((prev) => {
        const next = [...prev];
        next[selectedPost] = {
          ...next[selectedPost],
          slides: next[selectedPost].slides.map((s, i) =>
            i === slideIdx && s.mockup
              ? { ...s, mockup: { ...s.mockup, ...patch } }
              : s
          ),
        };
        return next;
      });
    },
    [selectedPost]
  );

  const setMockupLayout = useCallback(
    (slideIdx: number, layout: MockupLayout) => {
      patchMockup(slideIdx, { layout, offsetX: 0, offsetY: 0 });
    },
    [patchMockup]
  );

  const patchTextTransform = useCallback(
    (slideIdx: number, patch: Partial<SlideTextTransform>) => {
      setPosts((prev) => {
        const next = [...prev];
        next[selectedPost] = {
          ...next[selectedPost],
          slides: next[selectedPost].slides.map((s, i) => {
            if (i !== slideIdx || !s.mockup) return s;
            const textTransform = {
              offsetX: 0,
              offsetY: 0,
              scale: 1,
              ...s.textTransform,
              ...patch,
            };
            return { ...s, textTransform };
          }),
        };
        return next;
      });
    },
    [selectedPost]
  );

  const removeMockup = useCallback(
    (slideIdx: number) => {
      setPosts((prev) => {
        const next = [...prev];
        next[selectedPost] = {
          ...next[selectedPost],
          slides: next[selectedPost].slides.map((s, i) => {
            if (i !== slideIdx) return s;
            const { mockup: _mockup, ...slideWithoutMockup } = s;
            return slideWithoutMockup;
          }),
        };
        return next;
      });
    },
    [selectedPost]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((c) => !c);
  }, []);

  const patchPostStyle = useCallback(
    (postId: number, patch: Partial<Omit<PostStyleEntry, "slides">>) => {
      setStyles((prev) => {
        const entry = prev[postId] ?? {};
        const next: PostStyleEntry = { ...entry, ...patch };
        if (patch.texture) next.texture = { ...entry.texture, ...patch.texture };
        if (patch.chrome) next.chrome = { ...entry.chrome, ...patch.chrome };
        return { ...prev, [postId]: next };
      });
    },
    []
  );

  const patchSlideStyle = useCallback(
    (postId: number, slideIdx: number, patch: Partial<SlideStyle>) => {
      setStyles((prev) => {
        const entry = prev[postId] ?? {};
        const slides = { ...entry.slides };
        const nextSlide: SlideStyle = { ...slides[slideIdx], ...patch };
        if (
          nextSlide.backgroundId === undefined &&
          nextSlide.variant === undefined &&
          nextSlide.mockupFrame === undefined
        ) {
          delete slides[slideIdx];
        } else {
          slides[slideIdx] = nextSlide;
        }
        return { ...prev, [postId]: { ...entry, slides } };
      });
    },
    []
  );

  const toggleSafeArea = useCallback(() => {
    setSafeArea((v) => !v);
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
    styles,
    postStyle: styles[post.id] as PostStyleEntry | undefined,
    safeArea,
    post,
    slides,
    slide,
    patchPostStyle,
    patchSlideStyle,
    toggleSafeArea,
    selectPost,
    prevSlide,
    nextSlide,
    goSlide,
    setTheme,
    toggleEdit,
    updateField,
    updateMockup,
    patchMockup,
    setMockupLayout,
    patchTextTransform,
    removeMockup,
    toggleSidebar,
    setExportRatio,
    setLogoScale,
    setCurrentSlide,
  };
}
