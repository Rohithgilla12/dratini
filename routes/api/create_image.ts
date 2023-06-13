import { Handlers } from "$fresh/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

// Example query: /api/create_image?query=cat
export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const query = url.searchParams.get("query");
    if (!query) return new Response(null, { status: 400 });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=${query}`);
    await page.waitForSelector("img");
    const image = await page.$("img");
    const src = await image?.evaluate((node: any) => node.getAttribute("src"));
    await browser.close();

    if (!src) return new Response(null, { status: 404 });

    const res = await fetch(src);
    const body = await res.arrayBuffer();
    return new Response(body, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  },
};
