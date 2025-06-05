const axios = require('axios');
const cheerio = require('cheerio');

async function getLatestAdaNews() {
    try {
        const { data } = await axios.get('https://sinhala.adaderana.lk');
        const $ = cheerio.load(data);

        const firstNews = $('.main-news-block .news-title a').first();
        const title = firstNews.text().trim();
        const link = "https://sinhala.adaderana.lk" + firstNews.attr('href');

        const articlePage = await axios.get(link);
        const $$ = cheerio.load(articlePage.data);
        const content = $$('.article-content p').first().text().trim();
        const date = $$('.article-date').text().trim();

        return { title, content, date };
    } catch (err) {
        console.error("Adaderana Scraper Error:", err.message);
        return null;
    }
}

module.exports = { getLatestAdaNews };
