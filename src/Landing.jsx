import React from "react";

export default function Landing({ onEnter }) {
  return (
    <div className="landing">
      <div className="landing-bg"></div>

      <div className="landing-content fade">
        <h1 className="glow">🔥 MemeVerse</h1>
        <p className="tagline">
          Scroll. Laugh. Repeat.  
        </p>

        <div className="features">
          <div>😂 Endless memes</div>
          <div>⚡ Chaos mode</div>
          <div>❤️ Save your favorites</div>
        </div>

        <button className="enter-btn pulse" onClick={onEnter}>
          Enter the Chaos 🚀
        </button>
      </div>
    </div>
  );
}