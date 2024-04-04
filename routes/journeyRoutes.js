const express = require("express");

const axios = require("axios");
require("dotenv").config();
const router = express.Router();
const token = process.env.MIDJOURNEY_TOKEN;
const instance = axios.create({
  timeout: 0, // Set timeout to 0 for no timeout
});

const checkProgress = async (messageId, token) => {
  try {
    const config = {
      method: "get",
      url: `https://api.mymidjourney.ai/api/v1/midjourney/message/${messageId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await instance(config);
    return response.data;
  } catch (error) {
    console.error("Error in fetching progress:", error);
    throw error;
  }
};

router.post("/create2", async (req, res) => {
  try {
    const body = req.body;
    const responses = [];

    // Hit the API twice
    for (let j = 0; j < 2; j++) {
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
      const response = await instance(config);
      const messageId = response.data.messageId;

      // Wait for the status to change to "DONE"
      while (true) {
        const progressResponse = await checkProgress(messageId, token);
        if (progressResponse.status === "DONE") {
          responses.push(progressResponse);
          break; // Break out of the loop once status is "DONE"
        }
        // Sleep for a while before checking again
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Sleep for 1 second
      }
    }

    // Send back both responses
    res.status(200).json(responses);
  } catch (error) {
    console.error("Error in generation request:", error);
    res.status(500).json({ error: "Error in your response request" });
  }
});

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
    const response = await instance(config);
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

router.post("/create2", async (req, res) => {
  try {
    const body = req.body;
    const responses = [];
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
    const response = await instance(config);
    for (let i = 0; i < 10; i++) {
      const messageId = response.data.messageId;
      const progressResponse = await checkProgress(messageId, token);
      if (progressResponse.status === "DONE") {
        responses.push(progressResponse);
      }
    }
  } catch (error) {
    console.error("Error in generation request:", error);
    res.status(500).json({ error: "Error in your response request" });
  }
});

router.post("/upscale", async (req, res) => {
  try {
    const body = req.body;
    const config = {
      method: "post",
      url: "https://api.mymidjourney.ai/api/v1/midjourney/button",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        messageId: `${body.messageId}`,
        button: `${body.upscale}`,
      },
    };
    const response = await instance(config);
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

// "messageId": "6de653a2-2e66-452b-8e6a-6146f58d4d9c",
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
