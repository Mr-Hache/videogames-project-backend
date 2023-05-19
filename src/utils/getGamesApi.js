const axios = require('axios');    

const getGamesApi = async(key, dataForApi,size,genre) =>{ 
 try{
  const request = dataForApi.map((pageForApi) => {
    return axios.get(`https://api.rawg.io/api/games`,{
      params:{
        key,
        page: pageForApi,
        page_size: size,
        genres: genre
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

