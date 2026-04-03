import React from "react";

export default function MemeCard({
  meme,
  caption,
  onLike,
  onSkip,
  onDownload,
  onSave
}) {
  // ✅ Check if meme is already saved
  const savedMemes = JSON.parse(localStorage.getItem("likedMemes")) || [];
  const isSaved = savedMemes.some((m) => m.url === meme.url);

  return (
    <div className="card">
      <h2>{meme.title}</h2>

      <img src={meme.url} alt="meme" />

      {caption && <p className="caption">{caption}</p>}

      <div className="actions">
        <button onClick={onLike}>Funny 😂</button>
        <button onClick={onSkip}>Trash 🗑️</button>

        {/* ✅ DYNAMIC SAVE BUTTON */}
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
        Download Meme ⬇️
      </button>
    </div>
  );
}   