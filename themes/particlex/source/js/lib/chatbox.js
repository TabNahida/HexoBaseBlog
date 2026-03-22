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
                conversations: [],
                activeConversationId: "",
                viewConversationId: "",
                viewMessages: [],
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
        setChatboxState(patch) {
            this.chatbox = {
                ...this.chatbox,
                ...(patch || {}),
            };
            return this.chatbox;
        },
        resolveChatboxConversationId(conversationOrId) {
            if (!conversationOrId) return "";
            return typeof conversationOrId === "string" ? conversationOrId : conversationOrId.id || "";
        },
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
        pickChatboxText(...parts) {
            for (const part of parts) {
                if (typeof part === "string" && part.length) return part;
            }
            return "";
        },
        mergeChatboxStreamText(existing = "", incoming = "") {
            if (!incoming) return existing || "";
            if (!existing) return incoming;
            if (incoming === existing) return existing;
            if (incoming.startsWith(existing)) return incoming;
            if (existing.endsWith(incoming)) return existing;
            return `${existing}${incoming}`;
        },
        combineChatboxReasoning(primary = "", secondary = "") {
            const first = this.normalizeChatboxText(primary);
            const second = this.normalizeChatboxText(secondary);
            if (!first) return second;
            if (!second) return first;
            if (first === second) return first;
            if (first.includes(second)) return first;
            if (second.includes(first)) return second;
            return `${first}\n\n${second}`;
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
            this.setChatboxState({
                conversations: [conversation, ...this.chatbox.conversations],
                activeConversationId: conversation.id,
                search: "",
            });
            this.cancelEditChatboxMessage();
            this.syncChatboxView();
            return conversation;
        },
        getChatboxConversationById(conversationId = this.chatbox.activeConversationId) {
            return this.chatbox.conversations.find((conversation) => conversation.id === conversationId) || null;
        },
        commitChatboxConversation(updatedConversation, promote = false) {
            if (!updatedConversation?.id) return null;
            const currentIndex = this.chatbox.conversations.findIndex((item) => item.id === updatedConversation.id);
            if (currentIndex === -1) return null;

            const normalized = {
                ...updatedConversation,
                messages: Array.isArray(updatedConversation.messages) ? updatedConversation.messages.slice() : [],
            };
            const rest = this.chatbox.conversations.filter((item) => item.id !== normalized.id);

            let nextConversations;
            if (promote) {
                nextConversations = [normalized, ...rest];
            } else {
                const insertIndex = Math.min(currentIndex, rest.length);
                nextConversations = [
                    ...rest.slice(0, insertIndex),
                    normalized,
                    ...rest.slice(insertIndex),
                ];
            }

            if (!this.chatbox.activeConversationId || this.chatbox.activeConversationId === normalized.id) {
                this.setChatboxState({
                    conversations: nextConversations,
                    viewConversationId: normalized.id,
                    viewMessages: normalized.messages.map((message) => this.cloneChatboxMessage(message)),
                });
            } else {
                this.setChatboxState({
                    conversations: nextConversations,
                });
            }

            return normalized;
        },
        cloneChatboxMessage(message) {
            if (!message || typeof message !== "object") return message;
            return {
                ...message,
                metrics:
                    message.metrics && typeof message.metrics === "object" ? { ...message.metrics } : message.metrics || null,
            };
        },
        syncChatboxViewState() {
            const active = this.getChatboxConversationById();
            const nextConversationId = active?.id || "";
            const nextMessages = Array.isArray(active?.messages)
                ? active.messages.map((message) => this.cloneChatboxMessage(message))
                : [];

            this.setChatboxState({
                viewConversationId: nextConversationId,
                viewMessages: nextMessages,
            });
            return active;
        },
        syncChatboxView(scrollToBottom = false) {
            this.syncChatboxViewState();
            this.$nextTick(() => this.refreshChatboxUi(scrollToBottom));
        },
        patchChatboxConversation(conversation, updater, options = {}) {
            const conversationId = this.resolveChatboxConversationId(conversation);
            if (!conversationId) return null;
            const current = this.getChatboxConversationById(conversationId);
            if (!current) return null;

            const draft = {
                ...current,
                messages: Array.isArray(current.messages) ? current.messages.map((message) => ({ ...message })) : [],
            };
            const next = typeof updater === "function" ? updater(draft) || draft : draft;
            const updated = {
                ...current,
                ...next,
                messages: Array.isArray(next.messages) ? next.messages.slice() : draft.messages.slice(),
            };

            if (options.touch) updated.updatedAt = Date.now();
            if (options.titleSource && (!updated.title || updated.title === "New chat")) {
                updated.title = this.truncateChatboxConversationTitle(options.titleSource);
            }

            return this.commitChatboxConversation(updated, Boolean(options.promote));
        },
        getChatboxMessageById(messageId, conversationId = this.chatbox.activeConversationId) {
            const conversation = this.getChatboxConversationById(conversationId);
            if (!conversation || !Array.isArray(conversation.messages)) return null;
            return conversation.messages.find((message) => message.id === messageId) || null;
        },
        patchChatboxMessage(conversationId, messageId, updater, options = {}) {
            return this.patchChatboxConversation(
                conversationId,
                (conversation) => {
                    let updatedMessage = null;
                    const messages = conversation.messages.map((message) => {
                        if (message.id !== messageId) return message;
                        updatedMessage = typeof updater === "function" ? updater({ ...message }) || { ...message } : { ...message };
                        return updatedMessage;
                    });
                    return {
                        ...conversation,
                        messages,
                    };
                },
                options
            );
        },
        ensureChatboxConversation() {
            const conversation = this.getChatboxConversationById();
            if (conversation) return conversation;
            return this.createChatboxConversation();
        },
        touchChatboxConversation(conversation, titleSource = "") {
            return this.patchChatboxConversation(conversation, null, {
                touch: true,
                promote: true,
                titleSource,
            });
        },
        replaceChatboxConversationMessages(conversation, messages) {
            const updated = this.patchChatboxConversation(
                conversation,
                (current) => ({
                    ...current,
                    messages: Array.isArray(messages) ? messages.slice() : [],
                }),
                {
                    touch: true,
                    promote: true,
                }
            );
            this.syncChatboxView();
            return updated;
        },
        replaceChatboxMessages(messages) {
            this.replaceChatboxConversationMessages(this.chatbox.activeConversationId, messages);
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
                const restoredConversations = conversations
                    .filter((conversation) => conversation && typeof conversation === "object")
                    .map((conversation) => ({
                        id: conversation.id || `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                        title: conversation.title || "New chat",
                        createdAt: conversation.createdAt || Date.now(),
                        updatedAt: conversation.updatedAt || conversation.createdAt || Date.now(),
                        messages: Array.isArray(conversation.messages) ? conversation.messages.slice() : [],
                    }))
                    .sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0));
                this.setChatboxState({
                    conversations: restoredConversations,
                });

                if (!this.chatbox.conversations.length) {
                    this.createChatboxConversation();
                    return;
                }

                const targetId = saved?.activeConversationId;
                const active = this.chatbox.conversations.find((conversation) => conversation.id === targetId) || this.chatbox.conversations[0];
                this.setChatboxState({
                    activeConversationId: active.id,
                });
                this.syncChatboxViewState();
            } catch (error) {
                console.warn("Failed to restore chatbox conversations.", error);
                this.setChatboxState({
                    conversations: [],
                });
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
            this.setChatboxState({
                activeConversationId: conversation.id,
            });
            this.cancelEditChatboxMessage();
            this.chatbox.error = "";
            this.chatbox.status = "";
            this.syncChatboxView(true);
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
            return this.pickChatboxText(
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
            return this.pickChatboxText(
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
        applyChatboxAssistantUpdate(conversationId, messageId, rawText = "", reasoningText = "") {
            const current = this.getChatboxMessageById(messageId, conversationId);
            if (!current) {
                return {
                    rawContent: "",
                    reasoningRaw: "",
                    content: "",
                    reasoning: "",
                };
            }

            const nextRaw = rawText ? this.mergeChatboxStreamText(current.rawContent, rawText) : current.rawContent || "";
            const nextReasoningRaw = reasoningText
                ? this.mergeChatboxStreamText(current.reasoningRaw, reasoningText)
                : current.reasoningRaw || "";
            const parsed = this.splitChatboxThinking(nextRaw);
            const nextReasoning = this.combineChatboxReasoning(nextReasoningRaw, parsed.reasoning);

            this.patchChatboxMessage(
                conversationId,
                messageId,
                (message) => ({
                    ...message,
                    rawContent: nextRaw,
                    reasoningRaw: nextReasoningRaw,
                    content: parsed.content,
                    reasoning: nextReasoning,
                }),
                {
                    promote: false,
                    touch: false,
                }
            );

            return {
                rawContent: nextRaw,
                reasoningRaw: nextReasoningRaw,
                content: parsed.content,
                reasoning: nextReasoning,
            };
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
            return this.chatbox.viewMessages.findIndex((message) => message.id === messageId);
        },
        startEditChatboxMessage(messageId) {
            const index = this.findChatboxMessageIndex(messageId);
            if (index === -1) return;
            const message = this.chatbox.viewMessages[index];
            if (message.role !== "user") return;
            this.setChatboxState({
                editingMessageId: messageId,
                editingDraft: message.content || message.rawContent || "",
            });
        },
        cancelEditChatboxMessage() {
            this.setChatboxState({
                editingMessageId: "",
                editingDraft: "",
            });
        },
        async saveEditedChatboxMessage(messageId) {
            const index = this.findChatboxMessageIndex(messageId);
            if (index === -1) return;
            const nextText = this.chatbox.editingDraft.trim();
            if (!nextText) {
                this.chatbox.error = "Edited user message cannot be empty.";
                return;
            }

            const message = this.chatbox.viewMessages[index];
            if (message.role !== "user") return;

            this.cancelEditChatboxMessage();
            this.chatbox.status = "User message updated.";
            await this.rerunChatboxFromUserMessage(messageId, nextText);
        },
        getChatboxResendTargetId(messageId) {
            const index = this.findChatboxMessageIndex(messageId);
            if (index === -1) return "";

            const current = this.chatbox.viewMessages[index];
            if (current.role === "user") return current.id;

            for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
                if (this.chatbox.viewMessages[cursor].role === "user") return this.chatbox.viewMessages[cursor].id;
            }

            return "";
        },
        async resendChatboxFromMessage(messageId, overrideText) {
            const targetId = this.getChatboxResendTargetId(messageId);
            this.cancelEditChatboxMessage();
            this.chatbox.status = "Re-sending response.";
            await this.rerunChatboxFromUserMessage(targetId, overrideText);
        },
        deleteChatboxConversation(conversationId) {
            const index = this.chatbox.conversations.findIndex((conversation) => conversation.id === conversationId);
            if (index === -1) return;

            const isActive = this.chatbox.activeConversationId === conversationId;
            if (isActive && this.chatbox.sending) this.abortChatboxRequest();

            this.setChatboxState({
                conversations: this.chatbox.conversations.filter((conversation) => conversation.id !== conversationId),
            });
            this.cancelEditChatboxMessage();
            this.chatbox.error = "";

            if (!this.chatbox.conversations.length) {
                this.createChatboxConversation();
                this.chatbox.status = "Conversation deleted.";
                this.syncChatboxView();
                return;
            }

            if (isActive) {
                const nextConversation =
                    this.chatbox.conversations[Math.min(index, this.chatbox.conversations.length - 1)] || this.chatbox.conversations[0];
                this.setChatboxState({
                    activeConversationId: nextConversation.id,
                });
            }

            this.chatbox.status = "Conversation deleted.";
            this.syncChatboxView(isActive);
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
        buildChatboxMessages(userMessage, historyMessages = this.getChatboxConversationById()?.messages || []) {
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
            const raw = typeof payload === "string" ? payload : "";
            const probe = raw.trim();
            if (!probe) return [];
            if (probe === "[DONE]") return ["[DONE]"];

            const parsed = [];
            const candidates = [probe];
            if (raw.includes("\n")) {
                raw
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

            if (!parsed.length && !probe.startsWith("{") && !probe.startsWith("[") && !/^event:/i.test(probe)) {
                parsed.push(raw.replace(/\r/g, ""));
            }

            return parsed;
        },
        processChatboxStreamPayload(payload, conversationId, assistantMessageId, tracker) {
            const rawPayload = typeof payload === "string" ? payload : "";
            if (!rawPayload.trim()) {
                return {
                    done: false,
                    changed: false,
                };
            }

            const beforeMessage = this.getChatboxMessageById(assistantMessageId, conversationId);
            const beforeRaw = beforeMessage?.rawContent || "";
            const beforeReasoning = beforeMessage?.reasoningRaw || "";
            const events = this.parseChatboxStreamPayloads(rawPayload);
            if (events.includes("[DONE]")) {
                const afterMessage = this.getChatboxMessageById(assistantMessageId, conversationId);
                return {
                    done: true,
                    changed:
                        beforeRaw !== (afterMessage?.rawContent || "") ||
                        beforeReasoning !== (afterMessage?.reasoningRaw || ""),
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
                    this.applyChatboxAssistantUpdate(conversationId, assistantMessageId, event, "");
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
                this.applyChatboxAssistantUpdate(conversationId, assistantMessageId, rawText, reasoningText);
                tracker.metrics = this.mergeChatboxMetrics(tracker.metrics, this.extractChatboxMetrics(json));

                if (choice?.finish_reason) {
                    this.patchChatboxMessage(
                        conversationId,
                        assistantMessageId,
                        (message) => ({
                            ...message,
                            finishReason: choice.finish_reason,
                        }),
                        {
                            promote: false,
                            touch: false,
                        }
                    );
                }
            }

            const afterMessage = this.getChatboxMessageById(assistantMessageId, conversationId);
            const changed =
                beforeRaw !== (afterMessage?.rawContent || "") ||
                beforeReasoning !== (afterMessage?.reasoningRaw || "");
            if (changed) this.refreshChatboxUi(true);
            return {
                done: false,
                changed,
            };
        },
        processChatboxStreamEvent(block, conversationId, assistantMessageId, tracker) {
            const rawBlock = typeof block === "string" ? block : "";
            const probe = rawBlock.trim();
            if (!probe) {
                return {
                    done: false,
                    changed: false,
                };
            }

            const dataLines = rawBlock
                .split(/\r?\n/)
                .filter((line) => /^\s*data:/i.test(line))
                .map((line) => line.replace(/^\s*data:\s?/i, ""));
            if (dataLines.length) {
                return this.processChatboxStreamPayload(dataLines.join("\n"), conversationId, assistantMessageId, tracker);
            }

            if (/^(event:|id:|retry:)/im.test(probe) && !/\bdata:/im.test(rawBlock)) {
                return {
                    done: false,
                    changed: false,
                };
            }

            return this.processChatboxStreamPayload(rawBlock, conversationId, assistantMessageId, tracker);
        },
        async consumeChatboxStream(response, conversationId, assistantMessageId, tracker, contentType = "") {
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
                    if (/\r?\n\r?\n/.test(buffer)) {
                        const events = buffer.split(/\r?\n\r?\n/);
                        buffer = events.pop() || "";

                        for (const event of events) {
                            const result = this.processChatboxStreamEvent(event, conversationId, assistantMessageId, tracker);
                            parsedAnything = parsedAnything || result.changed;
                            if (result.done) {
                                return { parsedAnything, done: true };
                            }
                        }
                    } else if (buffer.includes("\n")) {
                        const lines = buffer.split(/\r?\n/);
                        buffer = done ? "" : lines.pop() || "";

                        for (const line of lines) {
                            if (!line.trim()) continue;
                            const result = this.processChatboxStreamEvent(line, conversationId, assistantMessageId, tracker);
                            parsedAnything = parsedAnything || result.changed;
                            if (result.done) {
                                return { parsedAnything, done: true };
                            }
                        }
                    }
                } else if (mode === "jsonl") {
                    const lines = buffer.split(/\r?\n/);
                    buffer = done ? "" : lines.pop() || "";

                    for (const line of lines) {
                        const result = this.processChatboxStreamEvent(line, conversationId, assistantMessageId, tracker);
                        parsedAnything = parsedAnything || result.changed;
                        if (result.done) {
                            return { parsedAnything, done: true };
                        }
                    }
                } else if (mode === "text" && buffer) {
                    if (!tracker.firstTokenAt) tracker.firstTokenAt = performance.now();
                    this.applyChatboxAssistantUpdate(conversationId, assistantMessageId, buffer, "");
                    this.refreshChatboxUi(true);
                    parsedAnything = true;
                    buffer = "";
                }

                if (done) break;
            }

            if (buffer.trim()) {
                const result = this.processChatboxStreamEvent(buffer, conversationId, assistantMessageId, tracker);
                parsedAnything = parsedAnything || result.changed;
                if (!result.changed && mode === "text") {
                    if (!tracker.firstTokenAt) tracker.firstTokenAt = performance.now();
                    this.applyChatboxAssistantUpdate(conversationId, assistantMessageId, buffer, "");
                    this.refreshChatboxUi(true);
                    parsedAnything = true;
                }
            }

            return { parsedAnything, done: false };
        },
        applyChatboxFinalPayload(payload, conversationId, assistantMessageId, tracker) {
            const choice = payload?.choices?.[0];
            const rawText = this.pickChatboxText(
                this.extractChatboxChunkContent(payload),
                this.extractChatboxText(payload?.output?.[0]?.content),
                this.extractChatboxText(payload?.response?.output_text)
            );
            const reasoningText = this.extractChatboxChunkReasoning(payload, false);

            if ((rawText || reasoningText) && !tracker.firstTokenAt) tracker.firstTokenAt = performance.now();
            this.applyChatboxAssistantUpdate(conversationId, assistantMessageId, rawText, reasoningText);
            tracker.metrics = this.mergeChatboxMetrics(tracker.metrics, this.extractChatboxMetrics(payload));

            if (choice?.finish_reason) {
                this.patchChatboxMessage(
                    conversationId,
                    assistantMessageId,
                    (message) => ({
                        ...message,
                        finishReason: choice.finish_reason,
                    }),
                    {
                        promote: false,
                        touch: false,
                    }
                );
            }
        },
        failChatboxAssistantMessage(conversationId, assistantMessageId, messageText, finishReason = "client_error") {
            this.patchChatboxMessage(
                conversationId,
                assistantMessageId,
                (message) => ({
                    ...message,
                    pending: false,
                    finishReason,
                    content: messageText,
                    rawContent: messageText,
                    reasoning: "",
                    reasoningRaw: "",
                }),
                {
                    promote: false,
                    touch: false,
                }
            );
            this.refreshChatboxUi();
        },
        buildChatboxRequestBody(content, historyMessages, extraBody) {
            const requestBody = {
                model: this.chatbox.settings.model.trim(),
                messages: this.buildChatboxMessages(content, historyMessages),
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
            return requestBody;
        },
        async requestChatboxAssistantResponse(conversationId, assistantMessageId, content, historyMessages) {
            if (!content || this.chatbox.sending) return;

            this.setChatboxState({
                sending: true,
            });
            await this.$nextTick();
            this.refreshChatboxUi(true);

            if (!this.chatboxChatEndpoint) {
                this.failChatboxAssistantMessage(conversationId, assistantMessageId, "Set the API root before sending a message.");
                this.setChatboxState({
                    sending: false,
                });
                return;
            }
            if (!this.chatbox.settings.model.trim()) {
                this.failChatboxAssistantMessage(
                    conversationId,
                    assistantMessageId,
                    "Select or enter a model before sending a message."
                );
                this.setChatboxState({
                    sending: false,
                });
                return;
            }

            let extraBody;
            try {
                extraBody = this.parseChatboxExtraBody();
            } catch (error) {
                this.failChatboxAssistantMessage(
                    conversationId,
                    assistantMessageId,
                    error.message || "Extra body JSON is invalid."
                );
                this.setChatboxState({
                    sending: false,
                });
                return;
            }

            const requestBody = this.buildChatboxRequestBody(content, historyMessages, extraBody);

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
                    await this.consumeChatboxStream(response, conversationId, assistantMessageId, tracker, contentType);
                } else {
                    const payload = await response.json();
                    this.applyChatboxFinalPayload(payload, conversationId, assistantMessageId, tracker);
                }

                tracker.finishedAt = performance.now();
                const finalMetrics = this.finalizeChatboxMetrics(tracker);
                this.patchChatboxMessage(
                    conversationId,
                    assistantMessageId,
                    (message) => ({
                        ...message,
                        pending: false,
                        metrics: finalMetrics,
                        content:
                            !message.content && !message.reasoning
                                ? "The endpoint returned successfully, but no text content was found."
                                : message.content,
                        rawContent:
                            !message.content && !message.reasoning && !message.rawContent
                                ? "The endpoint returned successfully, but no text content was found."
                                : message.rawContent,
                    }),
                    {
                        promote: false,
                        touch: false,
                    }
                );

                if (this.chatbox.activeConversationId === conversationId) {
                    this.chatbox.status = "Response completed.";
                }
                this.refreshChatboxUi();
            } catch (error) {
                const aborted = error && error.name === "AbortError";
                const currentAssistant = this.getChatboxMessageById(assistantMessageId, conversationId);
                this.patchChatboxMessage(
                    conversationId,
                    assistantMessageId,
                    (message) => ({
                        ...message,
                        pending: false,
                        content:
                            !message.content && !message.reasoning && !aborted
                                ? "No displayable text was parsed from the streaming response."
                                : message.content,
                        rawContent:
                            !message.content && !message.reasoning && !aborted
                                ? "No displayable text was parsed from the streaming response."
                                : message.rawContent,
                    }),
                    {
                        promote: false,
                        touch: false,
                    }
                );
                if (!currentAssistant?.content && !currentAssistant?.reasoning && aborted) {
                    const currentMessages = this.getChatboxConversationById(conversationId)?.messages || [];
                    this.replaceChatboxConversationMessages(
                        conversationId,
                        currentMessages.filter((message) => message.id !== assistantMessageId)
                    );
                }
                if (this.chatbox.activeConversationId === conversationId) {
                    this.chatbox.error = aborted ? "" : error.message || "Request failed.";
                    this.chatbox.status = aborted ? "Response stopped." : "";
                }
                this.refreshChatboxUi();
            } finally {
                this.setChatboxState({
                    sending: false,
                });
                this.chatboxAbortController = null;
                this.touchChatboxConversation(conversationId);
                this.refreshChatboxUi(true);
            }
        },
        async rerunChatboxFromUserMessage(messageId, overrideText) {
            const conversation = this.ensureChatboxConversation();
            const conversationId = conversation.id;
            const currentMessages = this.getChatboxConversationById(conversationId)?.messages || [];
            const index = currentMessages.findIndex((message) => message.id === messageId);
            if (index === -1) return;

            const currentUserMessage = currentMessages[index];
            if (currentUserMessage.role !== "user") return;

            const content = (typeof overrideText === "string" ? overrideText : currentUserMessage.content || currentUserMessage.rawContent || "").trim();
            if (!content) {
                this.chatbox.error = "Cannot send an empty message.";
                return;
            }

            const updatedUserMessage = {
                ...currentUserMessage,
                content,
                rawContent: content,
            };
            const assistantMessage = this.createChatboxMessage("assistant", "", {
                rawContent: "",
                reasoningRaw: "",
                pending: true,
            });
            const historyMessages = currentMessages.slice(0, index);

            this.chatbox.error = "";
            this.chatbox.status = "";
            this.replaceChatboxConversationMessages(conversationId, [...historyMessages, updatedUserMessage, assistantMessage]);
            this.touchChatboxConversation(conversationId, content);
            await this.requestChatboxAssistantResponse(conversationId, assistantMessage.id, content, historyMessages);
        },
        async dispatchChatboxMessage(content) {
            if (!content || this.chatbox.sending) return;

            this.chatbox.error = "";
            this.chatbox.status = "";
            const conversation = this.ensureChatboxConversation();
            const conversationId = conversation.id;
            const currentMessages = this.getChatboxConversationById(conversationId)?.messages || [];
            const historyMessages = currentMessages.slice();
            const userMessage = this.createChatboxMessage("user", content);
            const assistantMessage = this.createChatboxMessage("assistant", "", {
                rawContent: "",
                reasoningRaw: "",
                pending: true,
            });

            this.replaceChatboxConversationMessages(conversationId, [...historyMessages, userMessage, assistantMessage]);
            this.touchChatboxConversation(conversationId, content);
            await this.requestChatboxAssistantResponse(conversationId, assistantMessage.id, content, historyMessages);
        },
        async sendChatboxMessage() {
            const content = this.chatbox.draft.trim();
            if (!content || this.chatbox.sending) return;
            this.setChatboxState({
                draft: "",
            });
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
            if (!metrics) return false;
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
