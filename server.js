import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Serve HTML (frontend)
app.use(express.static(path.join(__dirname, "public")));

// API route
app.post("/generate-session", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.json({ success: false, message: "Phone number required" });

  try {
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${phone}`);
    const sock = makeWASocket({ auth: state, printQRInTerminal: true });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection } = update;
      if (connection === "open") {
        const sessionData = fs.readFileSync(`./sessions/${phone}/creds.json`, "utf8");

        res.json({ success: true, sessionId: sessionData });

        sock.sendMessage(phone + "@s.whatsapp.net", { text: `Your session for MASKY_BOT_MD_V4:\n${sessionData}` });
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to generate session" });
  }
});

app.listen(PORT, () => console.log(`✅ MASKY_BOT_MD_V4 running on port ${PORT}`));
