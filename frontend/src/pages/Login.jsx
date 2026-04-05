import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { readApiResponse } from "../utils/apiResponse.js";

const copy = {
  eyebrow: "MEMBERSHIP",
  heroTitle: "\ucde8\ud5a5\uacfc \uae30\ub85d\uc774 \uc774\uc5b4\uc9c0\ub294 \ub85c\uadf8\uc778",
  heroBody:
    "\ub85c\uadf8\uc778\ud558\uace0 \uc7a5\ubc14\uad6c\ub2c8, \uc8fc\ubb38 \ub0b4\uc5ed, \uac1c\uc778\ud654 \ucd94\ucc9c\uc744 \ub04a\uae40 \uc5c6\uc774 \uc774\uc5b4\ubcf4\uc138\uc694.",
  badge: "WELCOME BACK",
  title: "\ub85c\uadf8\uc778",
  subtitle:
    "\uc774\uba54\uc77c\uacfc \ube44\ubc00\ubc88\ud638\ub97c \uc785\ub825\ud574 \uacc4\uc815\uc5d0 \uc811\uc18d\ud558\uc138\uc694.",
  email: "\uc774\uba54\uc77c \uc8fc\uc18c",
  password: "\ube44\ubc00\ubc88\ud638",
  passwordPlaceholder: "\ube44\ubc00\ubc88\ud638\ub97c \uc785\ub825\ud558\uc138\uc694",
  submit: "\ub85c\uadf8\uc778",
  submitting: "\ub85c\uadf8\uc778 \uc911...",
  loginFail: "\ub85c\uadf8\uc778\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.",
  loginSuccess: "\ub85c\uadf8\uc778\uc5d0 \uc131\uacf5\ud588\uc2b5\ub2c8\ub2e4.",
};

const loginHighlights = [
  {
    label: "\ube60\ub978 \uc8fc\ubb38 \uc870\ud68c",
    value: "\uc8fc\ubb38 \uc0c1\ud0dc\uc640 \ubc30\uc1a1 \ud750\ub984\uc744 \ud55c \ubc88\uc5d0 \ud655\uc778",
  },
  {
    label: "\ud68c\uc6d0 \uc804\uc6a9 \ud61c\ud0dd",
    value: "\ud560\uc778 \uc18c\uc2dd\uacfc \ub9de\ucda4 \ucd94\ucc9c\uc744 \uba3c\uc800 \ud655\uc778",
  },
  {
    label: "\uac04\ud3b8\ud55c \uc7ac\uad6c\ub9e4",
    value:
      "\ucd5c\uadfc \ubcf8 \uc0c1\ud488\uacfc \uc7a5\ubc14\uad6c\ub2c8\ub97c \uadf8\ub300\ub85c \uc774\uc5b4\uc11c \uc1fc\ud551",
  },
];

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await readApiResponse(res);

      if (!res.ok) throw new Error(data.message || copy.loginFail);

      setStatus({
        type: "success",
        message: data.message || copy.loginSuccess,
      });

      if (data.user?.role === "admin") {
        navigate("/admin/select", { replace: true });
      }
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-page">
      <div className="login-shell">
        <div className="login-hero">
          <p className="login-eyebrow">{copy.eyebrow}</p>
          <h1 className="login-title">{copy.heroTitle}</h1>
          <p className="login-copy">{copy.heroBody}</p>

          <div className="login-highlight-list">
            {loginHighlights.map((item) => (
              <div key={item.label} className="login-highlight-card">
                <strong>{item.label}</strong>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="login-panel">
          <div className="login-panel-head">
            <span className="login-badge">{copy.badge}</span>
            <h2>{copy.title}</h2>
            <p>{copy.subtitle}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span>{copy.email}</span>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label className="login-field">
              <span>{copy.password}</span>
              <input
                type="password"
                placeholder={copy.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? copy.submitting : copy.submit}
            </button>

            {status && (
              <div className={`login-status ${status.type}`}>{status.message}</div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;
