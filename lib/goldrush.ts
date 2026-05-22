import { GoldRushClient } from "@covalenthq/client-sdk";

let _client: GoldRushClient | null = null;

export function getGoldRushClient(): GoldRushClient {
    if (!_client) {
        const apiKey = process.env.GOLDRUSH_API_KEY;
        if (!apiKey) {
            throw new Error("GOLDRUSH_API_KEY environment variable is not set");
        }
        _client = new GoldRushClient(apiKey);
    }
    return _client;
}
