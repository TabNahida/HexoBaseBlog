const particlexMathOptions = {
    delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true },
    ],
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option"],
    ignoredClasses: ["code-content", "katex"],
};

const renderParticlexMath = (root = document.body) => {
    if (
        typeof window === "undefined" ||
        typeof window.renderMathInElement !== "function" ||
        !root
    ) {
        return;
    }

    renderMathInElement(root, particlexMathOptions);
};

if (typeof window !== "undefined") {
    window.particlexRenderMath = renderParticlexMath;
}

mixins.math = {
    created() {
        this.renderers.push(this.math);
    },
    methods: {
        math() {
            renderParticlexMath(document.body);
        },
    },
};
