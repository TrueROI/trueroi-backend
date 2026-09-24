"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyClient = void 0;
class ShopifyClient {
    constructor(shopDomain, accessToken) {
        this.shopDomain = shopDomain;
        this.accessToken = accessToken;
    }
    // -----------------------------
    // GET helper
    // -----------------------------
    async get(path) {
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
        }
        catch (err) {
            console.error("Shopify GET error:", err);
            throw err;
        }
    }
    // -----------------------------
    // POST helper
    // -----------------------------
    async post(path, body) {
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
        }
        catch (err) {
            console.error("Shopify POST error:", err);
            throw err;
        }
    }
}
exports.ShopifyClient = ShopifyClient;
