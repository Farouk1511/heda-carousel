import React, { useEffect, useMemo, useState } from "react";
import { POST_MONTHS, type Post } from "../data/posts";

interface SidebarProps {
  posts: Post[];
  selectedPost: number;
  collapsed: boolean;
  onSelect: (i: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  posts,
  selectedPost,
  collapsed,
  onSelect,
}) => {
  const months = useMemo(() => {
    let weekNum = 1;
    let postCursor = 0;

    return POST_MONTHS.map((month, monthIndex) => {
      const weeks = month.weeks.map((week) => {
        const weekPosts = posts.slice(postCursor, postCursor + week.posts.length);
        postCursor += week.posts.length;

        return {
          num: weekNum++,
          title: week.title,
          posts: weekPosts,
        };
      });

      const lastWeek = weeks[weeks.length - 1];
      const lastPost = lastWeek?.posts[lastWeek.posts.length - 1];

      return {
        key: `month-${monthIndex + 1}`,
        title: month.title,
        weeks,
        startIndex: weeks[0]?.posts[0] ? posts.indexOf(weeks[0].posts[0]) : -1,
        endIndex: lastPost ? posts.indexOf(lastPost) : -1,
      };
    });
  }, [posts]);

  const selectedMonthIndex = useMemo(
    () =>
      months.findIndex(
        (month) =>
          month.startIndex !== -1 &&
          month.endIndex !== -1 &&
          selectedPost >= month.startIndex &&
          selectedPost <= month.endIndex
      ),
    [months, selectedPost]
  );

  const [openMonthIndex, setOpenMonthIndex] = useState(
    selectedMonthIndex === -1 ? 0 : selectedMonthIndex
  );

  useEffect(() => {
    if (selectedMonthIndex !== -1) {
      setOpenMonthIndex(selectedMonthIndex);
    }
  }, [selectedMonthIndex]);

  return (
    <div className={`sidebar-left${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-inner">
        <div className="logo">HEDA</div>
        <div className="logo-sub">Carousel Generator</div>
        <div className="post-count">{posts.length} POSTS</div>

        {months.map((month, monthIndex) => {
          const isOpen = monthIndex === openMonthIndex;

          return (
            <div className="month-group" key={month.key}>
              <button
                type="button"
                className={`month-toggle${isOpen ? " open" : ""}`}
                onClick={() => setOpenMonthIndex(isOpen ? -1 : monthIndex)}
              >
                <span>{month.title}</span>
                <span className="month-toggle-icon">{isOpen ? "-" : "+"}</span>
              </button>

              {isOpen &&
                month.weeks.map((week) => (
                  <div className="week-group" key={week.num}>
                    <div className="week-label">
                      Week {week.num} — {week.title}
                    </div>
                    {week.posts.map((p) => {
                      const gi = posts.indexOf(p);
                      return (
                        <div
                          key={p.id}
                          className={`post-item${gi === selectedPost ? " active" : ""}`}
                          onClick={() => onSelect(gi)}
                        >
                          <div className="day">Day {p.day}</div>
                          <div className="title">{p.title}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
