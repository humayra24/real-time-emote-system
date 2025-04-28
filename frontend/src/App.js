import React, { useEffect, useState, useRef } from "react";
import "./App.css";

function App() {
  const [moments, setMoments] = useState([]);
  const [animatedEmotes, setAnimatedEmotes] = useState([]);
  const [settings, setSettings] = useState({
    interval: 100,
    threshold: 0.5,
    allowedEmotes: ["❤️", "👍", "😢", "😡"],
  });
  const videoRef = useRef(null);
  const mediaSourceRef = useRef(new MediaSource());
  const chunkQueue = useRef([]);
  const sourceBufferRef = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);
  let sourceBuffer = null;
  const wsRef = useRef(null);

  // Single WebSocket connection for both video and emote data
  useEffect(() => {
    const wsUrl = process.env.REACT_APP_WS_URL || "ws://localhost:3003/ws";
    // console.log("Connecting to WebSocket at:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const videoElement = videoRef.current;
    const mediaSource = mediaSourceRef.current;
    let queue = [];
    let isInitialized = false;

    videoElement.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener("sourceopen", () => {
      try {
        console.log("MediaSource opened");
        // Check if the browser supports the codec
        const codec = 'video/mp4; codecs="avc1.42E01E,mp4a.40.2"';
        if (!MediaSource.isTypeSupported(codec)) {
          console.error("Codec not supported by the browser");
          setError("Codec not supported by the browser");
          return;
        }
        // Create a SourceBuffer for the video stream
        sourceBuffer = mediaSource.addSourceBuffer(codec);
        console.log("SourceBuffer added with codec:", codec);

        // Handle SourceBuffer updateend event
        sourceBuffer.addEventListener("updateend", () => {
          if (queue.length > 0 && !sourceBuffer.updating) {
            const chunk = queue.shift();
            console.log(chunk);
            try {
              sourceBuffer.appendBuffer(chunk.data);
              // console.log("Appended chunk from queue, index:", chunk.index);
            } catch (e) {
              // console.error("Error appending buffer from queue:", e);
              if (
                e.name === "QuotaExceededError" &&
                sourceBuffer.buffered.length > 0
              ) {
                const start = sourceBuffer.buffered.start(0);
                const end = sourceBuffer.buffered.end(0);
                sourceBuffer.remove(start, end - 10); // Remove all but last 10 seconds
              }
            }
          }
        });

        // Handle SourceBuffer error event
        sourceBuffer.addEventListener("error", (e) => {
          console.error("SourceBuffer error:", e);
          setError("SourceBuffer error: " + e.message);
        });
      } catch (e) {
        console.error("Error setting up MediaSource:", e);
        setError("Error setting up video player: " + e.message);
      }
    });

    // Handle WebSocket messages
    ws.onopen = () => {
      console.log("Connected to WebSocket");
      setWsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // console.log("Received message:", data);
        // console.log("Received message type:", data.type);
        // console.log("MediaSource state:", mediaSource.readyState);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          if (data.type === "welcome") {
            console.log("Received welcome message:", data);
          } else if (data.type === "emote") {
            // Process significant moments and emote bursts
            setMoments((prev) => [...prev, data].slice(-10));

            const emoteBurst = Array(5).fill(data.emote); // Create an array of 5 emotes
            setAnimatedEmotes((prev) => [...prev, ...emoteBurst]);

            // Remove emotes after animation
            setTimeout(() => {
              setAnimatedEmotes((prev) => prev.slice(emoteBurst.length));
            }, 5000);
          } else if (
            data.type === "video" &&
            mediaSource.readyState === "open"
          ) {
            try {
              // console.log("Processing video chunk:", data.index);
              const binaryString = atob(data.chunk);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }

              // console.log("Video chunk bytes:", bytes);

              if (!sourceBuffer.updating) {
                try {
                  sourceBuffer.appendBuffer(bytes);
                  // console.log("Appended chunk directly, index:", data.index);
                } catch (e) {
                  // console.error("Error appending buffer directly:", e);
                  if (
                    e.name === "QuotaExceededError" &&
                    sourceBuffer.buffered.length > 0
                  ) {
                    const start = sourceBuffer.buffered.start(0);
                    const end = sourceBuffer.buffered.end(0);
                    sourceBuffer.remove(start, end - 10);
                  }
                }
              } else {
                queue.push({ data: bytes, index: data.index });
                // console.log("Queued chunk, index:", data.index);
              }

              // Start playing when there's some data
              if (!videoElement.playing && sourceBuffer.buffered.length > 0) {
                videoElement.play().catch((e) => {
                  // console.error("Error playing video:", e);
                  setError("Error playing video: " + e.message);
                });
              }
            } catch (e) {
              // console.error("Error processing video chunk:", e);
              setError("Error processing video: " + e.message);
            }
          }
        } else {
          console.error("WebSocket is not in OPEN state");
        }
      } catch (error) {
        // console.error("Error processing message:", error);
        setError("Error processing message: " + error.message);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
      setWsConnected(false);
      setError("WebSocket connection closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket error occurred");
    };

    // Cleanup on unmount
    return () => {
      ws.close();
      if (mediaSource.readyState === "open") {
        mediaSource.endOfStream();
      }
    };
  }, []);

  // Fetch initial settings
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSettings)
      .catch((err) => console.error("Error fetching settings:", err));
  }, []);

  const updateSettings = (newSettings) => {
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    })
      .then(() => setSettings(newSettings))
      .catch((err) => console.error("Error updating settings:", err));
  };

  useEffect(() => {
    if (moments.length > 0) {
      // Change the background color when a new moment is added
      document.body.style.backgroundColor = "#add8e6"; // Light blue

      // Reset the background color after 5 seconds
      const timeout = setTimeout(() => {
        document.body.style.backgroundColor = "";
      }, 5000);

      return () => clearTimeout(timeout); // Cleanup the timeout on unmount or when moments change
    }
  }, [moments]);

  const sendEmote = (emote) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "emote", emote }));
      console.log("Sent emote:", emote);
    } else {
      console.error("WebSocket is not connected");
    }

    // Add the flying emoji anuimation
    // const emoteBurst = Array(5).fill(emote); // Create an array of 5 emotes
    setAnimatedEmotes((prev) => [...prev, emote]); // Add the emote to the animated emotes
    // setAnimatedEmotes((prev) => [...prev, ...emoteBurst]);

    // Remove emotes after animation
    setTimeout(() => {
      setAnimatedEmotes((prev) => prev.filter((e) => e !== emote)); // Remove the emote after 2 seconds
    }, 5000);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Emote Data Viewer</h1>
        {/* <input type="file" onChange={handleUpload} /> */}
        <div className="connection-status">
          <p>
            WebSocket Status:{" "}
            <span className={wsConnected ? "connected" : "disconnected"}>
              {wsConnected ? "Connected" : "Disconnected"}
            </span>
          </p>
          {error && <p className="error">{error}</p>}
        </div>
      </header>
      <main>
        <h2>Video Stream</h2>
        <div className="video-container">
          <video ref={videoRef} controls autoPlay width="600" />
          <div className="emote-animation-container">
            {animatedEmotes.map((emote, index) => (
              <span
                key={index}
                className="emote flying-emote"
                style={{ "--random-offset": `${Math.random() * 200 - 100}px` }} // Random offset between -100px and 100px
              >
                {emote}
              </span>
            ))}
          </div>
        </div>
        <div className="emote-buttons">
          {settings.allowedEmotes.map((emote, index) => (
            <button
              key={index}
              className="emote-button"
              onClick={() => sendEmote(emote)}
            >
              {emote}
            </button>
          ))}
        </div>
        {moments.length > 0 && (
          <div className="notification">
            New significant moment: {moments[moments.length - 1].emote}
          </div>
        )}
        {/* <div className="emote-animation-container">
          {animatedEmotes.map((emote, index) => (
            <span
              key={index}
              className="emote flying-emote"
              style={{ "--random-offset": `${Math.random() * 200 - 100}px` }} // Random offset between -100px and 100px
            >
              {emote}
            </span>
          ))}
        </div> */}
        <div className="settings-and-moments">
          <div className="settings-form">
            <h2>Settings</h2>
            <div>
              <label title="Interval in milliseconds between updates">
                Interval:
                <input
                  type="number"
                  value={settings.interval}
                  onChange={(e) =>
                    updateSettings({ ...settings, interval: +e.target.value })
                  }
                />
              </label>
              <label>
                Threshold:
                <input
                  type="number"
                  step="0.1"
                  value={settings.threshold}
                  onChange={(e) =>
                    updateSettings({ ...settings, threshold: +e.target.value })
                  }
                />
              </label>
              <label>
                Allowed Emotes:
                <input
                  value={settings.allowedEmotes.join(",")}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      allowedEmotes: e.target.value.split(","),
                    })
                  }
                />
              </label>
            </div>
          </div>

          <div className="significant-moments-container">
            <h2>Significant Moments</h2>
            <div className="significant-moments-list">
              {moments.length === 0 ? (
                <p>No significant moments found.</p>
              ) : (
                [...moments].reverse().map((m, i) => (
                  <div key={i} className="significant-moment-item">
                    {formatDateTime(m.timestamp)}: {m.emote} ({m.count}/
                    {m.totalEmotes})
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <h2>Latest Emote Data</h2>
        <div className="emote-list-container">
          <div className="emote-list">
            {moments.length === 0 ? (
              <p>No significant moments found.</p>
            ) : (
              [...moments].reverse().map(
                (
                  data,
                  index // Reverse the moments array
                ) => (
                  <div key={index} className="emote-item">
                    <p>Timestamp: {formatDateTime(data.timestamp)}</p>
                    <p>Emote: {data.emote}</p>
                    <p>Count: {data.count}</p>
                    <p>Total Emotes: {data.totalEmotes}</p>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};

export default App;
