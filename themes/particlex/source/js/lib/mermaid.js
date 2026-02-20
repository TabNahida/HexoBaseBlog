let mermaidInitialized = false;

mixins.mermaid = {
    created() {
        this.renderers.push(this.mermaid);
    },
    methods: {
        mermaid() {
            const selectors = [
                "pre code.language-mermaid",
                "pre code.lang-mermaid",
                "pre code.mermaid",
                "pre.mermaid",
            ];
            const nodes = [];
            for (const code of document.querySelectorAll(selectors.join(","))) {
                if (code.dataset.mermaidRendered === "done" || code.dataset.processed === "true") continue;
                if (code.tagName === "PRE" && code.classList?.contains("mermaid")) {
                    const container = document.createElement("div");
                    container.className = "mermaid";
                    container.dataset.mermaidRendered = "pending";
                    container.textContent = code.textContent || "";
                    code.replaceWith(container);
                    nodes.push(container);
                    continue;
                }
                if (code.classList?.contains("mermaid")) {
                    code.dataset.mermaidRendered = "pending";
                    nodes.push(code);
                    continue;
                }
                const pre = code.tagName === "PRE" ? code : code.closest("pre");
                if (!pre) continue;
                const container = document.createElement("div");
                container.className = "mermaid";
                container.dataset.mermaidRendered = "pending";
                container.textContent = code.textContent || "";
                pre.replaceWith(container);
                nodes.push(container);
            }
            if (!nodes.length) return;
            if (!mermaidInitialized) {
                mermaid.initialize({ startOnLoad: false });
                mermaidInitialized = true;
            }
            mermaid
                .run({ nodes })
                .then(() => {
                    for (const node of nodes) node.dataset.mermaidRendered = "done";
                })
                .catch((error) => {
                    console.error("Mermaid render failed:", error);
                });
        },
    },
};
