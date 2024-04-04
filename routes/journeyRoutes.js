const express = require("express");

const axios = require("axios");
require("dotenv").config();
const router = express.Router();
const token = process.env.MIDJOURNEY_TOKEN;
const BASE_URL = "https://api.mymidjourney.ai/api/v1/midjourney";
const instance = axios.create({
  timeout: 0, // Set timeout to 0 for no timeout
});

const checkProgress = async (messageId, token) => {
  try {
    const config = {
      method: "get",
      url: `${BASE_URL}/message/${messageId}`,
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
    console.log(body);
    const responses = [];
    const config = {
      method: "post",
      url: `${BASE_URL}/imagine`,
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
    const response2 = await axios(config);
    const messageId2 = response2.data.messageId;
    console.log(messageId);
    console.log(messageId2);

    // Counter to keep track of completed intervals
    let completedIntervals = 0;

    const interval1 = setInterval(async () => {
      try {
        const progressResponse = await checkProgress(messageId, token);
        if (progressResponse.status === "DONE") {
          clearInterval(interval1);
          responses.push(progressResponse);
          completedIntervals++;
          if (completedIntervals === 2) {
            res.status(200).json(responses);
          }
        }
      } catch (error) {
        clearInterval(interval1);
        res.status(500).json({ error: "Error in checking progress" });
      }
    }, 3000);

    const interval2 = setInterval(async () => {
      try {
        const progressResponse = await checkProgress(messageId2, token);
        if (progressResponse.status === "DONE") {
          clearInterval(interval2);
          responses.push(progressResponse);
          completedIntervals++;
          if (completedIntervals === 2) {
            res.status(200).json(responses);
          }
        }
      } catch (error) {
        clearInterval(interval2);
        res.status(500).json({ error: "Error in checking progress" });
      }
    }, 3000);
  } catch (error) {
    console.error("Error in generation request:", error);
    res.status(500).json({ error: "Error in your response request" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    const config = {
      method: "post",
      url: `${BASE_URL}/imagine`,
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
    console.log(messageId);

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
    }, 3000);
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

router.post("/edit", async (req, res) => {
  try {
    const body = req.body;
    const config = {
      method: "post",
      url: `${BASE_URL}/imagine`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        prompt: `${body.imgUrl} ${body.prompt}`,
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
    }, 3000);
  } catch (error) {
    console.error("Error in Editing request:", error);
    res.status(500).json({ error: "Error in editing this photo" });
  }
});

module.exports = router;
