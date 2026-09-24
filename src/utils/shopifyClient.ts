export class ShopifyClient {
  private shopDomain: string;
  private accessToken: string;

  constructor(shopDomain: string, accessToken: string) {
    this.shopDomain = shopDomain;
    this.accessToken = accessToken;
  }

  // -----------------------------
  // GET helper
  // -----------------------------
  async get(path: string) {
    const url = `https://${this.shopDomain}/admin/api/2024-10${path}`;

    try {
      const response = await fetch(url, {
        headers: {
          "X-Shopify-Access-Token": this.accessToken,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Shopify GET ${path} failed: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("Shopify GET error:", err);
      throw err;
    }
  }

  // -----------------------------
  // POST helper
  // -----------------------------
  async post(path: string, body: any) {
    const url = `https://${this.shopDomain}/admin/api/2024-10${path}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": this.accessToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Shopify POST ${path} failed: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("Shopify POST error:", err);
      throw err;
    }
  }
}
