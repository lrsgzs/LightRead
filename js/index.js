import { marked } from "https://fastly.jsdelivr.net/npm/marked/lib/marked.esm.js";
import hljs from "https://fastly.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/highlight.min.js";
import { lineNumbersBlock } from "./highlight-line-number.js";
import DOMPurify from "https://fastly.jsdelivr.net/npm/dompurify@3.1.7/dist/purify.es.mjs";
import article from "./articles.js";

const purify = DOMPurify(window);

const articles = await article.get_articles();
const articles_count = articles.length;
let article_index = Number(localStorage.getItem("article_index")) || 0;

const load_article = async index => {
    const article_content = await article.load_article(index);
    const container = document.getElementById("container");
    container.innerHTML = purify.sanitize(marked.parse(article_content));

    const article_title_container = document.getElementById("article-title");
    article_title_container.innerHTML = `<span class="font-size-20px">Article: </span>${articles[index]}`;

    hljs.highlightAll();
    await MathJax.typesetPromise();

    // Add copy button to code blocks
    const codeBlocks = document.querySelectorAll("code");
    codeBlocks.forEach(codeBlock => {
        if (codeBlock.parentElement.tagName !== "PRE") {
            return;
        }

        const code = codeBlock.innerText.trim();
        lineNumbersBlock(codeBlock);

        let btn_container = document.createElement("div");
        btn_container.className = "code-block-head display-flex";

        let language_tag = document.createElement("span");
        language_tag.className = "language-tag mr-auto";
        language_tag.innerText = codeBlock.className
            .replace(" hljs", "")
            .replace("language-", "");
        btn_container.appendChild(language_tag);

        let copyButton = document.createElement("button");
        copyButton.className = "btn btn-sm btn-secondary d-print-none";
        copyButton.innerText = "Copy code";
        btn_container.appendChild(copyButton);

        codeBlock.parentElement.insertBefore(
            btn_container,
            codeBlock.parentElement.firstChild
        );

        copyButton.addEventListener("click", () => {
            console.log(code);
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

    // Change buttons
    const prev_btn = document.getElementById("prev-btn");
    const prev_btn_num = document.getElementById("prev-btn-num");
    if (index === 0) {
        prev_btn.className = "btn btn-light visually-hidden mr-auto";
    } else {
        prev_btn.className = "btn btn-light mr-auto";
        prev_btn_num.innerHTML = articles[index - 1];
    }

    const next_btn = document.getElementById("next-btn");
    const next_btn_num = document.getElementById("next-btn-num");
    if (index === articles_count - 1) {
        next_btn.className = "btn btn-light visually-hidden ml-auto";
    } else {
        next_btn.className = "btn btn-light ml-auto";
        next_btn_num.innerHTML = articles[index + 1];
    }
};

const switch_theme = theme => {
    const html_element = document.getElementsByTagName("html")[0];
    html_element.setAttribute("data-bs-theme", theme);

    const nav_buttons_class_name = `btn btn-${theme} right-margin-6px dropdown-toggle`;
    document.getElementById("switch-theme-btn").className =
        nav_buttons_class_name;
    document.getElementById("switch-zoom-btn").className =
        nav_buttons_class_name;

    document.getElementById("prev-btn").className =
        article_index == 0
            ? `btn btn-${theme} visually-hidden mr-auto`
            : `btn btn-${theme} mr-auto`;
    document.getElementById("next-btn").className =
        article_index >= articles_count - 1
            ? `btn btn-${theme} visually-hidden ml-auto`
            : `btn btn-${theme} ml-auto`;
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

const response = await fetch("/info.json");
const info = await response.json();
const book_title_container = document.getElementById("book-title");
book_title_container.innerHTML = info.book_title;
await load_article(article_index);

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
        const index = article_index + page;
        if (index < 0) {
            return;
        } else if (index >= articles_count) {
            return;
        }
        localStorage.setItem("article_index", index.toString());
        article_index = index;
        load_article(article_index);
    },
    open_github_repo: () => {
        window.open(`https://github.com/${info.github}`);
    }
};
