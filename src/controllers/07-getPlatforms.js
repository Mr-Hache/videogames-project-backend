require("dotenv").config();
const { Platform } = require("../db.js");
const axios = require("axios");

const { API_KEY } = process.env;

const getPlatforms = async () => {
  try {
    const platforms = await Platform.findAll();
    if (platforms.length) return platforms;
    else {
      const platformsApi = await axios.get(
        `https://api.rawg.io/api/platforms?key=${API_KEY}`
      );
      const platformsApiData = platformsApi.data.results.map((platform) => ({
        name: platform.name,
        id: platform.id,
      }));
      await platformsApiData.map((platform) =>
        Platform.create({ name: platform.name, id: platform.id })
      );

      return platformsApiData;
    }
  } catch (error) {
    throw error;
  }
};

module.exports = getPlatforms;
