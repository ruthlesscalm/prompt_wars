import { useState } from "react";
import "./App.css";

const comparisonItems = [
  {
    title: "Built-in SOS is manual",
    sos: "Requires button combos, satellite activation, or conscious action in panic.",
    echo: "Runs as an always-on guardian that can trigger before the user reacts.",
  },
  {
    title: "Stress blocks action",
    sos: "If the user is frozen, followed, or incapacitated, manual SOS may never start.",
    echo: "Detects anomalies from ambient acoustic metadata and starts escalation paths.",
  },
  {
    title: "Context quality",
    sos: "Usually transmits location and emergency intent.",
    echo: "Sends contextual cause signals, for example crash-like signature plus location.",
  },
];

const safeguards = [
  "Edge processing with Web Audio API features, not cloud audio uploads.",
  "Volatile in-memory buffers that roll over every few seconds.",
  "Metadata-only payloads such as decibel band, threat type, and coordinates.",
  "Backend anonymization before model inference.",
  "Visible listening indicator to preserve transparency and user consent.",
];

function App() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [privacyLevel, setPrivacyLevel] = useState("level-1");
  const [formData, setFormData] = useState({
    decibel: "85",
    frequency: "high",
    lat: "12.9716",
    lng: "77.5946",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const runAnalysis = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decibel: Number(formData.decibel),
          frequency: formData.frequency,
          lat: Number(formData.lat),
          lng: Number(formData.lng),
          privacyLevel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Analysis request failed.");
      }

      setResult(data);
    } catch (requestError) {
      setError(requestError.message || "Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <header className="hero" aria-labelledby="hero-title">
        <div className="hero-badge">EchoGuard Intelligence Layer</div>
        <h1 id="hero-title">
          Built-in SOS is for when you find trouble. EchoGuard is for when
          trouble finds you.
        </h1>
        <p className="hero-copy">
          EchoGuard turns a phone from a passive emergency tool into a proactive
          safety sensor by continuously evaluating acoustic metadata and
          location context.
        </p>
        <div className="hero-meta" role="status" aria-live="polite">
          <span className="listening-dot" aria-hidden="true" />
          <span>Listening: metadata analysis active</span>
        </div>
      </header>

      <main className="layout-grid">
        <section className="panel" aria-labelledby="comparison-title">
          <h2 id="comparison-title">
            Why this exists even when iOS and Android have SOS
          </h2>
          <div className="comparison-grid">
            {comparisonItems.map((item) => (
              <article className="comparison-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>
                  <strong>SOS:</strong> {item.sos}
                </p>
                <p>
                  <strong>EchoGuard:</strong> {item.echo}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" aria-labelledby="privacy-title">
          <h2 id="privacy-title">Security and privacy architecture</h2>
          <ul className="safeguards-list">
            {safeguards.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="code-preview" aria-label="Metadata payload sample">
            <p className="code-title">
              Anonymized intelligence payload example
            </p>
            <pre>
              {`{
  "volume": 85,
  "type": "high-pitch-spike",
  "lat": 12.9,
  "lng": 77.5
}`}
            </pre>
          </div>
        </section>

        <section className="panel" aria-labelledby="toggle-title">
          <h2 id="toggle-title">Privacy Toggle in SafetyProfile</h2>
          <div
            className="toggle-row"
            role="radiogroup"
            aria-label="Privacy toggle"
          >
            <button
              type="button"
              className={
                privacyLevel === "level-1"
                  ? "toggle-pill active"
                  : "toggle-pill"
              }
              onClick={() => setPrivacyLevel("level-1")}
              aria-pressed={privacyLevel === "level-1"}
            >
              Level 1: Peak-only monitoring
            </button>
            <button
              type="button"
              className={
                privacyLevel === "level-2"
                  ? "toggle-pill active"
                  : "toggle-pill"
              }
              onClick={() => setPrivacyLevel("level-2")}
              aria-pressed={privacyLevel === "level-2"}
            >
              Level 2: Full signature analysis
            </button>
          </div>
          <p className="toggle-help">
            {privacyLevel === "level-1"
              ? "Highest privacy mode: monitor only decibel peaks and coarse risk spikes."
              : "Highest safety mode: evaluate broader acoustic signatures for targeted threat detection."}
          </p>
        </section>

        <section className="panel" aria-labelledby="demo-title">
          <h2 id="demo-title">Threat analysis demo</h2>
          <form className="demo-form" onSubmit={runAnalysis} noValidate>
            <label>
              Decibel
              <input
                type="number"
                name="decibel"
                value={formData.decibel}
                min="0"
                max="200"
                step="0.1"
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Frequency type
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="mid">Mid</option>
                <option value="high">High</option>
                <option value="ultra-high">Ultra-high</option>
              </select>
            </label>

            <label>
              Latitude
              <input
                type="number"
                name="lat"
                value={formData.lat}
                min="-90"
                max="90"
                step="0.0001"
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Longitude
              <input
                type="number"
                name="lng"
                value={formData.lng}
                min="-180"
                max="180"
                step="0.0001"
                onChange={handleChange}
                required
              />
            </label>

            <button className="primary-cta" type="submit" disabled={loading}>
              {loading ? "Analyzing..." : "Run analysis"}
            </button>
          </form>

          {error && <p className="status error">{error}</p>}

          {result && (
            <div
              className={result.threat ? "result threat" : "result safe"}
              aria-live="polite"
            >
              <p className="result-headline">
                {result.threat
                  ? "Threat pattern detected"
                  : "No immediate threat pattern"}
              </p>
              <p>{result.action || "No action recommendation returned."}</p>
              {result.incidentId && (
                <p className="incident-meta">
                  Incident ID: {result.incidentId}
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
