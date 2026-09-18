import { useEffect, useState } from "react";

function Results({
  pollId,
  showBackToDashboard = false,
  onBackToDashboard,
}) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let socket;

    const fetchPoll = async () => {
      try {
        const response = await fetch(
          `https://polling-app-3ko1.onrender.com/api/polls/${pollId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load results"
          );
        }

        setPoll(data.poll);
      } catch (error) {
        console.error("Fetch results error:", error);
        setError("Unable to load poll results.");
      } finally {
        setLoading(false);
      }
    };

    if (!pollId) {
      setError("Poll ID is missing.");
      setLoading(false);
      return;
    }

    // Get the current poll first
    fetchPoll();

    // Connect to the Go WebSocket endpoint
    socket = new WebSocket(
      `wss://polling-app-3ko1.onrender.com/api/polls/${pollId}/live`
    );

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsLive(true);
    };

    socket.onmessage = (event) => {
      try {
        const updatedPoll = JSON.parse(event.data);

        console.log("Live poll update received:", updatedPoll);

        setPoll(updatedPoll);
      } catch (error) {
        console.error(
          "WebSocket message error:",
          error
        );
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsLive(false);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsLive(false);
    };

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [pollId]);

  if (loading) {
    return (
      <div className="results-page">
        <div className="results-container">
          <div className="results-card">
            <div className="results-header">
              <h2>Loading results...</h2>

              <p>
                Fetching the latest poll results.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-page">
        <div className="results-container">
          <div className="results-card">
            <div className="results-header">
              <span className="live-badge">
                ● Live Results
              </span>

              <h2>Results unavailable</h2>

              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalVotes = poll.options.reduce(
    (total, option) => total + option.votes,
    0
  );

  return (
    <div className="results-page">
      <div className="results-container">

        <div className="results-brand">
          <div className="brand-icon small">
            P
          </div>

          <div>
            <h1>Pollify</h1>
            <p>Live polling platform</p>
          </div>
        </div>

        <div className="results-card">

          <div className="results-header">

            <span className="live-badge">
              ● Live Results
            </span>

            <h2>{poll.question}</h2>

            <p>
              Results update automatically as people vote.
            </p>

          </div>

          <div className="total-votes">
            <strong>{totalVotes}</strong>
            <span>Total votes</span>
          </div>

          <div className="results-list">

            {poll.options.map((option) => {

              const percentage =
                totalVotes === 0
                  ? 0
                  : Math.round(
                      (option.votes / totalVotes) * 100
                    );

              return (
                <div
                  className="result-item"
                  key={option.id}
                >

                  <div className="result-info">

                    <span className="result-option">
                      {option.text}
                    </span>

                    <span className="result-votes">
                      {option.votes} votes · {percentage}%
                    </span>

                  </div>

                  <div className="result-bar">

                    <div
                      className="result-bar-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    ></div>

                  </div>

                </div>
              );
            })}

          </div>

          <div className="results-footer">

            <span className="live-dot"></span>

            {isLive
              ? "Live updates enabled"
              : "Connecting to live updates..."}

          </div>
          {showBackToDashboard && (
  <button
    type="button"
    className="back-dashboard-button"
    onClick={onBackToDashboard}
  >
    ← Back to Dashboard
  </button>
)}
        </div>

      </div>
    </div>
  );
}

export default Results;