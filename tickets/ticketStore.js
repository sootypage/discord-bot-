// tickets/ticketStore.js
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "data", "tickets");
fs.mkdirSync(DIR, { recursive: true });

function filePath(guildId) {
  return path.join(DIR, `${guildId}.json`);
}

function defaults() {
  return {
    nextId: 1,
    settings: {
      // set these with /ticket-setup
      categoryChannelId: null,  // a CATEGORY channel id
      supportRoleId: null,      // role that can see tickets
      logChannelId: null,       // optional
      ticketTypes: [
        { id: "support", label: "Support", description: "General help" },
        { id: "bug", label: "Bug Report", description: "Report a problem" },
        { id: "purchase", label: "Purchase", description: "Payments / store" },
        { id: "other", label: "Other", description: "Something else" },
      ],
    },
    openTickets: {
      // userId: { channelId, typeId, ticketNo }
    },
  };
}

function read(guildId) {
  const fp = filePath(guildId);
  if (!fs.existsSync(fp)) {
    const d = defaults();
    fs.writeFileSync(fp, JSON.stringify(d, null, 2));
    return d;
  }
  try {
    const d = JSON.parse(fs.readFileSync(fp, "utf8"));
    d.nextId ??= 1;
    d.settings ??= defaults().settings;
    d.openTickets ??= {};
    d.settings.ticketTypes ??= defaults().settings.ticketTypes;
    return d;
  } catch {
    const d = defaults();
    fs.writeFileSync(fp, JSON.stringify(d, null, 2));
    return d;
  }
}

function write(guildId, data) {
  fs.writeFileSync(filePath(guildId), JSON.stringify(data, null, 2));
}

module.exports = { read, write };