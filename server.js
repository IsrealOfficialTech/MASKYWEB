import express from "express";
import bodyParser from "body-parser";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import fs from "fs";

const app = express();
app.use(bodyParser.json());

app.post("/generate-session", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.json({ success: false, message: "Phone number required" });

  try {
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${phone}`);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "open") {
        const sessionData = fs.readFileSync(`./sessions/${phone}/creds.json`, "utf8");

        // send session back
        res.json({
          success: true,
          sessionId: sessionData
        });

        // Send session file to the user via WhatsApp
        sock.sendMessage(phone + "@s.whatsapp.net", { text: `Here is your session:\n${sessionData}` });
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to generate session" });
  }
});

app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));