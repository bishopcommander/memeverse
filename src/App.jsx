import React, { useEffect, useState } from "react";
import MemeCard from "./MemeCard";
import Landing from "./Landing";
import SavedMemes from "./SavedMemes";
import "./index.css";

const captions = [
  "Certified internet gold 😂",
  "This one broke me 💀",
  "Peak comedy achieved",
  "You weren't ready for this",
  "Chaos level: MAX ⚡"
];

const subreddits = [
  "memes",
  "dankmemes",
  "wholesomememes",
  "funny",
  "Animemes"
];

// GLOBAL SYSTEM
let memeCache = [];
let lastFetchTime = 0;
let memeQueue = [];

let usedMemes = new Set(
  JSON.parse(localStorage.getItem("usedMemes")) || []
);

export default function App() {
  const [entered, setEntered] = useState(false);
  const [page, setPage] = useState("home");
  const [meme, setMeme] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [caption, setCaption] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  // SAVE used memes
  const persistUsedMemes = () => {
    localStorage.setItem(
      "usedMemes",
      JSON.stringify(Array.from(usedMemes).slice(-500))
    );
  };

  // 🚀 FIXED FETCH
  const fetchMeme = async () => {
    if (loading) return; // 🔥 prevent spam
    setLoading(true);

    try {
      const now = Date.now();

      // USE CACHE
      if (now - lastFetchTime < 60000 && memeCache.length > 0) {
        if (memeQueue.length === 0) {
          memeQueue = [...memeCache].sort(() => Math.random() - 0.5);
        }

        let next = memeQueue.pop();

        while (next && usedMemes.has(next.url)) {
          next = memeQueue.pop();
        }

        if (!next) {
          lastFetchTime = 0;
          setLoading(false);
          return fetchMeme(); // safe retry
        }

        usedMemes.add(next.url);
        persistUsedMemes();

        setMeme({
          url: next.url,
          title: next.title
        });

        setLoading(false);
        return;
      }

      // FETCH NEW
      const randomSub =
        subreddits[Math.floor(Math.random() * subreddits.length)];

      const res = await fetch(
        `https://www.reddit.com/r/${randomSub}.json?limit=50&raw_json=1`
      );
      const data = await res.json();

      const posts = data.data.children
        .map((p) => p.data)
        .filter((post) => post.url && post.url.match(/\.(jpg|jpeg|png)$/));

      memeCache = posts;
      lastFetchTime = Date.now();
      memeQueue = [...posts].sort(() => Math.random() - 0.5);

      let next = memeQueue.pop();

      while (next && usedMemes.has(next.url)) {
        next = memeQueue.pop();
      }

      if (!next) {
        setLoading(false);
        return fetchMeme();
      }

      usedMemes.add(next.url);
      persistUsedMemes();

      setMeme({
        url: next.url,
        title: next.title
      });

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // THEME
  useEffect(() => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setDarkMode(saved === "dark");
  }, []);

  useEffect(() => {
    if (entered) fetchMeme();
  }, [entered]);

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  // ❤️ LIKE
  const handleLike = () => {
    setScore((prev) => prev + 1);

    const liked = JSON.parse(localStorage.getItem("likedMemes")) || [];
    liked.push(meme);
    localStorage.setItem("likedMemes", JSON.stringify(liked));

    fetchMeme();
  };

  // ⏭ SKIP
  const handleSkip = () => {
    fetchMeme();
  };

  // 💾 SAVE
  const handleSave = () => {
    let liked = JSON.parse(localStorage.getItem("likedMemes")) || [];

    const exists = liked.some((m) => m.url === meme.url);

    if (exists) {
      liked = liked.filter((m) => m.url !== meme.url);
    } else {
      liked.push(meme);
    }

    localStorage.setItem("likedMemes", JSON.stringify(liked));

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // CHAOS MODE
  const chaosMode = () => {
    if (intervalId) clearInterval(intervalId);

    if (autoMode) {
      setAutoMode(false);
      return;
    }

    const id = setInterval(() => {
      handleSkip();
      setCaption(
        captions[Math.floor(Math.random() * captions.length)]
      );
    }, 1500);

    setIntervalId(id);
    setAutoMode(true);
  };

  // ENDLESS MODE
  const startEndless = () => {
    if (intervalId) clearInterval(intervalId);

    if (autoMode) {
      setAutoMode(false);
      return;
    }

    const id = setInterval(() => {
      fetchMeme();
    }, 2500);

    setIntervalId(id);
    setAutoMode(true);
  };

  const downloadMeme = () => {
    const link = document.createElement("a");
    link.href = meme.url;
    link.download = "meme.jpg";
    link.click();
  };

  if (!entered) {
    return <Landing onEnter={() => setEntered(true)} />;
  }

  return (
    <div className="app">
      <div className="top-bar">
        <button onClick={() => setPage("home")}>🏠 Home</button>
        <button onClick={() => setPage("saved")}>❤️ Saved</button>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      <button
        className="back-home"
        onClick={() => {
          setEntered(false);
          setPage("home");
        }}
      >
        ⬅ Back
      </button>

      <h1>🔥 MemeVerse</h1>
      <p>Score: {score}</p>

      {page === "home" && (
        <div className="fade">
          <div className="buttons">
            <button onClick={fetchMeme}>Random 🎲</button>

            <button onClick={chaosMode}>
              {autoMode ? "⛔ Stop Chaos" : "⚡ Chaos Mode"}
            </button>

            <button onClick={startEndless}>
              {autoMode ? "⛔ Stop Endless" : "♾ Endless Mode"}
            </button>
          </div>

          {loading ? (
            <p>Loading meme...</p>
          ) : (
            meme && (
              <div className="meme-container">
                <MemeCard
                  key={meme.url} // 🔥 CRITICAL FIX
                  meme={meme}
                  caption={caption}
                  onLike={handleLike}
                  onSkip={handleSkip}
                  onDownload={downloadMeme}
                  onSave={handleSave}
                />
              </div>
            )
          )}
        </div>
      )}

      {page === "saved" && <SavedMemes setPage={setPage} />}

      {showToast && <div className="toast">💾 Saved!</div>}
    </div>
  );
}
