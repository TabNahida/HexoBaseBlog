const createChatboxSettings = () => ({
    apiRoot: "http://127.0.0.1:8080/v1",
    apiKey: "",
    rememberKey: false,
    model: "",
    systemPrompt: "You are a careful and concise assistant.",
    stream: true,
    thinkMode: "default",
    showThinking: true,
    excludeThinkingFromContext: true,
    showSpeedMetrics: true,
    temperature: "0.7",
    maxTokens: "",
    topP: "",
    topK: "",
    minP: "",
    repeatPenalty: "",
    presencePenalty: "",
    frequencyPenalty: "",
    seed: "",
    stopSequences: "",
    extraBody: "",
});

mixins.chatbox = {
    data() {
        return {
            chatbox: {
                settings: createChatboxSettings(),
                draft: "",
                search: "",
                messages: [],
                conversations: [],
                activeConversationId: "",
                models: [],
                editingMessageId: "",
                editingDraft: "",
                showControlsPanel: false,
                activeControlsSection: "reasoning",
                sending: false,
                fetchingModels: false,
                error: "",
                status: "",
                showKey: false,
                connectionState: "idle",
                lastModelsRoot: "",
            },
            chatboxAbortController: null,
            chatboxStorageKey: "particlex-chatbox-settings-v2",
            chatboxConversationStorageKey: "particlex-chatbox-conversations-v1",
            chatboxSkipNextPersist: false,
        };
    },
    computed: {
        chatboxApiRoot() {
            return this.normalizeChatboxApiRoot(this.chatbox.settings.apiRoot);
        },
        chatboxApiRootDisplay() {
            return this.chatboxApiRoot || "Enter an API root to resolve endpoints.";
        },
        chatboxModelsEndpoint() {
            return this.chatboxApiRoot ? `${this.chatboxApiRoot}/models` : "";
        },
        chatboxModelsEndpointDisplay() {
            return this.chatboxModelsEndpoint || "Set the API root to resolve /models.";
        },
        chatboxChatEndpoint() {
            return this.chatboxApiRoot ? `${this.chatboxApiRoot}/chat/completions` : "";
        },
        chatboxChatEndpointDisplay() {
            return this.chatboxChatEndpoint || "Set the API root to resolve /chat/completions.";
        },
        chatboxConnectionLabel() {
            if (this.chatbox.fetchingModels) return "Checking endpoint";
            if (!this.chatboxApiRoot) return "Awaiting endpoint";
            if (this.chatbox.connectionState === "error") return "Endpoint error";
            if (this.chatbox.lastModelsRoot && this.chatbox.lastModelsRoot !== this.chatboxApiRoot) {
                return "Model list stale";
            }
            if (this.chatbox.models.length) return `Loaded ${this.chatbox.models.length} models`;
            if (this.chatbox.connectionState === "ready") return "Endpoint ready";
            return "Endpoint not checked";
        },
        chatboxConnectionStateClass() {
            if (this.chatbox.fetchingModels) return "is-working";
            if (this.chatbox.connectionState === "error") return "is-error";
            if (this.chatbox.lastModelsRoot && this.chatbox.lastModelsRoot === this.chatboxApiRoot) return "is-ready";
            return "is-idle";
        },
        chatboxModelLabel() {
            return this.chatbox.settings.model ? `Model: ${this.chatbox.settings.model}` : "Model not selected";
        },
        chatboxThinkModeLabel() {
            const labels = {
                default: "Think: default",
                on: "Think: on",
                off: "Think: off",
            };
            return labels[this.chatbox.settings.thinkMode] || "Think: default";
        },
        chatboxStreamLabel() {
            return this.chatbox.settings.stream ? "Streaming on" : "Streaming off";
        },
        chatboxActiveConversation() {
            return this.chatbox.conversations.find((conversation) => conversation.id === this.chatbox.activeConversationId) || null;
        },
        chatboxDisplayMessages() {
            return this.chatboxActiveConversation?.messages || [];
        },
        chatboxFilteredConversations() {
            const keyword = (this.chatbox.search || "").trim().toLowerCase();
            if (!keyword) return this.chatbox.conversations;
            return this.chatbox.conversations.filter((conversation) => {
                const haystack = [
                    conversation.title,
                    ...(conversation.messages || []).map((message) => message.content || message.rawContent || ""),
                ]
                    .join("\n")
                    .toLowerCase();
                return haystack.includes(keyword);
            });
        },
    },
    created() {
        this.restoreChatboxSettings();
        this.restoreChatboxConversations();
    },
    mounted() {
        window.addEventListener("keydown", this.handleChatboxWindowKeydown);
    },
    unmounted() {
        window.removeEventListener("keydown", this.handleChatboxWindowKeydown);
    },
    watch: {
        "chatbox.settings": {
            deep: true,
            handler() {
                this.persistChatboxSettings();
            },
        },
        "chatbox.conversations": {
            deep: true,
            handler() {
                this.persistChatboxConversations();
            },
        },
        "chatbox.activeConversationId"() {
            this.persistChatboxConversations();
        },
    },
    methods: {
        normalizeChatboxApiRoot(value) {
            const trimmed = (value || "").trim();
            if (!trimmed) return "";
            return trimmed
                .replace(/\/+$/, "")
                .replace(/\/chat\/completions$/i, "")
                .replace(/\/models$/i, "");
        },
        parseChatboxNumber(value) {
            if (value === "" || value === null || typeof value === "undefined") return;
            const parsed = Number.parseFloat(value);
            return Number.isFinite(parsed) ? parsed : undefined;
        },
        parseChatboxInteger(value) {
            if (value === "" || value === null || typeof value === "undefined") return;
            const parsed = Number.parseInt(value, 10);
            return Number.isFinite(parsed) ? parsed : undefined;
        },
        firstFiniteChatboxNumber(candidates) {
            for (const candidate of candidates) {
                if (candidate === "" || candidate === null || typeof candidate === "undefined") continue;
                const parsed = typeof candidate === "number" ? candidate : Number(candidate);
                if (Number.isFinite(parsed)) return parsed;
            }
        },
        normalizeChatboxText(text) {
            return (text || "").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
        },
        mergeChatboxText(...parts) {
            const unique = [];
            for (const part of parts) {
                const normalized = this.normalizeChatboxText(part);
                if (!normalized) continue;
                if (!unique.includes(normalized)) unique.push(normalized);
            }
            return unique.join("\n\n");
        },
        buildChatboxHeaders(includeJson = false) {
            const headers = {
                Accept: "application/json, text/event-stream",
            };
            if (includeJson) headers["Content-Type"] = "application/json";

            const apiKey = this.chatbox.settings.apiKey.trim();
            if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

            return headers;
        },
        restoreChatboxSettings() {
            if (typeof window === "undefined" || !window.localStorage) return;
            try {
                const raw = window.localStorage.getItem(this.chatboxStorageKey);
                if (!raw) return;
                const saved = JSON.parse(raw);
                const settings = {
                    ...createChatboxSettings(),
                    ...saved,
                };
                if (!settings.rememberKey) settings.apiKey = "";
                this.chatbox.settings = settings;
            } catch (error) {
                console.warn("Failed to restore chatbox settings.", error);
            }
        },
        persistChatboxSettings() {
            if (typeof window === "undefined" || !window.localStorage) return;
            if (this.chatboxSkipNextPersist) {
                this.chatboxSkipNextPersist = false;
                return;
            }
            try {
                const settings = {
                    ...this.chatbox.settings,
                };
                if (!settings.rememberKey) delete settings.apiKey;
                window.localStorage.setItem(this.chatboxStorageKey, JSON.stringify(settings));
            } catch (error) {
                console.warn("Failed to persist chatbox settings.", error);
            }
        },
        clearChatboxSettings() {
            this.chatboxSkipNextPersist = true;
            this.chatbox.settings = createChatboxSettings();
            this.chatbox.models = [];
            this.chatbox.lastModelsRoot = "";
            this.chatbox.connectionState = "idle";
            this.chatbox.showKey = false;
            this.chatbox.showControlsPanel = false;
            this.chatbox.activeControlsSection = "reasoning";
            this.chatbox.error = "";
            this.chatbox.status = "Saved settings cleared.";
            if (typeof window !== "undefined" && window.localStorage) {
                try {
                    window.localStorage.removeItem(this.chatboxStorageKey);
                } catch (error) {
                    console.warn("Failed to clear chatbox settings.", error);
                }
            }
        },
        truncateChatboxConversationTitle(text) {
            const normalized = this.normalizeChatboxText(text).replace(/\s+/g, " ");
            if (!normalized) return "New chat";
            return normalized.length > 42 ? `${normalized.slice(0, 42)}...` : normalized;
        },
        createChatboxConversation(initialMessages = []) {
            const now = Date.now();
            const conversation = {
                id: `chat-${now}-${Math.random().toString(16).slice(2)}`,
                title: "New chat",
                createdAt: now,
                updatedAt: now,
                messages: Array.isArray(initialMessages) ? initialMessages.slice() : [],
            };
            this.chatbox.conversations.unshift(conversation);
            this.chatbox.activeConversationId = conversation.id;
            this.chatbox.messages = conversation.messages.slice();
            this.cancelEditChatboxMessage();
            this.refreshChatboxUi();
            return conversation;
        },
        getChatboxConversationById(conversationId = this.chatbox.activeConversationId) {
            return this.chatbox.conversations.find((conversation) => conversation.id === conversationId) || null;
        },
        ensureChatboxConversation() {
            let conversation = this.getChatboxConversationById();
            if (conversation) {
                if (this.chatbox.messages !== conversation.messages) {
                    this.chatbox.messages = conversation.messages.slice();
                }
                return conversation;
            }
            return this.createChatboxConversation();
        },
        touchChatboxConversation(conversation, titleSource = "") {
            if (!conversation) return;
            conversation.updatedAt = Date.now();
            if (titleSource && (!conversation.title || conversation.title === "New chat")) {
                conversation.title = this.truncateChatboxConversationTitle(titleSource);
            }
            const index = this.chatbox.conversations.findIndex((item) => item.id === conversation.id);
            if (index > 0) {
                const [item] = this.chatbox.conversations.splice(index, 1);
                this.chatbox.conversations.unshift(item);
            }
        },
        replaceChatboxConversationMessages(conversation, messages) {
            if (!conversation) return;
            const normalized = Array.isArray(messages) ? messages.slice() : [];
            conversation.messages = normalized;
            if (this.chatbox.activeConversationId === conversation.id) {
                this.chatbox.messages = conversation.messages.slice();
            }
            this.touchChatboxConversation(conversation);
            this.refreshChatboxUi();
        },
        replaceChatboxMessages(messages) {
            this.replaceChatboxConversationMessages(this.ensureChatboxConversation(), messages);
        },
        restoreChatboxConversations() {
            if (typeof window === "undefined" || !window.localStorage) {
                this.createChatboxConversation();
                return;
            }
            try {
                const raw = window.localStorage.getItem(this.chatboxConversationStorageKey);
                if (!raw) {
                    this.createChatboxConversation();
                    return;
                }
                const saved = JSON.parse(raw);
                const conversations = Array.isArray(saved?.conversations) ? saved.conversations : [];
                this.chatbox.conversations = conversations
                    .filter((conversation) => conversation && typeof conversation === "object")
                    .map((conversation) => ({
                        id: conversation.id || `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                        title: conversation.title || "New chat",
                        createdAt: conversation.createdAt || Date.now(),
                        updatedAt: conversation.updatedAt || conversation.createdAt || Date.now(),
                        messages: Array.isArray(conversation.messages) ? conversation.messages.slice() : [],
                    }))
                    .sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0));

                if (!this.chatbox.conversations.length) {
                    this.createChatboxConversation();
                    return;
                }

                const targetId = saved?.activeConversationId;
                const active = this.chatbox.conversations.find((conversation) => conversation.id === targetId) || this.chatbox.conversations[0];
                this.chatbox.activeConversationId = active.id;
                this.chatbox.messages = active.messages.slice();
            } catch (error) {
                console.warn("Failed to restore chatbox conversations.", error);
                this.chatbox.conversations = [];
                this.createChatboxConversation();
            }
        },
        persistChatboxConversations() {
            if (typeof window === "undefined" || !window.localStorage) return;
            try {
                const payload = {
                    activeConversationId: this.chatbox.activeConversationId,
                    conversations: this.chatbox.conversations,
                };
                window.localStorage.setItem(this.chatboxConversationStorageKey, JSON.stringify(payload));
            } catch (error) {
                console.warn("Failed to persist chatbox conversations.", error);
            }
        },
        selectChatboxConversation(conversationId) {
            const conversation = this.getChatboxConversationById(conversationId);
            if (!conversation) return;
            if (this.chatbox.sending && this.chatbox.activeConversationId !== conversation.id) {
                this.abortChatboxRequest();
            }
            this.chatbox.activeConversationId = conversation.id;
            this.chatbox.messages = conversation.messages.slice();
            this.cancelEditChatboxMessage();
            this.chatbox.error = "";
            this.chatbox.status = "";
            this.refreshChatboxUi(true);
        },
        getChatboxConversationPreview(conversation) {
            if (!conversation) return "";
            const assistant = (conversation.messages || []).find((message) => message.role === "assistant" && (message.content || message.rawContent));
            if (assistant) {
                return this.truncateChatboxConversationTitle(assistant.content || assistant.rawContent || "");
            }
            const user = (conversation.messages || []).find((message) => message.role === "user" && (message.content || message.rawContent));
            if (user) {
                return this.truncateChatboxConversationTitle(user.content || user.rawContent || "");
            }
            return "Empty conversation";
        },
        escapeChatboxHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;")
                .replace(/'/g, "&#39;");
        },
        renderChatboxMarkdown(text) {
            const source = typeof text === "string" ? text : "";
            if (!source.trim()) return "";
            if (typeof window !== "undefined" && window.marked && typeof window.marked.parse === "function") {
                try {
                    const html = window.marked.parse(source, {
                        breaks: true,
                        gfm: true,
                    });
                    if (window.DOMPurify && typeof window.DOMPurify.sanitize === "function") {
                        return window.DOMPurify.sanitize(html);
                    }
                    return html;
                } catch (error) {
                    console.warn("Failed to render markdown.", error);
                }
            }
            return this.escapeChatboxHtml(source).replace(/\n/g, "<br>");
        },
        renderChatboxMessageHtml(message) {
            return this.renderChatboxMarkdown(this.getChatboxMessageBodyText(message));
        },
        renderChatboxReasoningHtml(message) {
            return this.renderChatboxMarkdown(message?.reasoning || "");
        },
        refreshChatboxRichContent() {
            this.$nextTick(() => {
                const wrap = this.$refs.chatboxLog;
                if (!wrap || typeof window === "undefined" || !window.hljs) return;
                wrap.querySelectorAll("pre code").forEach((code) => {
                    if (code.dataset.chatboxHighlighted === "1") return;
                    try {
                        window.hljs.highlightElement(code);
                        code.dataset.chatboxHighlighted = "1";
                    } catch (error) {
                        console.warn("Failed to highlight a chatbox code block.", error);
                    }
                });
            });
        },
        refreshChatboxUi(scrollToBottom = false) {
            if (typeof this.$forceUpdate === "function") this.$forceUpdate();
            this.refreshChatboxRichContent();
            if (scrollToBottom) this.scrollChatboxToBottom();
        },
        splitChatboxThinking(text) {
            const input = typeof text === "string" ? text : "";
            if (!input) {
                return {
                    content: "",
                    reasoning: "",
                };
            }

            const reasoningParts = [];
            let visible = "";
            let cursor = 0;
            const lower = input.toLowerCase();

            while (true) {
                const openIndex = lower.indexOf("<think>", cursor);
                if (openIndex === -1) {
                    visible += input.slice(cursor);
                    break;
                }

                visible += input.slice(cursor, openIndex);
                const reasoningStart = openIndex + 7;
                const closeIndex = lower.indexOf("</think>", reasoningStart);
                if (closeIndex === -1) {
                    reasoningParts.push(input.slice(reasoningStart));
                    cursor = input.length;
                    break;
                }

                reasoningParts.push(input.slice(reasoningStart, closeIndex));
                cursor = closeIndex + 8;
            }

            return {
                content: this.normalizeChatboxText(visible),
                reasoning: this.normalizeChatboxText(reasoningParts.join("\n\n")),
            };
        },
        extractChatboxText(value) {
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
            if (value && value.text && typeof value.text.value === "string") return value.text.value;
            if (value && Array.isArray(value.content)) return this.extractChatboxText(value.content);
            if (value && typeof value.output_text === "string") return value.output_text;
            return "";
        },
        extractChatboxReasoning(choice, deltaOnly = false) {
            if (!choice) return "";
            if (deltaOnly) {
                return (
                    this.extractChatboxText(choice?.delta?.reasoning_content) ||
                    this.extractChatboxText(choice?.delta?.reasoning) ||
                    this.extractChatboxText(choice?.delta?.thinking) ||
                    ""
                );
            }
            return (
                this.extractChatboxText(choice?.message?.reasoning_content) ||
                this.extractChatboxText(choice?.message?.reasoning) ||
                this.extractChatboxText(choice?.message?.thinking) ||
                this.extractChatboxText(choice?.reasoning_content) ||
                this.extractChatboxText(choice?.reasoning) ||
                this.extractChatboxText(choice?.thinking) ||
                ""
            );
        },
        extractChatboxChunkContent(json) {
            const choice = json?.choices?.[0];
            return this.mergeChatboxText(
                this.extractChatboxText(choice?.delta?.content),
                this.extractChatboxText(choice?.delta?.text),
                this.extractChatboxText(choice?.delta),
                this.extractChatboxText(choice?.message?.content),
                this.extractChatboxText(choice?.message?.text),
                this.extractChatboxText(choice?.message),
                this.extractChatboxText(choice?.text),
                this.extractChatboxText(json?.delta?.content),
                this.extractChatboxText(json?.delta?.text),
                this.extractChatboxText(json?.delta),
                this.extractChatboxText(json?.message?.content),
                this.extractChatboxText(json?.message?.text),
                this.extractChatboxText(json?.message),
                this.extractChatboxText(json?.content),
                this.extractChatboxText(json?.text),
                this.extractChatboxText(json?.output_text)
            );
        },
        extractChatboxChunkReasoning(json, deltaOnly = false) {
            const choice = json?.choices?.[0];
            return this.mergeChatboxText(
                this.extractChatboxReasoning(choice, deltaOnly),
                this.extractChatboxText(json?.delta?.reasoning_content),
                this.extractChatboxText(json?.delta?.reasoning),
                this.extractChatboxText(json?.delta?.thinking),
                this.extractChatboxText(json?.delta?.reasoning_text),
                this.extractChatboxText(json?.message?.reasoning_content),
                this.extractChatboxText(json?.message?.reasoning),
                this.extractChatboxText(json?.message?.thinking),
                this.extractChatboxText(json?.message?.reasoning_text),
                this.extractChatboxText(json?.reasoning_content),
                this.extractChatboxText(json?.reasoning),
                this.extractChatboxText(json?.thinking),
                this.extractChatboxText(json?.reasoning_text)
            );
        },
        applyChatboxAssistantUpdate(message, rawText = "", reasoningText = "") {
            if (rawText) message.rawContent += rawText;
            if (reasoningText) message.reasoningRaw = this.mergeChatboxText(message.reasoningRaw, reasoningText);

            const parsed = this.splitChatboxThinking(message.rawContent);
            message.reasoning = this.mergeChatboxText(message.reasoningRaw, parsed.reasoning);
            message.content = parsed.content;
        },
        createChatboxMessage(role, content = "", extras = {}) {
            return {
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                role,
                content,
                rawContent: content,
                reasoning: "",
                reasoningRaw: "",
                pending: false,
                metrics: null,
                metricsDismissed: false,
                finishReason: "",
                createdAt: Date.now(),
                ...extras,
            };
        },
        normalizeChatboxModels(payload) {
            const source = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.data)
                  ? payload.data
                  : Array.isArray(payload?.models)
                    ? payload.models
                    : Array.isArray(payload?.result)
                      ? payload.result
                      : [];

            const seen = new Set();
            const models = [];

            for (const item of source) {
                const id =
                    typeof item === "string"
                        ? item
                        : item?.id || item?.name || item?.model || item?.alias || item?.slug;
                if (!id || seen.has(id)) continue;
                seen.add(id);

                let label = id;
                if (item && typeof item === "object") {
                    const secondary = item.owned_by || item.object || item.architecture || item.type;
                    if (secondary) label = `${id} · ${secondary}`;
                }
                models.push({ id, label });
            }

            return models;
        },
        async extractChatboxError(response) {
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
        async fetchChatboxModels() {
            this.chatbox.error = "";
            this.chatbox.status = "";

            if (!this.chatboxApiRoot) {
                this.chatbox.error = "Set the API root before fetching the model list.";
                return;
            }

            this.chatbox.fetchingModels = true;
            this.chatbox.connectionState = "working";

            try {
                const response = await fetch(this.chatboxModelsEndpoint, {
                    method: "GET",
                    headers: this.buildChatboxHeaders(false),
                });
                if (!response.ok) {
                    throw new Error(await this.extractChatboxError(response));
                }

                const payload = await response.json();
                const models = this.normalizeChatboxModels(payload);
                this.chatbox.models = models;
                this.chatbox.lastModelsRoot = this.chatboxApiRoot;
                this.chatbox.connectionState = "ready";

                if ((!this.chatbox.settings.model || !models.some((model) => model.id === this.chatbox.settings.model)) && models.length) {
                    this.chatbox.settings.model = models[0].id;
                }

                this.chatbox.status = models.length
                    ? `Loaded ${models.length} models from /models.`
                    : "The endpoint responded successfully, but returned no models.";
            } catch (error) {
                this.chatbox.connectionState = "error";
                if (this.chatbox.lastModelsRoot !== this.chatboxApiRoot) this.chatbox.models = [];
                this.chatbox.error = error.message || "Failed to fetch models.";
            } finally {
                this.chatbox.fetchingModels = false;
            }
        },
        resetChatboxConversation() {
            if (this.chatbox.sending) this.abortChatboxRequest();
            this.createChatboxConversation();
            this.cancelEditChatboxMessage();
            this.chatbox.error = "";
            this.chatbox.status = "Started a new conversation.";
        },
        abortChatboxRequest() {
            if (!this.chatboxAbortController) return;
            this.chatboxAbortController.abort();
        },
        handleChatboxWindowKeydown(event) {
            if (event.key === "Escape" && this.chatbox.showControlsPanel) {
                this.chatbox.showControlsPanel = false;
            }
        },
        handleChatboxComposerKeydown(event) {
            if (event.isComposing) return;
            if (event.key === "Enter" && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) {
                event.preventDefault();
                this.sendChatboxMessage();
            }
        },
        findChatboxMessageIndex(messageId) {
            return this.chatboxDisplayMessages.findIndex((message) => message.id === messageId);
        },
        startEditChatboxMessage(messageId) {
            const index = this.findChatboxMessageIndex(messageId);
            if (index === -1) return;
            const message = this.chatboxDisplayMessages[index];
            if (message.role !== "user") return;
            this.chatbox.editingMessageId = messageId;
            this.chatbox.editingDraft = message.content || message.rawContent || "";
        },
        cancelEditChatboxMessage() {
            this.chatbox.editingMessageId = "";
            this.chatbox.editingDraft = "";
        },
        saveEditedChatboxMessage(messageId) {
            const index = this.findChatboxMessageIndex(messageId);
            if (index === -1) return;
            const nextText = this.chatbox.editingDraft.trim();
            if (!nextText) {
                this.chatbox.error = "Edited user message cannot be empty.";
                return;
            }

            const message = this.chatboxDisplayMessages[index];
            if (message.role !== "user") return;

            message.content = nextText;
            message.rawContent = nextText;
            this.replaceChatboxMessages(this.chatboxDisplayMessages.slice(0, index + 1));
            this.touchChatboxConversation(this.getChatboxConversationById(), nextText);
            this.cancelEditChatboxMessage();
            this.chatbox.status = "User message updated. Continue from here or click Re-send.";
            this.refreshChatboxUi();
        },
        getChatboxResendTargetId(messageId) {
            const index = this.findChatboxMessageIndex(messageId);
            if (index === -1) return "";

            const current = this.chatboxDisplayMessages[index];
            if (current.role === "user") return current.id;

            for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
                if (this.chatboxDisplayMessages[cursor].role === "user") return this.chatboxDisplayMessages[cursor].id;
            }

            return "";
        },
        async resendChatboxFromMessage(messageId, overrideText) {
            const targetId = this.getChatboxResendTargetId(messageId);
            const index = this.findChatboxMessageIndex(targetId);
            if (index === -1) return;

            const fallbackText =
                this.chatboxDisplayMessages[index].content || this.chatboxDisplayMessages[index].rawContent || "";
            const content = (typeof overrideText === "string" ? overrideText : fallbackText).trim();
            if (!content) {
                this.chatbox.error = "Cannot re-send an empty message.";
                return;
            }

            this.replaceChatboxMessages(this.chatboxDisplayMessages.slice(0, index));
            this.cancelEditChatboxMessage();
            await this.dispatchChatboxMessage(content);
        },
        dismissChatboxMetrics(messageId) {
            const index = this.findChatboxMessageIndex(messageId);
            if (index === -1) return;
            const message = this.chatboxDisplayMessages[index];
            message.metricsDismissed = true;
            this.refreshChatboxUi();
        },
        deleteChatboxConversation(conversationId) {
            const index = this.chatbox.conversations.findIndex((conversation) => conversation.id === conversationId);
            if (index === -1) return;

            const isActive = this.chatbox.activeConversationId === conversationId;
            if (isActive && this.chatbox.sending) this.abortChatboxRequest();

            this.chatbox.conversations.splice(index, 1);
            this.cancelEditChatboxMessage();
            this.chatbox.error = "";

            if (!this.chatbox.conversations.length) {
                this.createChatboxConversation();
                this.chatbox.status = "Conversation deleted.";
                this.refreshChatboxUi();
                return;
            }

            if (isActive) {
                const nextConversation =
                    this.chatbox.conversations[Math.min(index, this.chatbox.conversations.length - 1)] || this.chatbox.conversations[0];
                this.chatbox.activeConversationId = nextConversation.id;
                this.chatbox.messages = nextConversation.messages.slice();
            }

            this.chatbox.status = "Conversation deleted.";
            this.refreshChatboxUi(isActive);
        },
        scrollChatboxToBottom() {
            this.$nextTick(() => {
                const wrap = this.$refs.chatboxLog;
                if (!wrap) return;
                wrap.scrollTop = wrap.scrollHeight;
            });
        },
        parseChatboxStopSequences() {
            return (this.chatbox.settings.stopSequences || "")
                .split(/[\n,]/)
                .map((item) => item.trim())
                .filter(Boolean);
        },
        parseChatboxExtraBody() {
            const raw = (this.chatbox.settings.extraBody || "").trim();
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
                throw new Error("Extra body JSON must parse to an object.");
            }
            return parsed;
        },
        buildAssistantContextText(message) {
            if (!message) return "";
            if (this.chatbox.settings.excludeThinkingFromContext) {
                return this.normalizeChatboxText(message.content);
            }
            if (this.normalizeChatboxText(message.rawContent)) {
                return this.normalizeChatboxText(message.rawContent);
            }
            if (this.normalizeChatboxText(message.reasoning)) {
                return this.normalizeChatboxText(
                    `<think>\n${this.normalizeChatboxText(message.reasoning)}\n</think>\n\n${message.content || ""}`
                );
            }
            return this.normalizeChatboxText(message.content);
        },
        buildChatboxMessages(userMessage, historyMessages = this.chatboxDisplayMessages) {
            const messages = [];
            const prompt = this.chatbox.settings.systemPrompt.trim();
            if (prompt) {
                messages.push({
                    role: "system",
                    content: prompt,
                });
            }

            historyMessages.forEach((message) => {
                if (!["user", "assistant"].includes(message.role)) return;
                const content =
                    message.role === "assistant"
                        ? this.buildAssistantContextText(message)
                        : this.normalizeChatboxText(message.content || message.rawContent);
                if (!content) return;
                messages.push({
                    role: message.role,
                    content,
                });
            });

            messages.push({
                role: "user",
                content: userMessage,
            });

            return messages;
        },
        mergeChatboxMetrics(baseMetrics, nextMetrics) {
            return {
                ...(baseMetrics || {}),
                ...(nextMetrics || {}),
            };
        },
        extractChatboxMetrics(payload) {
            const usage = payload?.usage || payload?.token_usage || payload?.x_usage || {};
            const timings = payload?.timings || payload?.performance || payload?.metrics || payload?.stats || {};

            return {
                promptTokens: this.firstFiniteChatboxNumber([
                    usage?.prompt_tokens,
                    usage?.input_tokens,
                    usage?.promptTokens,
                    timings?.prompt_n,
                    timings?.prompt_tokens,
                ]),
                completionTokens: this.firstFiniteChatboxNumber([
                    usage?.completion_tokens,
                    usage?.output_tokens,
                    usage?.completionTokens,
                    timings?.predicted_n,
                    timings?.completion_tokens,
                    timings?.output_tokens,
                ]),
                totalTokens: this.firstFiniteChatboxNumber([
                    usage?.total_tokens,
                    usage?.totalTokens,
                    timings?.total_tokens,
                ]),
                prefillSpeed: this.firstFiniteChatboxNumber([
                    timings?.prompt_per_second,
                    timings?.prefill_tokens_per_second,
                    timings?.prefill_tps,
                    timings?.prompt_tokens_per_second,
                ]),
                decodeSpeed: this.firstFiniteChatboxNumber([
                    timings?.predicted_per_second,
                    timings?.decode_tokens_per_second,
                    timings?.decode_tps,
                    timings?.completion_tokens_per_second,
                ]),
            };
        },
        finalizeChatboxMetrics(tracker) {
            const metrics = {
                ...(tracker.metrics || {}),
            };

            if (tracker.firstTokenAt && tracker.startedAt) {
                metrics.ttftMs = tracker.firstTokenAt - tracker.startedAt;
            }
            if (tracker.finishedAt && tracker.startedAt) {
                metrics.totalDurationMs = tracker.finishedAt - tracker.startedAt;
            }

            if (!metrics.prefillSpeed && metrics.promptTokens && tracker.firstTokenAt && tracker.startedAt) {
                const prefillMs = tracker.firstTokenAt - tracker.startedAt;
                if (prefillMs > 0) metrics.prefillSpeed = metrics.promptTokens / (prefillMs / 1000);
            }

            if (!metrics.decodeSpeed && metrics.completionTokens && tracker.finishedAt) {
                const decodeStart = tracker.firstTokenAt || tracker.startedAt;
                const decodeMs = tracker.finishedAt - decodeStart;
                if (decodeMs > 0) metrics.decodeSpeed = metrics.completionTokens / (decodeMs / 1000);
            }

            return metrics;
        },
        parseChatboxStreamPayloads(payload) {
            const trimmed = payload.trim();
            if (!trimmed) return [];
            if (trimmed === "[DONE]") return ["[DONE]"];

            const parsed = [];
            const candidates = [trimmed];
            if (trimmed.includes("\n")) {
                trimmed
                    .split(/\r?\n/)
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .forEach((item) => candidates.push(item));
            }

            const seen = new Set();
            for (const candidate of candidates) {
                if (seen.has(candidate)) continue;
                seen.add(candidate);

                if (!candidate.startsWith("{") && !candidate.startsWith("[")) continue;
                try {
                    parsed.push(JSON.parse(candidate));
                } catch (error) {
                    continue;
                }
            }

            if (!parsed.length && !trimmed.startsWith("{") && !trimmed.startsWith("[") && !/^event:/i.test(trimmed)) {
                parsed.push(trimmed);
            }

            return parsed;
        },
        processChatboxStreamPayload(payload, assistantMessage, tracker) {
            const trimmed = (payload || "").trim();
            if (!trimmed) {
                return {
                    done: false,
                    changed: false,
                };
            }

            const beforeRaw = assistantMessage.rawContent || "";
            const beforeReasoning = assistantMessage.reasoningRaw || "";
            const events = this.parseChatboxStreamPayloads(trimmed);
            if (events.includes("[DONE]")) {
                return {
                    done: true,
                    changed: beforeRaw !== (assistantMessage.rawContent || "") || beforeReasoning !== (assistantMessage.reasoningRaw || ""),
                };
            }
            if (!events.length) {
                return {
                    done: false,
                    changed: false,
                };
            }

            for (const event of events) {
                if (typeof event === "string") {
                    if (!tracker.firstTokenAt) tracker.firstTokenAt = performance.now();
                    this.applyChatboxAssistantUpdate(assistantMessage, event, "");
                    continue;
                }

                const json = event;
                if (json?.error) {
                    throw new Error(json.error.message || json.error || "Streaming request failed.");
                }

                const choice = json?.choices?.[0];
                const rawText = this.extractChatboxChunkContent(json);
                const hasFinalMessageShape = Boolean(choice?.message || json?.message || json?.output || json?.response);
                const reasoningText = this.extractChatboxChunkReasoning(json, !hasFinalMessageShape);

                if ((rawText || reasoningText) && !tracker.firstTokenAt) tracker.firstTokenAt = performance.now();
                this.applyChatboxAssistantUpdate(assistantMessage, rawText, reasoningText);
                tracker.metrics = this.mergeChatboxMetrics(tracker.metrics, this.extractChatboxMetrics(json));

                if (choice?.finish_reason) assistantMessage.finishReason = choice.finish_reason;
            }

            const changed = beforeRaw !== (assistantMessage.rawContent || "") || beforeReasoning !== (assistantMessage.reasoningRaw || "");
            if (changed) this.refreshChatboxUi(true);
            return {
                done: false,
                changed,
            };
        },
        processChatboxStreamEvent(block, assistantMessage, tracker) {
            const trimmedBlock = (block || "").trim();
            if (!trimmedBlock) {
                return {
                    done: false,
                    changed: false,
                };
            }

            const dataLines = block
                .split(/\r?\n/)
                .filter((line) => /^\s*data:/i.test(line))
                .map((line) => line.replace(/^\s*data:/i, "").trimStart());
            if (dataLines.length) {
                return this.processChatboxStreamPayload(dataLines.join("\n").trim(), assistantMessage, tracker);
            }

            if (/^(event:|id:|retry:)/im.test(trimmedBlock) && !/\bdata:/im.test(block)) {
                return {
                    done: false,
                    changed: false,
                };
            }

            return this.processChatboxStreamPayload(trimmedBlock, assistantMessage, tracker);
        },
        async consumeChatboxStream(response, assistantMessage, tracker, contentType = "") {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let mode = contentType.includes("text/event-stream") ? "sse" : "";
            let parsedAnything = false;

            while (true) {
                const { value, done } = await reader.read();
                buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

                if (!mode) {
                    const sample = buffer.trimStart();
                    if (sample) {
                        if (/^(data:|event:|id:|retry:)/im.test(sample)) mode = "sse";
                        else if (contentType.includes("json") || sample.startsWith("{") || sample.startsWith("[")) mode = "jsonl";
                        else if (sample.includes("\n")) mode = "jsonl";
                        else mode = "text";
                    }
                }

                if (mode === "sse") {
                    const events = buffer.split(/\r?\n\r?\n/);
                    buffer = events.pop() || "";

                    for (const event of events) {
                        const result = this.processChatboxStreamEvent(event, assistantMessage, tracker);
                        parsedAnything = parsedAnything || result.changed;
                        if (result.done) {
                            return { parsedAnything, done: true };
                        }
                    }
                } else if (mode === "jsonl") {
                    const lines = buffer.split(/\r?\n/);
                    buffer = done ? "" : lines.pop() || "";

                    for (const line of lines) {
                        const result = this.processChatboxStreamEvent(line, assistantMessage, tracker);
                        parsedAnything = parsedAnything || result.changed;
                        if (result.done) {
                            return { parsedAnything, done: true };
                        }
                    }
                } else if (mode === "text" && buffer) {
                    if (!tracker.firstTokenAt) tracker.firstTokenAt = performance.now();
                    this.applyChatboxAssistantUpdate(assistantMessage, buffer, "");
                    this.refreshChatboxUi(true);
                    parsedAnything = true;
                    buffer = "";
                }

                if (done) break;
            }

            if (buffer.trim()) {
                const result = this.processChatboxStreamEvent(buffer, assistantMessage, tracker);
                parsedAnything = parsedAnything || result.changed;
                if (!result.changed && mode === "text") {
                    if (!tracker.firstTokenAt) tracker.firstTokenAt = performance.now();
                    this.applyChatboxAssistantUpdate(assistantMessage, buffer, "");
                    this.refreshChatboxUi(true);
                    parsedAnything = true;
                }
            }

            return { parsedAnything, done: false };
        },
        applyChatboxFinalPayload(payload, assistantMessage, tracker) {
            const choice = payload?.choices?.[0];
            const rawText = this.mergeChatboxText(
                this.extractChatboxChunkContent(payload),
                this.extractChatboxText(payload?.output?.[0]?.content),
                this.extractChatboxText(payload?.response?.output_text)
            );
            const reasoningText = this.extractChatboxChunkReasoning(payload, false);

            if ((rawText || reasoningText) && !tracker.firstTokenAt) tracker.firstTokenAt = performance.now();
            this.applyChatboxAssistantUpdate(assistantMessage, rawText, reasoningText);
            tracker.metrics = this.mergeChatboxMetrics(tracker.metrics, this.extractChatboxMetrics(payload));

            if (choice?.finish_reason) assistantMessage.finishReason = choice.finish_reason;
        },
        failChatboxAssistantMessage(assistantMessage, messageText, finishReason = "client_error") {
            assistantMessage.pending = false;
            assistantMessage.finishReason = finishReason;
            assistantMessage.content = messageText;
            assistantMessage.rawContent = messageText;
            assistantMessage.reasoning = "";
            assistantMessage.reasoningRaw = "";
            this.refreshChatboxUi();
        },
        async dispatchChatboxMessage(content) {
            if (!content || this.chatbox.sending) return;

            this.chatbox.error = "";
            this.chatbox.status = "";
            const conversation = this.ensureChatboxConversation();
            const userMessage = this.createChatboxMessage("user", content);
            const assistantMessage = this.createChatboxMessage("assistant", "", {
                rawContent: "",
                reasoningRaw: "",
                pending: true,
            });

            this.replaceChatboxConversationMessages(conversation, [...conversation.messages, userMessage, assistantMessage]);
            this.touchChatboxConversation(conversation, content);
            this.chatbox.sending = true;
            await this.$nextTick();
            this.refreshChatboxUi(true);

            if (!this.chatboxChatEndpoint) {
                this.failChatboxAssistantMessage(assistantMessage, "Set the API root before sending a message.");
                this.chatbox.sending = false;
                return;
            }
            if (!this.chatbox.settings.model.trim()) {
                this.failChatboxAssistantMessage(assistantMessage, "Select or enter a model before sending a message.");
                this.chatbox.sending = false;
                return;
            }

            let extraBody;
            try {
                extraBody = this.parseChatboxExtraBody();
            } catch (error) {
                this.failChatboxAssistantMessage(assistantMessage, error.message || "Extra body JSON is invalid.");
                this.chatbox.sending = false;
                return;
            }

            const requestMessages = this.buildChatboxMessages(
                content,
                conversation.messages.slice(0, Math.max(0, conversation.messages.length - 2))
            );

            const requestBody = {
                model: this.chatbox.settings.model.trim(),
                messages: requestMessages,
                stream: Boolean(this.chatbox.settings.stream),
            };

            const temperature = this.parseChatboxNumber(this.chatbox.settings.temperature);
            if (typeof temperature === "number") requestBody.temperature = temperature;
            const maxTokens = this.parseChatboxInteger(this.chatbox.settings.maxTokens);
            if (typeof maxTokens === "number") requestBody.max_tokens = maxTokens;
            const topP = this.parseChatboxNumber(this.chatbox.settings.topP);
            if (typeof topP === "number") requestBody.top_p = topP;
            const topK = this.parseChatboxInteger(this.chatbox.settings.topK);
            if (typeof topK === "number") requestBody.top_k = topK;
            const minP = this.parseChatboxNumber(this.chatbox.settings.minP);
            if (typeof minP === "number") requestBody.min_p = minP;
            const repeatPenalty = this.parseChatboxNumber(this.chatbox.settings.repeatPenalty);
            if (typeof repeatPenalty === "number") requestBody.repeat_penalty = repeatPenalty;
            const presencePenalty = this.parseChatboxNumber(this.chatbox.settings.presencePenalty);
            if (typeof presencePenalty === "number") requestBody.presence_penalty = presencePenalty;
            const frequencyPenalty = this.parseChatboxNumber(this.chatbox.settings.frequencyPenalty);
            if (typeof frequencyPenalty === "number") requestBody.frequency_penalty = frequencyPenalty;
            const seed = this.parseChatboxInteger(this.chatbox.settings.seed);
            if (typeof seed === "number") requestBody.seed = seed;

            const stop = this.parseChatboxStopSequences();
            if (stop.length) requestBody.stop = stop;

            if (this.chatbox.settings.thinkMode === "on") requestBody.think = true;
            if (this.chatbox.settings.thinkMode === "off") requestBody.think = false;

            Object.assign(requestBody, extraBody);

            const controller = new AbortController();
            this.chatboxAbortController = controller;
            const tracker = {
                startedAt: performance.now(),
                firstTokenAt: null,
                finishedAt: null,
                metrics: null,
            };

            try {
                const response = await fetch(this.chatboxChatEndpoint, {
                    method: "POST",
                    headers: this.buildChatboxHeaders(true),
                    body: JSON.stringify(requestBody),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(await this.extractChatboxError(response));
                }

                const contentType = (response.headers.get("content-type") || "").toLowerCase();
                if (requestBody.stream && response.body) {
                    await this.consumeChatboxStream(response, assistantMessage, tracker, contentType);
                } else {
                    const payload = await response.json();
                    this.applyChatboxFinalPayload(payload, assistantMessage, tracker);
                }

                tracker.finishedAt = performance.now();
                assistantMessage.pending = false;
                assistantMessage.metrics = this.finalizeChatboxMetrics(tracker);

                if (!assistantMessage.content && !assistantMessage.reasoning) {
                    assistantMessage.content = "The endpoint returned successfully, but no text content was found.";
                }

                if (this.chatbox.activeConversationId === conversation.id) {
                    this.chatbox.status = "Response completed.";
                }
                this.refreshChatboxUi();
            } catch (error) {
                const aborted = error && error.name === "AbortError";
                assistantMessage.pending = false;
                if (!assistantMessage.content && !assistantMessage.reasoning && !aborted) {
                    assistantMessage.content = "No displayable text was parsed from the streaming response.";
                    assistantMessage.rawContent = assistantMessage.content;
                }
                if (!assistantMessage.content && !assistantMessage.reasoning && aborted) {
                    this.replaceChatboxConversationMessages(
                        conversation,
                        conversation.messages.filter((message) => message.id !== assistantMessage.id)
                    );
                }
                if (this.chatbox.activeConversationId === conversation.id) {
                    this.chatbox.error = aborted ? "" : error.message || "Request failed.";
                    this.chatbox.status = aborted ? "Response stopped." : "";
                }
                this.refreshChatboxUi();
            } finally {
                this.chatbox.sending = false;
                this.chatboxAbortController = null;
                this.touchChatboxConversation(conversation);
                if (this.chatbox.activeConversationId === conversation.id) {
                    this.chatbox.messages = conversation.messages.slice();
                }
                this.refreshChatboxUi(true);
            }
        },
        async sendChatboxMessage() {
            const content = this.chatbox.draft.trim();
            if (!content || this.chatbox.sending) return;
            this.chatbox.draft = "";
            await this.$nextTick();
            await this.dispatchChatboxMessage(content);
        },
        formatChatboxTime(value) {
            try {
                return new Date(value).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                });
            } catch (error) {
                return "";
            }
        },
        formatChatboxConversationTime(value) {
            try {
                return new Date(value).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                });
            } catch (error) {
                return "";
            }
        },
        formatChatboxInteger(value) {
            if (!Number.isFinite(value)) return "";
            return Math.round(value).toLocaleString();
        },
        formatChatboxRate(value) {
            if (!Number.isFinite(value)) return "";
            return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} t/s`;
        },
        formatChatboxDuration(value) {
            if (!Number.isFinite(value)) return "";
            if (value >= 1000) return `${(value / 1000).toFixed(2)} s`;
            return `${Math.round(value)} ms`;
        },
        hasChatboxMetrics(message) {
            const metrics = message?.metrics;
            if (!metrics || message?.metricsDismissed) return false;
            return [
                metrics.promptTokens,
                metrics.completionTokens,
                metrics.prefillSpeed,
                metrics.decodeSpeed,
                metrics.ttftMs,
                metrics.totalDurationMs,
            ].some((value) => Number.isFinite(value));
        },
        getChatboxMessageBodyText(message) {
            if (!message) return "";
            if (message.role !== "assistant") return message.content;
            if (message.content) return message.content;
            if (message.rawContent) return this.normalizeChatboxText(message.rawContent.replace(/<\/?think>/gi, ""));
            if (!this.chatbox.settings.showThinking && message.reasoning) return "Reasoning hidden.";
            if (message.pending) return "Waiting for first token...";
            return "";
        },
    },
};
