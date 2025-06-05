const axios = require('axios');
const cheerio = require('cheerio');

async function getLatestLankaCNews() {
    try {
        const { data } = await axios.get('https://lankacnews.com');
        const $ = cheerio.load(data);

        const firstPost = $('.jeg_postblock_1 .jeg_post').first();
        const title = firstPost.find('.jeg_post_title a').text().trim();
        const link = firstPost.find('.jeg_post_title a').attr('href');

        const contentPage = await axios.get(link);
        const $$ = cheerio.load(contentPage.data);
        const content = $$('.entry-content p').first().text().trim();
        const date = $$('.jeg_meta_date').text().trim() || new Date().toLocaleString();

        return { title, content, date };
    } catch (err) {
        console.error("LankaCNews Scraper Error:", err.message);
        return null;
    }
}

module.exports = { getLatestLankaCNews };
