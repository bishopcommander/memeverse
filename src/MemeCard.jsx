import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

export default function MemeCard({
  meme,
  caption,
  onLike,
  onSkip,
  onSave,
  onDownload
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 120) {
      onLike();
    } else if (info.offset.x < -120) {
      onSkip();
    }
  };

  const savedMemes = JSON.parse(localStorage.getItem("likedMemes")) || [];
  const isSaved = savedMemes.some((m) => m.url === meme.url);

  return (
    <motion.div
      key={meme.url}
      className="card"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      whileTap={{ scale: 1.05 }}
    >
      <h2>{meme.title}</h2>

      <img src={meme.url} alt="meme" />

      {caption && <p className="caption">{caption}</p>}

      <div className="actions">
        <button onClick={onLike}>❤️</button>
        <button onClick={onSkip}>🗑️</button>
        <button
          onClick={onSave}
          style={{
            backgroundColor: isSaved ? "#ff4d6d" : "",
            color: isSaved ? "white" : ""
          }}
        >
          {isSaved ? "❤️ Saved" : "💾 Save"}
        </button>
      </div>

      <button className="download" onClick={onDownload}>
        ⬇️ Download
      </button>
    </motion.div>
  );
}
