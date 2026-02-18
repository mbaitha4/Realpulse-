module.exports = async function handler(req, res) {
  try {
    const { category = "general", lang = "en" } = req.query;

    const response = await fetch(
      `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&country=in&max=10&apikey=${process.env.GNEWS_API_KEY}`
    );

    const data = await response.json();

    if (!data.articles) {
      return res.status(200).json({ articles: [] });
    }

    return res.status(200).json({
      articles: data.articles
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};
