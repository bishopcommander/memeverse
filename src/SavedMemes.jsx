import React, { useEffect, useState } from "react";

export default function SavedMemes({ setPage }) {
  const [memes, setMemes] = useState([]);

  useEffect(() => {
    loadMemes();
  }, []);

  const loadMemes = () => {
    const stored = JSON.parse(localStorage.getItem("likedMemes")) || [];
    setMemes(stored);
  };

  const deleteMeme = (indexToDelete) => {
    const updated = memes.filter((_, index) => index !== indexToDelete);
    setMemes(updated);
    localStorage.setItem("likedMemes", JSON.stringify(updated));
  };

  const clearAll = () => {
    localStorage.removeItem("likedMemes");
    setMemes([]);
  };

  return (  
    <div className="saved-page">
      <h1>❤️ Saved Memes</h1>

      

      {memes.length > 0 && (
        <button onClick={clearAll} className="clear-btn">
          🧹 Clear All
        </button>
      )}

      <div className="grid">
        {memes.length === 0 ? (
          <p>No saved memes yet 😢</p>
        ) : (
          memes.map((meme, index) => (
            <div key={index} className="saved-card">
              <img src={meme.url} alt="meme" />
              <p>{meme.title}</p>

              <button
                className="delete-btn"
                onClick={() => deleteMeme(index)}
              >
                ❌ Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}