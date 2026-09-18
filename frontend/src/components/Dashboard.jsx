import { useEffect, useState } from "react";

function Dashboard({ onCreatePoll, onViewPoll, onViewResults }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await fetch(
          "https://polling-app-3ko1.onrender.com/api/polls",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to fetch polls"
          );
        }

        setPolls(
          Array.isArray(data.polls)
            ? data.polls
            : []
        );
      } catch (error) {
        console.error("Fetch polls error:", error);
        setError("Unable to load your polls.");
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  const totalVotes = polls.reduce(
    (total, poll) =>
      total +
      (Array.isArray(poll.options)
        ? poll.options.reduce(
            (pollTotal, option) =>
              pollTotal + (option.votes || 0),
            0
          )
        : 0),
    0
  );

  const totalOptions = polls.reduce(
    (total, poll) =>
      total +
      (Array.isArray(poll.options)
        ? poll.options.length
        : 0),
    0
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const handleShare = async (pollId) => {
    const pollLink = `${window.location.origin}/poll/${pollId}`;

    try {
      await navigator.clipboard.writeText(pollLink);
      alert("Poll link copied!");
    } catch (error) {
      console.error("Copy link error:", error);
      alert(`Copy this poll link:\n${pollLink}`);
    }
  };

  const handleDelete = async (pollId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this poll?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `https://polling-app-3ko1.onrender.com/api/polls/${pollId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete poll.");
        return;
      }

      alert("Poll deleted successfully!");

      setPolls((currentPolls) =>
        currentPolls.filter(
          (currentPoll) => currentPoll.id !== pollId
        )
      );
    } catch (error) {
      console.error("Delete poll error:", error);
      alert("Unable to connect to the backend server.");
    }
  };

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  return (
    <div className="dashboard">

      {/* HEADER */}

      <header className="dashboard-header">

        <div className="dashboard-brand">

          <div className="brand-icon small">
            P
          </div>

          <div>
            <h1>Pollify</h1>
            <p>Live polling platform</p>
          </div>

        </div>

        <div className="dashboard-user-area">

          <div className="user-info">
            <span className="user-avatar">
              {(user.name || "U")
                .charAt(0)
                .toUpperCase()}
            </span>

            <div>
              <strong>
                {user.name || "User"}
              </strong>

              <span>
                {user.email || ""}
              </span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      <main className="dashboard-content">

        {/* WELCOME */}

        <section className="welcome-section">

          <div className="welcome-text">

            <span className="dashboard-label">
              DASHBOARD
            </span>

            <h2>
              Welcome back,{" "}
              {user.name || "there"} 👋
            </h2>

            <p>
              Create polls, share them with your
              audience, and watch responses update
              live.
            </p>

          </div>

          <button
            className="create-poll-button"
            onClick={onCreatePoll}
          >
            <span>+</span>
            Create Poll
          </button>

        </section>

        {/* STATS */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              📊
            </div>

            <div>
              <span className="stat-label">
                Total Polls
              </span>

              <strong>
                {polls.length}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              🗳️
            </div>

            <div>
              <span className="stat-label">
                Total Votes
              </span>

              <strong>
                {totalVotes}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ⚡
            </div>

            <div>
              <span className="stat-label">
                Live Polls
              </span>

              <strong>
                {polls.length}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              📝
            </div>

            <div>
              <span className="stat-label">
                Answer Options
              </span>

              <strong>
                {totalOptions}
              </strong>
            </div>

          </div>

        </section>

        {/* POLLS */}

        <section className="poll-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                POLL MANAGEMENT
              </span>

              <h3>Your Polls</h3>

              <p>
                Manage and monitor the polls
                you've created.
              </p>
            </div>

            {polls.length > 0 && (
              <span className="poll-count">
                {polls.length}{" "}
                {polls.length === 1
                  ? "poll"
                  : "polls"}
              </span>
            )}

          </div>

          {/* LOADING */}

          {loading && (
            <div className="empty-state">

              <div className="empty-icon">
                ⏳
              </div>

              <h3>
                Loading your polls...
              </h3>

              <p>
                Fetching your latest poll data.
              </p>

            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="empty-state">

              <div className="empty-icon">
                ⚠️
              </div>

              <h3>
                Something went wrong
              </h3>

              <p>
                {error}
              </p>

              <button
                className="create-poll-button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>

            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            polls.length === 0 && (
              <div className="empty-state">

                <div className="empty-icon">
                  📊
                </div>

                <h3>
                  No polls yet
                </h3>

                <p>
                  Create your first poll and start
                  collecting responses in real time.
                </p>

                <button
                  className="create-poll-button"
                  onClick={onCreatePoll}
                >
                  + Create Your First Poll
                </button>

              </div>
            )}

          {/* POLL LIST */}

          {!loading &&
            !error &&
            polls.length > 0 && (
              <div className="poll-list">

                {polls.map((poll, index) => {

                  const votes =
                    Array.isArray(poll.options)
                      ? poll.options.reduce(
                          (total, option) =>
                            total +
                            (option.votes || 0),
                          0
                        )
                      : 0;

                  return (
                    <div
                      className="poll-card"
                      key={poll.id}
                    >

                      <div className="poll-number">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="poll-card-content">

                        <div className="poll-status">
                          <span></span>
                          Live
                        </div>

                        <h3>
                          {poll.question}
                        </h3>

                        <div className="poll-meta">

                          <span>
                            {Array.isArray(
                              poll.options
                            )
                              ? poll.options.length
                              : 0}{" "}
                            options
                          </span>

                          <span>
                            {votes}{" "}
                            {votes === 1
                              ? "vote"
                              : "votes"}
                          </span>

                        </div>

                      </div>

                      <div className="poll-card-actions">

                        <button
                          className="secondary-button"
                          onClick={() =>
                            onViewPoll(poll.id)
                          }
                        >
                          View Poll
                        </button>

                        <button
                          className="create-poll-button"
                          onClick={() =>
                            onViewResults(
                              poll.id
                            )
                          }
                        >
                          Results
                        </button>

                        <button
                          className="secondary-button"
                          onClick={() =>
                            handleShare(
                              poll.id
                            )
                          }
                        >
                          Share
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              poll.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;