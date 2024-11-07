import { marked } from "https://fastly.jsdelivr.net/npm/marked/lib/marked.esm.js";
import hljs from "https://fastly.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/highlight.min.js";
import DOMPurify from "https://fastly.jsdelivr.net/npm/dompurify@3.1.7/dist/purify.es.mjs";
import article from "./articles.js";

const purify = DOMPurify(window);

const articles = await article.get_articles();
const articles_count = articles.length;

const load_article = async index => {
    const article_content = await article.load_article(index);
    const container = document.getElementById("container");
    container.innerHTML = purify.sanitize(marked.parse(article_content));

    const article_title_container = document.getElementById("article-title");
    article_title_container.innerHTML = `<span class="font-size-20px">Article: </span>${articles[index]}`;

    hljs.highlightAll();
    await MathJax.typesetPromise();

    const codeBlocks = document.querySelectorAll("code");
    codeBlocks.forEach(codeBlock => {
        if (codeBlock.parentElement.tagName !== "PRE") {
            return;
        }

        let btn_container = document.createElement("div");
        btn_container.className = "display-flex";

        let language_tag = document.createElement("span");
        language_tag.className = "language-tag mr-auto";
        language_tag.innerText = codeBlock.className
            .replace(" hljs", "")
            .replace("language-", "");
        btn_container.appendChild(language_tag);

        let copyButton = document.createElement("button");
        copyButton.className = "btn btn-sm btn-outline-secondary";
        copyButton.innerText = "Copy code";
        btn_container.appendChild(copyButton);

        codeBlock.insertBefore(btn_container, codeBlock.firstChild);

        copyButton.addEventListener("click", () => {
            const code = codeBlock.textContent;
            try {
                navigator.clipboard.writeText(code);
                copyButton.innerText = "Copy success";
            } catch (error) {
                console.error(error);
                copyButton.innerText = "Copy failed";
            } finally {
                setTimeout(() => {
                    copyButton.innerText = "Copy code";
                }, 500);
            }
        });
    });
};

const switch_theme = theme => {
    const html_element = document.getElementsByTagName("html")[0];
    html_element.setAttribute("data-bs-theme", theme);

    const nav_buttons_class_name = `btn btn-${theme} right-margin-6px dropdown-toggle`;
    document.getElementById("switch-theme-btn").className =
        nav_buttons_class_name;
    document.getElementById("switch-zoom-btn").className =
        nav_buttons_class_name;

    const switch_article_buttons_class_name = `btn btn-${theme}`;
    document.getElementById("prev-btn").className =
        switch_article_buttons_class_name;
    document.getElementById("next-btn").className =
        switch_article_buttons_class_name;
};

const dark_listener = window.matchMedia("(prefers-color-scheme: dark)");
const theme_listener = event => {
    switch_theme(event.matches ? "dark" : "light");
};
dark_listener.addEventListener("change", theme_listener);
theme_listener(dark_listener);

setInterval(() => {
    const time_container = document.getElementById("time-container");
    time_container.innerHTML = new Date().toLocaleTimeString();
}, 200);

{
    const response = await fetch("/info.json");
    const info = await response.json();
    const book_title_container = document.getElementById("book-title");
    book_title_container.innerHTML = info.book_title;
}
await load_article(2); // for debugging only

window.App = {
    switch_zoom: zoom => {
        const container = document.getElementById("container");
        container.style.zoom = zoom.toString();
    },
    switch_theme: theme => {
        switch (theme) {
            case "light":
                dark_listener.removeEventListener("change", theme_listener);
                switch_theme("light");
                break;
            case "dark":
                dark_listener.removeEventListener("change", theme_listener);
                switch_theme("dark");
                break;
            case "auto":
                dark_listener.addEventListener("change", theme_listener);
                theme_listener(dark_listener);
                break;
            default:
                break;
        }
    },
    switch_article: page => {
        // page: -1 for prev, 1 for next

    }
};
