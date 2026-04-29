const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET || "mini-flow-secret";
const DB = "balances.json";

app.use(express.json({ limit: "2mb" }));

function load() {
  if (!fs.existsSync(DB)) return {};
  return JSON.parse(fs.readFileSync(DB, "utf8"));
}

function save(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2), "utf8");
}

app.get("/", (req, res) => {
  res.send("Avito Bridge работает");
});

app.post("/push", (req, res) => {
  if (req.headers["x-secret"] !== SECRET) {
    return res.status(403).json({ ok: false, error: "bad secret" });
  }

  const { avitoId, wallet, advance } = req.body;

  if (!avitoId) {
    return res.json({ ok: false, error: "no avitoId" });
  }

  const data = load();

  data[String(avitoId)] = {
    avitoId: String(avitoId),
    wallet,
    advance,
    updatedAt: new Date().toISOString()
  };

  save(data);

  res.json({ ok: true });
});

app.get("/balances", (req, res) => {
  if (req.query.secret !== SECRET) {
    return res.status(403).json({ ok: false, error: "bad secret" });
  }

  res.json({
    ok: true,
    balances: load()
  });
});

app.listen(PORT, () => {
  console.log("Avito Bridge запущен на порту " + PORT);
});
