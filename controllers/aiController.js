const asyncHandler = require("express-async-handler");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyDpk81xZG2lOuchrvrhkH4rVmKE8rpy3tM");

// desc:    Get all banners
// route:   GET /api/banners
// access:  public

const faqs = [
  {
    question: "is the case waterproof",
    answer:
      "Yes, most of our cases are water-resistant, but not fully waterproof.",
  },
  {
    question: "is the case shockproof",
    answer: "Yes, our cases offer shock absorption for drops up to 6 feet.",
  },
  {
    question: "what materials are used",
    answer: "Our cases use TPU, polycarbonate, and sometimes vegan leather.",
  },
  {
    question: "is wireless charging supported",
    answer: "Yes, all our cases support wireless charging.",
  },
  {
    question: "do you offer a warranty",
    answer: "Yes, we offer a 1-year warranty on all our cases.",
  },
  {
    question: "can i return the case",
    answer: "Yes, you can return it within 30 days for a full refund.",
  },
  {
    question: "is the case compatible with screen protectors",
    answer: "Yes, our cases are designed to work with most screen protectors.",
  },
  {
    question: "how do i clean the case",
    answer: "Use a damp cloth and mild soap to clean your case.",
  },
];

const getAnswer = asyncHandler(async (req, res) => {
  //here's the ai code
  const userQuery = req.params.query?.toLowerCase();
  if (!userQuery) return res.status(400).json({ error: "Query is required" });

  // Step 1: Try local match
  try {
    const matchedFaq = faqs.find((faq) => userQuery.includes(faq.question));

    if (matchedFaq) {
      return res.json({ source: "local", answer: matchedFaq.answer });
    }

    // Step 2: Use Gemini only if no local match
    try {
      const aiAnswer = await getGeminiAnswer(userQuery);
      return res.json({ source: "gemini", answer: aiAnswer });
    } catch (err) {
      console.error("Gemini API error:", err.message);
      return res.status(500).json({ error: "AI service unavailable" });
    }
  } catch (error) {
    console.error("Error processing query:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// geminiService.js

const getGeminiAnswer = async (query) => {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": "AIzaSyDpk81xZG2lOuchrvrhkH4rVmKE8rpy3tM",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Answer the following question: ${query}. If you don't know the answer, say "I don't know".`,
              },
            ],
          },
        ],
      }),
    }
  );
  const data = await res.json();
  if (!data || !data.candidates || data.candidates.length === 0) {
    throw new Error("No response from Gemini");
  }
  return data.candidates[0].content.parts[0].text;
};

module.exports = { getAnswer, getGeminiAnswer };
