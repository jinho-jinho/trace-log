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

export function getTraceLogSessionLogs(sessionId, { page = 0, size = 30 } = {}) {
  return fetchJson(`${TRACELOG_BASE}/sessions/${sessionId}/logs?page=${page}&size=${size}`);
}

export function getTraceLogNotifications() {
  return fetchJson(`${TRACELOG_BASE}/notifications`);
}

export function markAllTraceLogNotificationsRead() {
  return sendJson(`${TRACELOG_BASE}/notifications/read-all`, { method: "POST" });
}

export function markTraceLogNotificationRead(notificationId) {
  return sendJson(`${TRACELOG_BASE}/notifications/${notificationId}/read`, { method: "POST" });
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

export function formatScore(value, digits = 2) {
  return value == null ? "-" : Number(value).toFixed(digits);
}

export function formatRatio(value) {
  return value == null ? "-" : `${(Number(value) * 100).toFixed(1)}%`;
}

export function formatAiAnalysis(value) {
  return value?.trim() ? value : "분석 없음";
}

export function formatModelStatus(value) {
  if (!value) return "-";
  if (value === "READY") return "정상";
  if (value === "UNCONFIGURED") return "미설정";
  return value;
}

export function formatCount(value) {
  return value == null ? "-" : String(value);
}

export function formatMetricValue(value, suffix = "") {
  return value == null ? "-" : `${value}${suffix}`;
}

export function formatSummaryCards(header) {
  return [
    { label: "24시간 이내 평균 이상 점수", value: header ? formatScore(header.averageAnomalyScore) : "-" },
    { label: "24시간 이내 이상 세션 수", value: header ? formatCount(header.anomalySessionCount) : "-" },
    { label: "24시간 이내 이상 세션 비율", value: header ? formatRatio(header.anomalySessionRatio) : "-" },
    { label: "24시간 이내 이상 IP 수", value: header ? formatCount(header.anomalyIpCount) : "-" },
    { label: "모델 상태", value: header ? formatModelStatus(header.modelStatus) : "-" },
  ];
}

export function buildTrendSeries(scoreTrend, range) {
  const labels = scoreTrend.map((point) => formatTrendLabel(point.bucketStart, range));
  const values = scoreTrend.map((point) => Number(point.averageAnomalyScore ?? 0));
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
