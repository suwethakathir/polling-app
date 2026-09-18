import { useState } from "react";

function Signup({ onSignupSuccess, onBackToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account.");
        return;
      }

      alert("Account created successfully!");

      if (onSignupSuccess) {
        onSignupSuccess();
      }

    } catch (error) {
      console.error("Signup error:", error);

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      <div className="auth-container">

        <div className="brand">
          <div className="brand-icon">
            P
          </div>

          <h1>Pollify</h1>

          <p>Live polling, made simple.</p>
        </div>

        <form
          className="auth-card"
          onSubmit={handleSubmit}
        >

          <div className="auth-header">

            <h2>Create your account</h2>

            <p>
              Sign up to create and manage your polls.
            </p>

          </div>

          <div className="input-group">

            <label htmlFor="signup-name">
              Name
            </label>

            <input
              id="signup-name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />

          </div>

          <div className="input-group">

            <label htmlFor="signup-email">
              Email
            </label>

            <input
              id="signup-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

          </div>

          <div className="input-group">

            <label htmlFor="signup-password">
              Password
            </label>

            <input
              id="signup-password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength="6"
              required
            />

          </div>

          {error && (
            <p
              style={{
                color: "#dc2626",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

          <div className="auth-switch">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              className="switch-button"
              onClick={onBackToLogin}
            >
              Login
            </button>

          </div>

        </form>

        <p className="footer-text">
          Create polls. Share them. Watch results update live.
        </p>

      </div>

    </div>
  );
}

export default Signup;