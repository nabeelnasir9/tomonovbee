const express = require("express");
const axios = require("axios");
const router = express.Router();
const token = process.env.X_API_KEY;
router.get("/", (_req, res) => {
  res.send("Hello world");
});
// https://i.pngimg.me/thumb/f/350/comrawpixel4066352.jpg Subject is a young Caucasians Female on island carrying abag on a stick and skipping carelessly.subjectis facing the camera. fullshot.photorealistic details.tarot card. --ar 1:2 --style raw

async function CheckProgress(reqid) {
  return new Promise((resolve, reject) => {
    const url = "https://api.midjourneyapi.xyz/mj/v2/fetch";
    const interval = setInterval(async () => {
      try {
        const rq = await axios.post(url, { task_id: reqid });
        if (rq.data.status === "finished") {
          clearInterval(interval);
          resolve(rq.data);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 3000);
  });
}

async function checkProgressSwap(reqid) {
  return new Promise((resolve, reject) => {
    const url = "https://api.goapi.xyz/api/face_swap/v1/fetch";
    const interval = setInterval(async () => {
      try {
        const rq = await axios.post(url, { task_id: reqid });
        if (rq.data.data.status === "success") {
          clearInterval(interval);
          resolve(rq.data);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 3000);
  });
}

router.post("/create2", async (req, res) => {
  try {
    const body = req.body;
    console.log(req.body);
    const makeRequest = async () => {
      const config = {
        headers: {
          "X-API-KEY": token,
        },
        data: {
          prompt: body.prompt,
          aspect_ratio: "1:2",
          process_mode: "relax",
          webhook_endpoint: "",
          webhook_secret: "",
        },
        url: "https://api.midjourneyapi.xyz/mj/v2/imagine",
        method: "post",
      };

      const answer = await axios(config);
      const response = answer.data;
      const taskResult = await CheckProgress(response.task_id);
      return taskResult;
    };

    const task1Promise = makeRequest();
    const task2Promise = makeRequest();

    const [taskResult1, taskResult2] = await Promise.all([
      task1Promise,
      task2Promise,
    ]);
    if (
      taskResult1.status === "finished" &&
      taskResult2.status === "finished"
    ) {
      res.status(200).json([
        {
          status: taskResult1.status,
          task_id: taskResult1.task_id,
          uri: taskResult1.task_result.image_url,
          process_time: taskResult1.process_time,
        },
        {
          status: taskResult2.status,
          task_id: taskResult2.task_id,
          uri: taskResult2.task_result.image_url,
          process_time: taskResult2.process_time,
        },
      ]);
    } else {
      res.status(202).json([
        {
          message: "At least one task is still processing",
          status1: taskResult1.status,
          status2: taskResult2.status,
        },
      ]);
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "An error occurred",
      error: error.message || JSON.stringify(error, null, 2),
    });
  }
});

router.post("/upscale", async (req, res) => {
  try {
    const body = req.body;
    console.log(req.body);
    const config = {
      headers: {
        "X-API-KEY": token,
      },
      data: {
        origin_task_id: `${body.messageId}`,
        index: `${body.upscale}`,
        webhook_endpoint: "",
        webhook_secret: "",
      },
      url: "https://api.midjourneyapi.xyz/mj/v2/upscale",
      method: "post",
    };
    const answer = await axios(config);
    const response = answer.data;

    const taskResult = await CheckProgress(response.task_id);
    if (taskResult.status === "finished") {
      res.status(200).json({
        status: taskResult.status,
        task_id: taskResult.task_id,
        uri: taskResult.task_result.image_url,
        process_time: taskResult.process_time,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occured",
      error: error.message,
    });
  }
});

router.post("/edit", async (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    const config = {
      headers: {
        "X-API-KEY": token,
      },
      data: {
        prompt: `${body.imgUrl} ${body.prompt}`,
        aspect_ratio: "1:2",
        process_mode: "relax",
        webhook_endpoint: "",
        webhook_secret: "",
      },
      url: "https://api.midjourneyapi.xyz/mj/v2/imagine",
      method: "post",
    };

    const answer = await axios(config);
    const response = answer.data;
    const taskResult = await CheckProgress(response.task_id);
    const id = taskResult.task_id;
    if (taskResult.status === "finished") {
      const config = {
        headers: {
          "X-API-KEY": token,
        },
        data: {
          origin_task_id: `${id}`,
          index: `1`,
          webhook_endpoint: "",
          webhook_secret: "",
        },
        url: "https://api.midjourneyapi.xyz/mj/v2/upscale",
        method: "post",
      };
      const answer = await axios(config);
      const response = answer.data;

      const taskResult2 = await CheckProgress(response.task_id);
      if (taskResult2.status === "finished") {
        res.status(200).json({
          status: taskResult2.status,
          task_id: taskResult2.task_id,
          uri: taskResult2.task_result.image_url,
          process_time: taskResult2.process_time,
        });
      }
    } else {
      res.status(400).json({
        message: "Error in Upscaling",
        error: error.message,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message || JSON.stringify(error, null, 2),
    });
  }
});

router.post("/faceswap", async (req, res) => {
  try {
    const body = req.body;
    console.log(req.body);
    const config = {
      headers: {
        "X-API-KEY": token,
        "Content-Type": "application/json",
      },
      method: "post",
      url: "https://api.goapi.xyz/api/face_swap/v1/async",
      data: {
        target_image: `${body.target}`,
        swap_image: `${body.source}`,
        result_type: "url",
      },
    };

    const answer = await axios(config);
    const task_id = answer.data.data.task_id;
    const taskResult = await checkProgressSwap(task_id);
    if (taskResult.data.status === "success") {
      res.status(200).json({
        status: taskResult.status,
        uri: taskResult.data.image,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message || JSON.stringify(error, null, 2),
    });
  }
});

module.exports = router;
