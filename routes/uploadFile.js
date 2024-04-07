const { exec } = require("child_process");
const fs = require("fs");

function runPythonScript() {
  return new Promise((resolve, reject) => {
    exec("python main.py", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error}`);
        reject(error);
        return;
      }
      console.log(`Output: ${stdout}`);
      resolve(stdout);
    });
  });
}

async function processOutput() {
  try {
    const output = await runPythonScript();
    const lines = output.split("\n");
    const apiKey = "971d2de9105ee2ad9f60172add0ff130";
    const tmpFileLine = lines.find((line) => line.includes("/tmp"));
    if (tmpFileLine) {
      const tmpFilePath = tmpFileLine.trim();
      console.log(tmpFilePath);
      // Read the file from /tmp
      const fileContent = fs.readFileSync(tmpFilePath);
      const base64Image = fileContent.toString("base64");
      const requestBody = new FormData();
      requestBody.append("image", base64Image);

      // Upload the file to imgbb API
      const response = await fetch(
        "https://api.imgbb.com/1/upload?key=" + apiKey,
        {
          method: "POST",
          body: requestBody,
        },
      );
      const jsonResponse = await response.json();

      console.log("Image uploaded successfully:", jsonResponse.data.url);
      return jsonResponse.data.url;
    } else {
      console.log("No file path found in output.");
    }
  } catch (error) {
    console.error("Error processing output:", error);
  }
}
module.exports = { processOutput };
