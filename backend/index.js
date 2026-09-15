const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.get("/shopify/install", (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send("Missing shop parameter");

  const clientId = process.env.SHOPIFY_API_KEY;
  const redirectUri = "https://trueroi-backend-production.up.railway.app/shopify/callback";

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
});

app.get("/shopify/callback", async (req, res) => {
  const { shop, code } = req.query;

  if (!shop || !code) return res.status(400).send("Missing parameters");

  const clientId = process.env.SHOPIFY_API_KEY;
  const clientSecret = process.env.SHOPIFY_API_SECRET;

  const tokenUrl = `https://${shop}/admin/oauth/access_token`;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code
    })
  });

  const data = await response.json();

  const accessToken = data.access_token;

  res.send("App installed successfully");
});
