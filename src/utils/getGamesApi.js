const axios = require('axios');    

const getGamesApi = async(data) =>{ 
  const {key, pages, size, genre, platform, idPlatform} = data
 try{
  const request = pages.map((pageForApi) => {
    return axios.get(`https://api.rawg.io/api/games`,{
      params:{
        key,
        page: pageForApi,
        page_size: size,
        genres: genre,
        platforms: idPlatform,
        search: platform
      }
    })
  })
  const response = await Promise.all(request)

  const gamesApi = response.flatMap((res) => res.data.results)

  return gamesApi
 }catch(error){
    throw error
 }
}

module.exports = getGamesApi;

