import { useState } from "react";
import "./App.css";

import Dashboard from "./components/Dashboard";
import CreatePoll from "./components/CreatePoll";
import VotePoll from "./components/VotePoll";
import Results from "./components/Results";
import Signup from "./components/Signup";
import PublicPoll from "./components/PublicPoll";

function App() {
  const sharedPollMatch = window.location.pathname.match(
  /^\/poll\/([a-fA-F0-9]{24})$/
);

const [page, setPage] = useState(() => {
  if (sharedPollMatch) {
    return "public";
  }

  const token = localStorage.getItem("token");

  return token ? "dashboard" : "login";
});

const [selectedPollId, setSelectedPollId] = useState(
  sharedPollMatch ? sharedPollMatch[1] : ""
);

  const handleLogin = async (event) => {
  event.preventDefault();

  const email = event.currentTarget
    .querySelector("#email")
    .value
    .trim();

  const password = event.currentTarget
    .querySelector("#password")
    .value;

  try {
    const response = await fetch(
      "https://polling-app-3ko1.onrender.com/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Invalid email or password.");
      return;
    }

    localStorage.setItem("token", data.token);

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    setPage("dashboard");

  } catch (error) {
    console.error("Login error:", error);

    alert(
      "Unable to connect to the server."
    );
  }
};

  const handleCreatePoll = () => {
    setPage("create");
  };

  const handleCancelCreate = () => {
    setPage("dashboard");
  };

  const handleViewPoll = (pollId) => {
    setSelectedPollId(pollId);
    setPage("vote");
  };

  const handleViewResults = (pollId) => {
    setSelectedPollId(pollId);
    setPage("results");
  };

  if (page === "public") {
  return (
    <PublicPoll
      pollId={selectedPollId}
      onVoteSuccess={(pollId) => {
  setSelectedPollId(pollId);
  setPage("public-results");
}}
    />
  );
}

  if (page === "signup") {
  return (
    <Signup
      onSignupSuccess={() => setPage("login")}
      onBackToLogin={() => setPage("login")}
    />
  );
}

  if (page === "dashboard") {
  return (
    <Dashboard
      onCreatePoll={handleCreatePoll}
      onViewPoll={handleViewPoll}
      onViewResults={handleViewResults}
    />
  );
}

  if (page === "create") {
    return (
      <CreatePoll
        onCancel={handleCancelCreate}
      />
    );
  }

  if (page === "vote") {
  return (
    <VotePoll
      pollId={selectedPollId}
      onVoteSuccess={() => setPage("results")}
    />
  );
}
  if (page === "public-results") {
  return (
    <Results
      pollId={selectedPollId}
      showBackToDashboard={false}
    />
  );
}

  if (page === "results") {
  return (
    <Results
      pollId={selectedPollId}
      showBackToDashboard={true}
      onBackToDashboard={() => setPage("dashboard")}
    />
  );
}

return (
  <div className="login-page">

    <div className="login-layout">

      {/* LEFT SIDE - BRAND / HERO */}

      <section className="login-hero">

        <div className="hero-brand">
          <div className="brand-icon">
            P
          </div>

          <div>
            <h1>Pollify</h1>
            <p>Live polling platform</p>
          </div>
        </div>

        <div className="hero-content">

          <span className="hero-label">
            REAL-TIME POLLING
          </span>

          <h2>
            Ask questions.
            <br />
            Get answers.
            <br />
            <span>Live.</span>
          </h2>

          <p>
            Create engaging polls, share them with
            your audience, and watch responses appear
            in real time.
          </p>

          <div className="hero-features">

            <div className="hero-feature">
              <div className="feature-icon">
                +
              </div>

              <div>
                <strong>Create</strong>
                <span>
                  Build polls in seconds
                </span>
              </div>
            </div>

            <div className="hero-feature">
              <div className="feature-icon">
                ↗
              </div>

              <div>
                <strong>Share</strong>
                <span>
                  Send one simple link
                </span>
              </div>
            </div>

            <div className="hero-feature">
              <div className="feature-icon">
                ⚡
              </div>

              <div>
                <strong>Watch live</strong>
                <span>
                  See votes update instantly
                </span>
              </div>
            </div>

          </div>

        </div>

        <div className="hero-footer">
          <span className="hero-live-dot"></span>
          Live updates powered by Pollify
        </div>

      </section>

      {/* RIGHT SIDE - LOGIN */}

      <section className="login-panel">

        <div className="mobile-brand">

          <div className="brand-icon">
            P
          </div>

          <div>
            <h1>Pollify</h1>
            <p>Live polling platform</p>
          </div>

        </div>

        <form
          className="auth-card"
          onSubmit={handleLogin}
        >

          <div className="auth-header">

            <span className="login-label">
              WELCOME BACK
            </span>

            <h2>
              Sign in to Pollify
            </h2>

            <p>
              Login to create and manage your polls.
            </p>

          </div>

          <div className="input-group">

            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

          </div>

          <div className="input-group">

            <div className="password-label-row">
              <label htmlFor="password">
                Password
              </label>
            </div>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

          </div>

          <button
            type="submit"
            className="primary-button login-button"
          >
            Sign in
            <span>→</span>
          </button>

          <div className="auth-divider">
            <span>New to Pollify?</span>
          </div>

          <button
            type="button"
            className="signup-outline-button"
            onClick={() => setPage("signup")}
          >
            Create an account
          </button>

        </form>

        <div className="login-footer">

          <span>🔒</span>

          <p>
            Your account and polls are securely protected.
          </p>

        </div>

      </section>

    </div>

  </div>
);
}

export default App;