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

  // Global memory (outside component)
  const seenMemes = new Set(
    JSON.parse(localStorage.getItem("seenMemes")) || []
  );

  export default function App() {
    const [entered, setEntered] = useState(false);
    const [page, setPage] = useState("home");
    const [meme, setMeme] = useState(null);
    const [nextMeme, setNextMeme] = useState(null);
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);
    const [caption, setCaption] = useState("");
    const [darkMode, setDarkMode] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [autoMode, setAutoMode] = useState(false);
    const [intervalId, setIntervalId] = useState(null);

    // ✅ Fetch Meme with Preload Support
    const fetchMeme = async (type = "memes", isPreload = false) => {
      if (!isPreload) setLoading(true);

      try {
        const res = await fetch(
          `https://www.reddit.com/r/${type}.json?limit=25&raw_json=1`
        );
        const data = await res.json();

        const posts = data.data.children
          .map((p) => p.data)
          .filter((post) => post.url && post.url.match(/\.(jpg|jpeg|png)$/));

        const shuffled = posts.sort(() => Math.random() - 0.5);

        let newMeme = shuffled.find(
          (post) => !seenMemes.has(post.url)
        );

        if (!newMeme) {
          seenMemes.clear();
          localStorage.removeItem("seenMemes");
          newMeme = shuffled[0];
        }

        seenMemes.add(newMeme.url);
        localStorage.setItem(
          "seenMemes",
          JSON.stringify([...seenMemes])
        );

        const memeData = {
          url: newMeme.url,
          title: newMeme.title,
        };

        if (isPreload) {
          setNextMeme(memeData);
        } else {
          setMeme(memeData);

          // 🔥 preload next meme
          fetchMeme(type, true);
        }
      } catch (err) {
        console.error(err);
      }

      if (!isPreload) setLoading(false);
    };

    // Theme
    useEffect(() => {
      document.body.classList.remove("dark", "light");
      document.body.classList.add(darkMode ? "dark" : "light");
    }, [darkMode]);

    useEffect(() => {
      const saved = localStorage.getItem("theme");
      if (saved) setDarkMode(saved === "dark");
    }, []);

    // Initial meme load
    useEffect(() => {
      if (entered) fetchMeme();
    }, [entered]);

    // Clean interval on unmount
    useEffect(() => {
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [intervalId]);

    // ❤️ Like
    const handleLike = () => {
      setScore((prev) => prev + 1);

      const liked = JSON.parse(localStorage.getItem("likedMemes")) || [];
      liked.push(meme);
      localStorage.setItem("likedMemes", JSON.stringify(liked));

      handleSkip();
    };

    // ⏭ Skip (uses preloaded meme)
    const handleSkip = () => {
      if (nextMeme) {
        setMeme(nextMeme);
        fetchMeme("memes", true);
      } else {
        fetchMeme();
      }
    };

    // 💾 Save
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

    // ⚡ Chaos Mode
    const chaosMode = () => {
      if (autoMode) {
        clearInterval(intervalId);
        setAutoMode(false);
        return;
      }

      const id = setInterval(() => {
        handleSkip();
        const randomCaption =
          captions[Math.floor(Math.random() * captions.length)];
        setCaption(randomCaption);
      }, 1500);

      setIntervalId(id);
      setAutoMode(true);
    };

    // ♾ Endless Mode
    const startEndless = () => {
  if (autoMode) {
    clearInterval(intervalId);
    setAutoMode(false);
    return;
  }

  const id = setInterval(async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `https://www.reddit.com/r/memes.json?limit=50`
      );
      const data = await res.json();

      const posts = data.data.children
        .map((p) => p.data)
        .filter((post) => post.url && post.url.match(/\.(jpg|jpeg|png)$/));

      const shuffled = posts.sort(() => Math.random() - 0.5);

      let newMeme = shuffled.find((post) => !seenMemes.has(post.url));

      if (!newMeme) {
        seenMemes.clear();
        localStorage.removeItem("seenMemes");
        newMeme = shuffled[0];
      }

      seenMemes.add(newMeme.url);
      localStorage.setItem(
        "seenMemes",
        JSON.stringify([...seenMemes])
      );

      setMeme({
        url: newMeme.url,
        title: newMeme.title,
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, 6000); 

  setIntervalId(id);
  setAutoMode(true);
};

    // ⬇ Download
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
        {/* TOP BAR */}
        <div className="top-bar">
          <button onClick={() => setPage("home")}>🏠 Home</button>
          <button onClick={() => setPage("saved")}>❤️ Saved</button>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        {/* BACK */}
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
              <button onClick={() => fetchMeme("memes")}>Funny 😂</button>
              <button onClick={() => fetchMeme("dankmemes")}>
                Dark 💀
              </button>
              <button onClick={() => fetchMeme("wholesomememes")}>
                Wholesome 🥺
              </button>
              <button onClick={() => fetchMeme()}>Random 🎲</button>

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

        {/* TOAST */}
        {showToast && <div className="toast">💾 Saved!</div>}
      </div>
    );
  }