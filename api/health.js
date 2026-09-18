// api/health.ts
function handler(req, res) {
  if (res && typeof res.setHeader === "function") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") {
    if (res && typeof res.status === "function") {
      return res.status(200).end();
    }
    return new Response(null, { status: 200 });
  }
  const payload = { status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString(), platform: "vercel" };
  if (res && typeof res.status === "function") {
    return res.status(200).json(payload);
  }
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
export {
  handler as default
};
