import express from "express";
import MiniStore from "../models/miniStoreModel.js";

const router = express.Router();

// Reserved words for the slug so that mini store URLs don't collide
// with existing site routes (e.g. /about, /cart, etc.). Slugs are
// compared in lower case.
const RESERVED = new Set([
  "",
  "home",
  "about",
  "contact",
  "collection",
  "collections",
  "cart",
  "checkout",
  "privacy-policy",
  "terms",
  "return-refund",
  "faqs",
  "login",
  "signup",
  "admin",
  "api",
  "sitemap.xml",
  "robots.txt",
  "search",
  "account",
  "orders",
  "product",
]);

/**
 * Create a mini store.
 * Expects slug and displayName in the request body. The slug is sanitized
 * to lower case and validated against reserved words and existing stores.
 */
router.post("/", async (req, res) => {
  try {
    let { slug, displayName } = req.body;
    // Ensure a display name is provided; slug can be optional
    if (!displayName) {
      return res.status(400).json({ message: "displayName required" });
    }
    displayName = String(displayName).trim();
    // If slug is not provided or blank, generate one from displayName
    let clean = (slug && String(slug).trim().toLowerCase()) || '';
    const makeSlug = (text) => {
      return text
        .toLowerCase()
        // replace non-alphanumeric characters with hyphens
        .replace(/[^a-z0-9]+/g, '-')
        // remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '')
        // collapse multiple hyphens
        .replace(/-+/g, '-');
    };
    if (!clean) {
      clean = makeSlug(displayName);
    } else {
      clean = makeSlug(clean);
    }
    // If generated slug is reserved or blank, prefix with 'store-' and current timestamp
    if (!clean || RESERVED.has(clean)) {
      clean = `store-${Date.now()}`;
    }
    // Ensure uniqueness by appending a suffix if slug already exists
    let uniqueSlug = clean;
    let suffix = 1;
    while (await MiniStore.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${clean}-${suffix++}`;
    }
    // Build store payload; prefer provided fields but override slug
    const payload = { ...req.body, slug: uniqueSlug, displayName };
    const store = await MiniStore.create(payload);
    res.status(201).json(store);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * List mini stores. Accepts optional query params:
 *  - limit: maximum number of stores to return (default 8)
 *  - all: if truthy, return all active stores, ignoring limit
 * Returns only stores that are active (isActive: true). To fetch
 * inactive stores, a separate admin route could be added.
 */
router.get("/", async (req, res) => {
  try {
    const { all, limit } = req.query;
    const queryLimit = all ? 0 : Number(limit) || 8;
    const storesQuery = MiniStore.find({ isActive: true })
      .select("slug displayName avatarUrl bannerUrl bio isActive createdAt")
      .sort({ createdAt: -1 });
    if (queryLimit > 0) storesQuery.limit(queryLimit);
    const stores = await storesQuery.lean();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Fetch a store by slug. Only returns stores that are active.
 */
router.get("/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug).toLowerCase();
    if (RESERVED.has(slug)) {
      return res.status(404).json({ message: "Not a mini store" });
    }
    const store = await MiniStore.findOne({ slug, isActive: true }).populate("products");
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Toggle a mini store's active status. Flips `isActive` between true and false.
 */
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const store = await MiniStore.findById(id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    store.isActive = !store.isActive;
    await store.save();
    res.json({ success: true, isActive: store.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Delete a mini store permanently.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const store = await MiniStore.findById(id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    await MiniStore.findByIdAndDelete(id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;