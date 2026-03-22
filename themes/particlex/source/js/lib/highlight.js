const escapeHighlightHtml = (value) =>
    String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

const resolveHighlightLanguage = (classes = []) => {
    for (const className of classes) {
        if (!className) continue;
        const normalized = className
            .replace(/^language-/, "")
            .replace(/^lang-/, "")
            .trim()
            .toLowerCase();
        if (!normalized || normalized === "hljs") continue;
        if (typeof window !== "undefined" && window.hljs?.getLanguage?.(normalized)) {
            return normalized;
        }
    }
    return "";
};

const enhanceParticlexCodeBlocks = (root, context) => {
    if (!root || typeof window === "undefined" || !window.hljs) return;

    root.querySelectorAll("pre").forEach((block) => {
        if (block.dataset.particlexCodeEnhanced === "1") return;

        const codeNode = block.querySelector("code");
        const code = codeNode ? codeNode.textContent || "" : block.textContent || "";
        const classes = [...new Set([...block.classList, ...(codeNode?.classList || [])])];
        const isMermaid = classes.some((name) =>
            ["mermaid", "language-mermaid", "lang-mermaid"].includes(name)
        );
        if (isMermaid) return;

        const language = resolveHighlightLanguage(classes);
        const label = language || "plaintext";

        let highlighted = "";
        try {
            if (language) {
                highlighted = window.hljs.highlight(code, {
                    language,
                    ignoreIllegals: true,
                }).value;
            } else {
                highlighted = window.hljs.highlightAuto(code).value;
            }
        } catch {
            highlighted = escapeHighlightHtml(code);
        }

        block.innerHTML = `
        <div class="code-content hljs">${highlighted}</div>
        <div class="language">${label}</div>
        <div class="copycode">
            <i class="fa-solid fa-copy fa-fw"></i>
            <i class="fa-solid fa-check fa-fw"></i>
        </div>
        `;
        block.dataset.particlexCodeEnhanced = "1";

        const content = block.querySelector(".code-content");
        if (content && typeof window.hljs.lineNumbersBlock === "function") {
            window.hljs.lineNumbersBlock(content, { singleLine: true });
        }

        const copycode = block.querySelector(".copycode");
        if (!copycode || !navigator?.clipboard?.writeText) return;

        copycode.addEventListener("click", async () => {
            if (copycode.dataset.copying === "1") return;
            copycode.dataset.copying = "1";
            copycode.classList.add("copied");
            try {
                await navigator.clipboard.writeText(code);
                await context?.sleep?.(1000);
            } finally {
                copycode.classList.remove("copied");
                copycode.dataset.copying = "0";
            }
        });
    });
};

if (typeof window !== "undefined") {
    window.particlexEnhanceCodeBlocks = enhanceParticlexCodeBlocks;
}

mixins.highlight = {
    data() {
        return { copying: false };
    },
    created() {
        hljs.configure({ ignoreUnescapedHTML: true });
        this.renderers.push(this.highlight);
    },
    methods: {
        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        highlight() {
            enhanceParticlexCodeBlocks(document, this);
        },
    },
};
