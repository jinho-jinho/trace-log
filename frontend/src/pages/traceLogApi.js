import { readApiResponse } from "../utils/apiResponse.js";

const TRACELOG_BASE = "/api/admin/tracelog";

async function fetchJson(path) {
  const res = await fetch(path, { credentials: "include" });
  const data = await readApiResponse(res);

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
}

async function sendJson(path, options = {}) {
  const res = await fetch(path, { credentials: "include", ...options });
  const data = await readApiResponse(res);

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
}

export function verifyAdminSession(navigate) {
  return async function run() {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await readApiResponse(res);

      if (!res.ok || !data.user || data.user.role !== "admin") {
        navigate("/login", { replace: true });
        return false;
      }

      return true;
    } catch {
      navigate("/login", { replace: true });
      return false;
    }
  };
}

export function getTraceLogDashboard(range = "24h") {
  return fetchJson(`${TRACELOG_BASE}/dashboard?range=${encodeURIComponent(range)}`);
}

export function getTraceLogSessions({ startAt = "", endAt = "", ip = "", sort = "latest" } = {}) {
  const params = new URLSearchParams();

  if (startAt) params.set("startAt", new Date(startAt).toISOString().slice(0, 19));
  if (endAt) params.set("endAt", new Date(endAt).toISOString().slice(0, 19));
  if (ip.trim()) params.set("ip", ip.trim());
  if (sort) params.set("sort", sort);

  return fetchJson(`${TRACELOG_BASE}/sessions?${params.toString()}`);
}

export function getTraceLogSessionDetail(sessionId) {
  return fetchJson(`${TRACELOG_BASE}/sessions/${sessionId}`);
}

export function analyzeTraceLogSessionWithLlm(sessionId) {
  return sendJson(`${TRACELOG_BASE}/sessions/${sessionId}/llm-analysis`, { method: "POST" });
}

export function getTraceLogSessionLogs(sessionId, { page = 0, size = 30 } = {}) {
  return fetchJson(`${TRACELOG_BASE}/sessions/${sessionId}/logs?page=${page}&size=${size}`);
}




export function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi}:${ss}`;
}

export function formatDateTimeMultiline(value) {
  return formatDateTime(value).replace(" ", "\n");
}

export function formatTimeOnly(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${hh}:${mi}:${ss}`;
}

export function toDateTimeLocalValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function formatScore(value, digits = 4) {
  return value == null ? "-" : Number(value).toFixed(digits);
}

export function formatModelLabel(value) {
  if (value === "Normal") return "정상";
  if (value === "Anomalous") return "이상";
  return "미판정";
}

export function formatReferenceLimit(value) {
  if (value == null) return "";
  const percentile = Number((Number(value) * 100).toFixed(4));
  return "P" + percentile + " 초과";
}

export function formatReferenceScore(value, exceededPercentile) {
  const referenceLimit = formatReferenceLimit(exceededPercentile);
  return referenceLimit ? formatScore(value) + " · " + referenceLimit : formatScore(value);
}


export function formatAiAnalysis(value) {
  const text = value?.trim();
  if (!text) return "분석 없음";

  try {
    const parsed = JSON.parse(text);
    const type = parsed.attack_type || "Unknown";
    const summary = parsed.summary || "";
    return summary ? `${type} · ${summary}` : type;
  } catch {
    return text;
  }
}

export function formatAiAnalysisTitle(value) {
  const text = value?.trim();
  if (!text) return "분석 없음";

  try {
    const parsed = JSON.parse(text);
    const parts = [];
    if (parsed.attack_type) parts.push(`유형: ${parsed.attack_type}`);
    if (parsed.confidence) parts.push(`신뢰도: ${parsed.confidence}`);
    if (parsed.summary) parts.push(`요약: ${parsed.summary}`);
    return parts.length ? parts.join("\n") : text;
  } catch {
    return text;
  }
}


export function formatCount(value) {
  return value == null ? "-" : String(value);
}

export function formatMetricValue(value, suffix = "") {
  return value == null ? "-" : `${value}${suffix}`;
}

export function formatSummaryCards(header) {
  return [
    { label: "24시간 평균 백분위", value: formatScore(header?.averageAnomalyScore) },
    { label: "24시간 분석 세션 수", value: formatCount(header?.analyzedSessionCount) },
    { label: "24시간 분석 IP 수", value: formatCount(header?.analyzedIpCount) },
  ];
}

export function buildTrendSeries(scoreTrend, range) {
  const labels = scoreTrend.map((point) => formatTrendLabel(point.bucketStart, range));
  const values = scoreTrend.map((point) => point.averageAnomalyScore ?? null);
  return { labels, values };
}

function formatTrendLabel(value, range) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return range === "7d" ? `${mm}-${dd}` : `${hh}:${mi}`;
}

export function truncateText(value, maxLength = 72) {
  const text = value || "분석 없음";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}
