
const { google } = require("googleapis");
const { authorize } = require("./utils");

async function deleteMessageByLabels(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.labels.list({
    userId: "me",
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log("No labels found.");
    return;
  }

  // delete spam email every week

  const reps = await await gmail.users.messages.list({
    userId: "me",
    includeSpamTrash: true,
    maxResults: 500,
    labelIds: [
      // "CATEGORY_PERSONAL",
      // "CATEGORY_PROMOTIONS",
      "CATEGORY_SOCIAL",
    ],
  });
  const messages = reps.data.messages;
  console.log("Found: ", messages?.length);
  if (messages?.length > 0) {
    const messageId = messages.map((message) => [message.id]);
    const res = await gmail.users.messages.batchDelete({
      userId: "me",
      requestBody: {
        ids: [messageId],
      },
    });
  } else {
    console.log("No messages found.");
  }

  console.log("DONE! ");
}

authorize().then(deleteMessageByLabels).catch(console.error);
