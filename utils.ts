import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import fs from "node:fs/promises";
import path from "node:path";

const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "keys.json");

export type Client =
  | Awaited<ReturnType<typeof authenticate>>
  | Awaited<ReturnType<typeof loadSavedCredentialsIfExist>>;

async function authorize() {
  const SCOPES = ["https://mail.google.com/"];
  let client: Client;
  client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client && client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content as unknown as string);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client: Client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content as unknown as string);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

export { authorize, loadSavedCredentialsIfExist, saveCredentials };
