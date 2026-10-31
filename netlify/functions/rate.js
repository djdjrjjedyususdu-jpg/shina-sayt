// Netlify Function: Markaziy bankdan dollar kursini oladi (brauzer CORS muammosisiz).
exports.handler = async () => {
  try {
    const r = await fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/");
    const a = await r.json();
    const rate = parseFloat(a[0].Rate);
    if (!(rate > 1000)) throw new Error("bad");
    return { statusCode: 200, headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=1800" }, body: JSON.stringify({ rate }) };
  } catch (e) {
    return { statusCode: 502, body: "{}" };
  }
};
