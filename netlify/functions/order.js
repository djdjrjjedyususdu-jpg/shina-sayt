// Netlify Function: buyurtmani Telegram botga yuboradi.
// BOT_TOKEN va CHAT_ID Netlify "Environment variables" bo'limida saqlanadi (kodga yozilmaydi).
exports.handler = async (event) => {
  const json = (code, obj) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });
  if (event.httpMethod !== "POST") return json(405, { ok: false });
  const token = process.env.BOT_TOKEN, chat = process.env.CHAT_ID;
  if (!token || !chat) return json(500, { ok: false, error: "config" });
  if ((event.body || "").length > 20000) return json(413, { ok: false });
  let d;
  try { d = JSON.parse(event.body || "{}"); } catch (e) { return json(400, { ok: false }); }
  if (d.hp) return json(200, { ok: true }); // spam tuzoq
  const cl = (v, n) => String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").slice(0, n).trim();
  const name = cl(d.name, 60), phone = cl(d.phone, 30);
  const items = Array.isArray(d.items) ? d.items.slice(0, 30) : [];
  if (!name || phone.replace(/\D/g, "").length < 9 || !items.length) return json(400, { ok: false });
  let total = 0;
  const lines = items.map((x) => {
    const q = Math.min(Math.max(parseInt(x.q, 10) || 1, 1), 99);
    const p = Math.max(Number(x.p) || 0, 0);
    total += q * p;
    return "• " + cl(x.n, 60) + " " + cl(x.s, 20) + " × " + q;
  });
  const text = [
    "🛞 Yangi buyurtma", "", ...lines, "",
    "Jami: " + total.toLocaleString("ru-RU") + " so'm",
    "To'lov: " + cl(d.pay, 20),
    "Ism: " + name,
    "Tel: " + phone,
    "Viloyat: " + cl(d.region, 40),
    "Manzil: " + cl(d.addr, 150),
  ].join("\n");
  try {
    const r = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
    });
    return r.ok ? json(200, { ok: true }) : json(502, { ok: false });
  } catch (e) {
    return json(502, { ok: false });
  }
};
