import { useEffect, useState } from "react";

function VotePoll({ pollId, onVoteSuccess }) {
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(
          `https://polling-app-3ko1.onrender.com/api/polls/${pollId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load poll"
          );
        }

        setPoll(data.poll);
      } catch (error) {
        console.error("Fetch poll error:", error);
        setError("Unable to load this poll.");
      } finally {
        setLoading(false);
      }
    };

    if (pollId) {
      fetchPoll();
    } else {
      setError("Poll ID is missing.");
      setLoading(false);
    }
  }, [pollId]);

  const handleSubmit = async (event) => {
  event.preventDefault();

  if (!selectedOption) {
    return;
  }

  try {
    const response = await fetch(
      `https://polling-app-3ko1.onrender.com/api/polls/${pollId}/vote`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          optionId: selectedOption,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to submit vote.");
      return;
    }

    console.log("Vote successful:", data);

    alert("Vote submitted successfully!");

    if (onVoteSuccess) {
      onVoteSuccess();
    }

  } catch (error) {
    console.error("Vote error:", error);

    alert(
      "Unable to connect to the backend server."
    );
  }
};

  if (loading) {
    return (
      <div className="vote-page">
        <div className="vote-container">
          <div className="vote-card">
            <div className="vote-header">
              <h2>Loading poll...</h2>
              <p>
                Fetching the poll from the server.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vote-page">
        <div className="vote-container">
          <div className="vote-card">
            <div className="vote-header">
              <span className="live-badge">
                ● Live Poll
              </span>

              <h2>Poll unavailable</h2>

              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vote-page">
      <div className="vote-container">

        <div className="vote-brand">
          <div className="brand-icon small">
            P
          </div>

          <div>
            <h1>Pollify</h1>
            <p>Live polling platform</p>
          </div>
        </div>

        <div className="vote-card">

          <div className="vote-header">

            <span className="live-badge">
              ● Live Poll
            </span>

            <h2>{poll.question}</h2>

            <p>
              Select one option and submit your vote.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="vote-options">

              {poll.options.map((option) => (
                <label
                  className={`vote-option ${
                    selectedOption === option.id
                      ? "selected"
                      : ""
                  }`}
                  key={option.id}
                >

                  <input
                    type="radio"
                    name="poll-option"
                    value={option.id}
                    checked={
                      selectedOption === option.id
                    }
                    onChange={(event) =>
                      setSelectedOption(
                        event.target.value
                      )
                    }
                  />

                  <span className="radio-circle"></span>

                  <span className="vote-option-text">
                    {option.text}
                  </span>

                </label>
              ))}

            </div>

            <button
              type="submit"
              className="primary-button vote-button"
              disabled={!selectedOption}
            >
              Submit Vote
            </button>

          </form>

          <div className="vote-footer">
            Your vote will be recorded securely.
          </div>

        </div>

      </div>
    </div>
  );
}

export default VotePoll;