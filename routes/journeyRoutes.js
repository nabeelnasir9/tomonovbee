const express = require("express");

const axios = require("axios");
require("dotenv").config();
const router = express.Router();
const token = process.env.MIDJOURNEY_TOKEN;

const checkProgress = async (messageId, token) => {
  try {
    const config = {
      method: "get",
      url: `https://api.mymidjourney.ai/api/v1/midjourney/message/${messageId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error("Error in fetching progress:", error);
    throw error;
  }
};

router.post("/create", async (req, res) => {
  try {
    const body = req.body;
    const config = {
      method: "post",
      url: "https://api.mymidjourney.ai/api/v1/midjourney/imagine",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        prompt: `${body.prompt}`,
      },
    };
    const response = await axios(config);
    const messageId = response.data.messageId;

    const interval = setInterval(async () => {
      try {
        const progressResponse = await checkProgress(messageId, token);
        if (progressResponse.status === "DONE") {
          clearInterval(interval);
          res.json(progressResponse);
        }
      } catch (error) {
        clearInterval(interval);
        res.status(500).json({ error: "Error in checking progress" });
      }
    }, 5000);
  } catch (error) {
    console.error("Error in generation request:", error);
    res.status(500).json({ error: "Error in your response request" });
  }
});

// router.get("/progress", async (req, res) => {
//   try {
//     const config = {
//       method: "get",
//       url: "https://api.mymidjourney.ai/api/v1/midjourney/message/7b0fe867-01e6-4972-9eff-998623cd4195",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     };
//     const response = await axios(config);
//     console.log(JSON.stringify(response.data));
//     res.json(response.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

module.exports = router;
