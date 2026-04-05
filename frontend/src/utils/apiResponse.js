export async function readApiResponse(res) {
  const raw = await res.text();

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {
      message: `${res.status} ${res.statusText}${raw ? `: ${raw.slice(0, 120)}` : ""}`,
    };
  }
}
