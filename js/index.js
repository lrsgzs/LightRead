import { marked } from 'https://fastly.jsdelivr.net/npm/marked/lib/marked.esm.js';
// import purify from './purify.es.mjs';
// import highlight from './highlight.js';
import article from './articles.js';

const container = document.getElementById('container');
const time_container = document.getElementById('time-container');
const articles = await article.get_articles();
const articles_count = articles.length;
const article_content = await article.load_article(1);  // for debugging only
container.innerHTML = marked.parse(article_content);

setInterval(() => {
    const date = new Date();
    time_container.innerHTML = `${date.getHours()}:${date.getMinutes()}`;
}, 100)