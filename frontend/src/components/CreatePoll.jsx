import { useState } from "react";

function CreatePoll({ onCancel }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(
        options.filter((_, optionIndex) => optionIndex !== index)
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanedQuestion = question.trim();

    const cleanedOptions = options.map((option) =>
      option.trim()
    );

    if (!cleanedQuestion) {
      alert("Please enter a poll question.");
      return;
    }

    if (
      cleanedOptions.length < 2 ||
      cleanedOptions.length > 6
    ) {
      alert("A poll must have between 2 and 6 options.");
      return;
    }

    if (cleanedOptions.some((option) => option === "")) {
      alert("Please fill in all options.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before creating a poll.");
      return;
    }

    try {
      const response = await fetch(
        "https://polling-app-3ko1.onrender.com/api/polls",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            question: cleanedQuestion,
            options: cleanedOptions,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create poll.");
        return;
      }

      console.log("Poll created:", data);

      alert("Poll created successfully!");

      if (typeof onCancel === "function") {
        onCancel();
      }
    } catch (error) {
      console.error("Create poll error:", error);

      alert("Unable to connect to the backend server.");
    }
  };

  return (
    <div className="create-poll-page">

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

        <button
          type="button"
          className="logout-button"
          onClick={onCancel}
        >
          Cancel
        </button>

      </header>

      {/* MAIN */}

      <main className="create-poll-content">

        {/* PAGE INTRO */}

        <div className="create-poll-title">

          <div className="create-page-label">
            CREATE A POLL
          </div>

          <h2>
            Ask your audience something.
          </h2>

          <p>
            Create a question, add your answer options,
            and share your poll with your audience.
          </p>

        </div>

        {/* FORM */}

        <form
          className="poll-form"
          onSubmit={handleSubmit}
        >

          {/* QUESTION */}

          <div className="form-section create-section">

            <div className="section-number">
              01
            </div>

            <div className="create-section-content">

              <div className="form-section-heading">

                <div>
                  <label htmlFor="question">
                    Your question
                  </label>

                  <p>
                    Ask something clear and easy to answer.
                  </p>
                </div>

                <span className="required-badge">
                  Required
                </span>

              </div>

              <textarea
                id="question"
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                placeholder="e.g. Which technology do you like most?"
                rows="4"
                required
              />

              <div className="field-hint">
                💡 Keep your question short and specific
                for better responses.
              </div>

            </div>

          </div>

          {/* OPTIONS */}

          <div className="form-section create-section">

            <div className="section-number">
              02
            </div>

            <div className="create-section-content">

              <div className="form-section-heading">

                <div>
                  <label>
                    Answer options
                  </label>

                  <p>
                    Give your audience between 2 and 6 choices.
                  </p>
                </div>

                <span className="option-counter">
                  {options.length}
                  <small>/6</small>
                </span>

              </div>

              <div className="options-list">

                {options.map((option, index) => (

                  <div
                    className="option-input-row"
                    key={index}
                  >

                    <div className="option-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <input
                      type="text"
                      value={option}
                      onChange={(event) =>
                        handleOptionChange(
                          index,
                          event.target.value
                        )
                      }
                      placeholder={`Option ${index + 1}`}
                      required
                    />

                    {options.length > 2 && (

                      <button
                        type="button"
                        className="remove-option"
                        onClick={() =>
                          removeOption(index)
                        }
                        aria-label={`Remove option ${index + 1}`}
                      >
                        ×
                      </button>

                    )}

                  </div>

                ))}

              </div>

              <div className="options-bottom">

                <button
                  type="button"
                  className="add-option-button"
                  onClick={addOption}
                  disabled={options.length >= 6}
                >
                  <span>+</span>
                  Add another option
                </button>

                <span className="options-limit">
                  {options.length >= 6
                    ? "Maximum reached"
                    : `${6 - options.length} more available`}
                </span>

              </div>

            </div>

          </div>

          {/* LIVE INFO */}

          <div className="create-info-card">

            <div className="create-info-icon">
              ⚡
            </div>

            <div>
              <strong>
                Built for live responses
              </strong>

              <p>
                Once your poll is created, share the
                link and watch results update in real time.
              </p>
            </div>

          </div>

          {/* ACTIONS */}

          <div className="poll-form-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button create-button"
            >
              Create Poll
              <span>→</span>
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default CreatePoll;