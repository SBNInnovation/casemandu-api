const asyncHandler = require("express-async-handler");
const { createApi } = require("unsplash-js");

const access = "m5MjajmtGeyxLCtwa__1Qc2MZr0We3V1O8ZO0x52Xjg";
const unsplash = createApi({
  accessKey: access,
});

// --- HELPER FUNCTION to format API response ---
// We'll reformat the data from Unsplash to look clean and simple.
const formatImageData = (photos) => {
  if (!photos || photos.length === 0) {
    return [];
  }
  return photos.map((photo) => ({
    id: photo.id,
    description: photo.alt_description || "No description available.",
    // We provide different image sizes for flexibility in your frontend.
    urls: {
      raw: photo.urls.raw,
      full: photo.urls.full,
      regular: photo.urls.regular,
      small: photo.urls.small,
      thumb: photo.urls.thumb,
    },
    user: {
      name: photo.user.name,
      portfolio_url: photo.user.portfolio_url,
    },
    // This is a direct link to the photo page on Unsplash.
    source_url: photo.links.html,
  }));
};

// desc:    Get all banners
// route:   GET /api/banners
// access:  public

const getPinterest = asyncHandler(async (req, res) => {
  // Pinterest search requires a query, so we use a generic term for the "all" route.
  const defaultQuery = "Anime wallpaper";
  try {
    // Use the unsplash-js SDK to get a list of photos
    const randomPage = Math.floor(Math.random() * 10) + 1; // Random page number for variety
    try {
      const result = await unsplash.search.getPhotos({
        page: randomPage,
        perPage: 20,
        orderBy: "popular",
        query: defaultQuery,
        orientation: "portrait",
      });
      if (result.errors) {
        // Handle API errors from the SDK
        console.error("Error from Unsplash API:", result.errors);
        console.error("Access Key:", access);
        res.status(500).json({
          message: "Failed to fetch photos.",
          errors: result.errors,
          accessKey: access,
        });
      } else {
        const formattedPhotos = formatImageData(result.response.results);
        res.json(formattedPhotos);
      }
    } catch (error) {
      console.error("Error fetching photos from Unsplash:", error);
      return res.status(500).json({
        message: "Failed to fetch photos from Unsplash.",
        error: error.message,
        secret: access,
      });
    }
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({
      message: "An unexpected server error occurred.",
      error: error.message,
    });
  }
});

const getPinByQuery = asyncHandler(async (req, res) => {
  let query = req.params.query || "Anime Art";
  const isFromSearch = query.includes("isFromSearch");

  // If the query is from a search, we remove the "isFromSearch" part
  if (isFromSearch) {
    query = query.replace("isFromSearch", "").trim();
  }
  if (!query) {
    console.log("No valid query found.");
    return res.status(400).json({ message: "Query parameter is required." });
  }

  try {
    const randomPage = Math.floor(Math.random() * 10) + 1; // Random page number for variety
    console.log(
      `Fetching photos for query: ${query} (from search: ${isFromSearch}) on page ${randomPage}`
    );

    const result = await unsplash.search.getPhotos({
      query: query,
      page: isFromSearch ? 1 : randomPage, // Use page 1 if from search, else random
      perPage: 20,
      orderBy: "popular",
      orientation: "portrait",
    });

    if (result.errors) {
      console.error("Error from Unsplash API:", result.errors);
      res.status(500).json({
        message: "Failed to fetch photos.",
        errors: result.errors,
      });
    } else {
      const formattedPhotos = formatImageData(result.response.results);
      res.json(formattedPhotos);
    }
  } catch (error) {
    console.error("Error fetching photos from Unsplash:", error);
    res.status(500).json({
      message: "Failed to fetch photos from Unsplash.",
      error: error.message,
    });
  }
});

module.exports = {
  getPinterest,
  getPinByQuery,
};
