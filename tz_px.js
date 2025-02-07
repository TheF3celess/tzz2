import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

export const checkTz = async (username) => {
  const proxyHost = "148.113.161.141";
  const proxyPort = "5959";
  const proxyUsername = username;
  const proxyPassword = process.env.JEDI;

  // Properly formatted proxy URL
  const proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
  const proxyAgent = new HttpsProxyAgent(proxyUrl);

  try {
    const response = await axios.get(
      "https://white-water-a7d6.mahdiidrissi2022.workers.dev/",
      {
        httpsAgent: proxyAgent,
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );
    const ipDetails = { timezone: response.data.trim() };
    return ipDetails.timezone || null;
  } catch (error) {
    console.error("Error fetching timezone:", error.message);
    return null;
  }
};
