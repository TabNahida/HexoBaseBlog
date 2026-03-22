const createToolChatSettings = () => ({
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    model: "",
    systemPrompt: "You are a careful and concise assistant.",
    temperature: "0.7",
    maxTokens: "",
    stream: true,
    rememberKey: false,
});

const toolCatalog = [
    {
        id: "openai-chat",
        name: "Compatible Chat",
        icon: "fa-solid fa-comments",
        status: "Ready",
        summary: "Talk to any OpenAI-compatible /chat/completions endpoint directly from the browser.",
    },
];

mixins.tools = {
    data() {
        return {
            tools: toolCatalog,
            activeToolId: "openai-chat",
            toolChat: {
                settings: createToolChatSettings(),
                draft: "",
                messages: [],
                sending: false,
                error: "",
                status: "",
                showKey: false,
            },
            toolChatAbortController: null,
            toolChatStorageKey: "particlex-tools-compatible-chat-v1",
            toolChatSkipNextPersist: false,
        };
    },
    computed: {
        activeTool() {
            return this.tools.find((tool) => tool.id === this.activeToolId) || this.tools[0];
        },
        toolChatEndpoint() {
            const endpoint = this.resolveToolChatEndpoint(this.toolChat.settings.baseUrl);
            return endpoint || "Enter an API base URL to preview the endpoint.";
        },
        toolChatModeLabel() {
            return this.toolChat.settings.stream ? "Streaming on" : "Streaming off";
        },
        toolChatRequestLabel() {
            return this.toolChat.sending ? "Request in flight" : "Ready";
        },
        toolChatStorageHint() {
            if (this.toolChat.settings.rememberKey) {
                return "Base URL, model, prompt and API key are stored in localStorage for this browser.";
            }
            return "Base URL, model and prompt are stored locally. The API key stays in memory only.";
        },
    },
    created() {
        this.restoreToolChatSettings();
    },
    watch: {
        "toolChat.settings": {
            deep: true,
            handler() {
                this.persistToolChatSettings();
            },
        },
    },
    methods: {
        selectTool(id) {
            const tool = this.tools.find((item) => item.id === id);
            if (!tool || tool.disabled) return;
            this.activeToolId = id;
        },
        createToolMessage(role, content = "", extras = {}) {
            return {
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                role,
                content,
                pending: false,
                createdAt: Date.now(),
                ...extras,
            };
        },
        restoreToolChatSettings() {
            if (typeof window === "undefined" || !window.localStorage) return;
            try {
                const raw = window.localStorage.getItem(this.toolChatStorageKey);
                if (!raw) return;
                const saved = JSON.parse(raw);
                const settings = {
                    ...createToolChatSettings(),
                    ...saved,
                };
                if (!settings.rememberKey) settings.apiKey = "";
                this.toolChat.settings = settings;
            } catch (error) {
                console.warn("Failed to restore tool chat settings.", error);
            }
        },
        persistToolChatSettings() {
            if (typeof window === "undefined" || !window.localStorage) return;
            if (this.toolChatSkipNextPersist) {
                this.toolChatSkipNextPersist = false;
                return;
            }
            try {
                const settings = {
                    ...this.toolChat.settings,
                };
                if (!settings.rememberKey) delete settings.apiKey;
                window.localStorage.setItem(this.toolChatStorageKey, JSON.stringify(settings));
            } catch (error) {
                console.warn("Failed to persist tool chat settings.", error);
            }
        },
        clearToolChatSettings() {
            this.toolChatSkipNextPersist = true;
            this.toolChat.settings = createToolChatSettings();
            this.toolChat.showKey = false;
            this.toolChat.error = "";
            this.toolChat.status = "Saved settings cleared.";
            if (typeof window !== "undefined" && window.localStorage) {
                try {
                    window.localStorage.removeItem(this.toolChatStorageKey);
                } catch (error) {
                    console.warn("Failed to clear tool chat settings.", error);
                }
            }
        },
        resetToolChatConversation() {
            if (this.toolChat.sending) this.abortToolChatRequest();
            this.toolChat.messages = [];
            this.toolChat.error = "";
            this.toolChat.status = "Conversation cleared.";
        },
        abortToolChatRequest() {
            if (!this.toolChatAbortController) return;
            this.toolChatAbortController.abort();
        },
        handleToolComposerKeydown(event) {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                this.sendToolChatMessage();
            }
        },
        formatToolTime(value) {
            try {
                return new Date(value).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                });
            } catch (error) {
                return "";
            }
        },
        resolveToolChatEndpoint(baseUrl) {
            const trimmed = (baseUrl || "").trim();
            if (!trimmed) return "";
            const normalized = trimmed.replace(/\/+$/, "");
            if (/\/chat\/completions$/i.test(normalized)) return normalized;
            return `${normalized}/chat/completions`;
        },
        parseToolNumber(value) {
            if (value === "" || value === null || typeof value === "undefined") return;
            const parsed = Number.parseFloat(value);
            return Number.isFinite(parsed) ? parsed : undefined;
        },
        parseToolInteger(value) {
            if (value === "" || value === null || typeof value === "undefined") return;
            const parsed = Number.parseInt(value, 10);
            return Number.isFinite(parsed) ? parsed : undefined;
        },
        buildToolChatMessages(userMessage) {
            const messages = [];
            const prompt = this.toolChat.settings.systemPrompt.trim();
            if (prompt) {
                messages.push({
                    role: "system",
                    content: prompt,
                });
            }
            this.toolChat.messages
                .filter((message) => ["user", "assistant"].includes(message.role) && message.content.trim())
                .forEach((message) => {
                    messages.push({
                        role: message.role,
                        content: message.content,
                    });
                });
            messages.push({
                role: "user",
                content: userMessage,
            });
            return messages;
        },
        extractToolMessageText(value) {
            if (typeof value === "string") return value;
            if (Array.isArray(value)) {
                return value
                    .map((item) => {
                        if (typeof item === "string") return item;
                        if (item && typeof item.text === "string") return item.text;
                        if (item && item.type === "text" && typeof item.text === "string") return item.text;
                        if (item && item.type === "output_text" && typeof item.text === "string") return item.text;
                        if (item && item.text && typeof item.text.value === "string") return item.text.value;
                        return "";
                    })
                    .join("");
            }
            if (value && typeof value.text === "string") return value.text;
            if (value && Array.isArray(value.content)) return this.extractToolMessageText(value.content);
            if (value && typeof value.output_text === "string") return value.output_text;
            return "";
        },
        async extractToolError(response) {
            let payload = "";
            try {
                payload = await response.text();
            } catch (error) {
                return `Request failed with status ${response.status}.`;
            }
            if (!payload) return `Request failed with status ${response.status}.`;
            try {
                const data = JSON.parse(payload);
                return (
                    data?.error?.message ||
                    data?.error ||
                    data?.message ||
                    `Request failed with status ${response.status}.`
                );
            } catch (error) {
                return payload;
            }
        },
        scrollToolChatToBottom() {
            this.$nextTick(() => {
                const wrap = this.$refs.toolChatMessages;
                if (!wrap) return;
                wrap.scrollTop = wrap.scrollHeight;
            });
        },
        processToolStreamEventBlock(block, assistantMessage) {
            const dataLines = block
                .split(/\r?\n/)
                .filter((line) => line.startsWith("data:"))
                .map((line) => line.slice(5).trimStart());
            if (!dataLines.length) return false;
            const payload = dataLines.join("\n").trim();
            if (!payload) return false;
            if (payload === "[DONE]") return true;
            const json = JSON.parse(payload);
            if (json?.error) {
                throw new Error(json.error.message || json.error || "Streaming request failed.");
            }
            const delta =
                this.extractToolMessageText(json?.choices?.[0]?.delta?.content) ||
                this.extractToolMessageText(json?.choices?.[0]?.message?.content) ||
                this.extractToolMessageText(json?.choices?.[0]?.delta?.reasoning_content) ||
                this.extractToolMessageText(json?.output_text);
            if (delta) {
                assistantMessage.content += delta;
                this.scrollToolChatToBottom();
            }
            return false;
        },
        async consumeToolStream(response, assistantMessage) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

                const events = buffer.split(/\r?\n\r?\n/);
                buffer = events.pop() || "";

                for (const event of events) {
                    if (this.processToolStreamEventBlock(event, assistantMessage)) return;
                }

                if (done) break;
            }

            if (buffer.trim()) this.processToolStreamEventBlock(buffer, assistantMessage);
        },
        async sendToolChatMessage() {
            const content = this.toolChat.draft.trim();
            if (!content || this.toolChat.sending) return;

            this.toolChat.error = "";
            this.toolChat.status = "";

            const endpoint = this.resolveToolChatEndpoint(this.toolChat.settings.baseUrl);
            const apiKey = this.toolChat.settings.apiKey.trim();
            const model = this.toolChat.settings.model.trim();
            if (!endpoint || !apiKey || !model) {
                this.toolChat.error = "API base URL, API key and model are required before sending.";
                return;
            }

            const requestMessages = this.buildToolChatMessages(content);
            const userMessage = this.createToolMessage("user", content);
            const assistantMessage = this.createToolMessage("assistant", "", { pending: true });
            this.toolChat.messages.push(userMessage, assistantMessage);
            this.toolChat.draft = "";
            this.toolChat.sending = true;
            this.scrollToolChatToBottom();

            const requestBody = {
                model,
                messages: requestMessages,
                stream: Boolean(this.toolChat.settings.stream),
            };
            const temperature = this.parseToolNumber(this.toolChat.settings.temperature);
            if (typeof temperature === "number") requestBody.temperature = temperature;
            const maxTokens = this.parseToolInteger(this.toolChat.settings.maxTokens);
            if (typeof maxTokens === "number") requestBody.max_tokens = maxTokens;

            const controller = new AbortController();
            this.toolChatAbortController = controller;

            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json, text/event-stream",
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify(requestBody),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(await this.extractToolError(response));
                }

                const contentType = (response.headers.get("content-type") || "").toLowerCase();
                if (requestBody.stream && response.body && contentType.includes("text/event-stream")) {
                    await this.consumeToolStream(response, assistantMessage);
                } else {
                    const payload = await response.json();
                    assistantMessage.content =
                        this.extractToolMessageText(payload?.choices?.[0]?.message?.content) ||
                        this.extractToolMessageText(payload?.output?.[0]?.content) ||
                        this.extractToolMessageText(payload?.response?.output_text) ||
                        "";
                }

                assistantMessage.pending = false;
                if (!assistantMessage.content.trim()) {
                    assistantMessage.content = "The endpoint returned successfully, but no text content was found.";
                }
                this.toolChat.status = "Response completed.";
            } catch (error) {
                const aborted = error && error.name === "AbortError";
                assistantMessage.pending = false;
                if (!assistantMessage.content.trim()) {
                    this.toolChat.messages = this.toolChat.messages.filter(
                        (message) => message.id !== assistantMessage.id
                    );
                }
                this.toolChat.error = aborted ? "" : error.message || "Request failed.";
                this.toolChat.status = aborted ? "Response stopped." : "";
            } finally {
                this.toolChat.sending = false;
                this.toolChatAbortController = null;
                this.scrollToolChatToBottom();
            }
        },
    },
};
