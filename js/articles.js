const _create_article = () => {
    let articles_info = null;
    let loaded = false;

    const load_articles = async () => {
        if (loaded) {
            return;
        }
        const res = await fetch('/articles.json');
        articles_info = await res.json();
    };

    const get_articles = async () => {
        await load_articles();
        let articles = [];
        articles_info.articles.forEach(element => {
            articles.push(element.name);
        });
        return articles;
    };

    const load_article = async (id) => {
        await load_articles();
        const response = await fetch(`${articles_info.article_dir}/${articles_info.articles[id].file}`)
        const text = await response.text()
        return text;
    }

    return { load_articles, get_articles, load_article };
}

const article = _create_article();
export { article as default };
