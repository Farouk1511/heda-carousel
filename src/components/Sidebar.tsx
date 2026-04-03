import React from "react";
import { WEEKS, type Post } from "../data/posts";

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
  return (
    <div className={`sidebar-left${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-inner">
        <div className="logo">HEDA</div>
        <div className="logo-sub">Carousel Generator</div>
        <div className="post-count">{posts.length} POSTS</div>
        {WEEKS.map((w) => {
          const wp = posts.filter((p) => p.week === w.num);
          if (!wp.length) return null;
          return (
            <div className="week-group" key={w.num}>
              <div className="week-label">
                Week {w.num} — {w.title}
              </div>
              {wp.map((p) => {
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
          );
        })}
      </div>
    </div>
  );
};
