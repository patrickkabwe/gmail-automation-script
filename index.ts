import { google } from "googleapis";
import { authorize } from "./utils";

async function deleteMessageByLabels(auth: any) {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.labels.list({
    userId: "me",
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log("No labels found.");
    return;
  }

  const reps = await await gmail.users.messages.list({
    userId: "me",
    includeSpamTrash: true,
    maxResults: 200,
    labelIds: ["TRASH"],
  });
  const messages = reps.data.messages;
  console.log("Found: ", messages);
  if (messages && messages?.length > 0) {
    const messageId = messages.map((message) => message.id!);
    const res = await gmail.users.messages.batchDelete({
      userId: "me",
      requestBody: {
        ids: messageId,
      },
    });

    console.log("Deleted: ", res.data, res.status);
  } else {
    console.log("No messages found.");
  }

  console.log("DONE! ");
}

function main() {
  authorize().then(deleteMessageByLabels).catch(console.error);
}

main();
