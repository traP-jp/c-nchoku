type traQInfo = {
    apiBasePath: string;
    channelId: string;
    webhookId: string;
    webhookSecret: string;
};

function main() {
    const props = PropertiesService.getScriptProperties();
    const apiBasePath = props.getProperty("TRAQ_API_BASE_PATH");
    const channelId = props.getProperty("TRAQ_CHANNEL_ID");
    const webhookId = props.getProperty("TRAQ_WEBHOOK_ID");
    const webhookSecret = props.getProperty("TRAQ_WEBHOOK_SECRET");
    const message = props.getProperty("MESSAGE") ?? "ping";

    if (!channelId || !webhookId || !webhookSecret) {
        Logger.log("init failed");
        return;
    }

    const qInfo = {
        apiBasePath: apiBasePath ?? "https://q.trap.jp/api/v3",
        channelId,
        webhookId,
        webhookSecret,
    };

    postMessage(qInfo, message, true);
}

// https://github.com/H1rono/blog-notify/blob/0683955b070a10288a9b34a890e29cce5d3d803f/main.ts#L136-L153
function postMessage(
    { apiBasePath, channelId, webhookId, webhookSecret }: traQInfo,
    content: string,
    embed: boolean,
): GoogleAppsScript.URL_Fetch.HTTPResponse {
    const signature = hmacSha1(webhookSecret, content);
    const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
        method: "post",
        contentType: "text/plain; charset=utf-8",
        headers: {
            "X-TRAQ-Signature": signature,
            "X-TRAQ-Channel-Id": channelId,
        },
        payload: content,
    };
    const url = `${apiBasePath}/webhooks/${webhookId}?embed=${embed}`;
    return UrlFetchApp.fetch(url, params);
}

// https://github.com/H1rono/blog-notify/blob/0683955b070a10288a9b34a890e29cce5d3d803f/main.ts#L127-L134
function hmacSha1(key: string, message: string): string {
    const algorithm = Utilities.MacAlgorithm.HMAC_SHA_1;
    const charset = Utilities.Charset.UTF_8;
    return Utilities.computeHmacSignature(algorithm, message, key, charset)
        .map((v) => (v < 0 ? v + 256 : v))
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("");
}
