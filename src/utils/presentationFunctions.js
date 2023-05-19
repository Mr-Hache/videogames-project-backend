const presentationInList = (listGames) => {
  const presentation = listGames.map((game) => {
    return {
      id: game.id,
      name: game.name,
      image: game.background_image? game.background_image : game.image,
      genres: game.genres.map((genre) => genre.name),
      rating: game.rating,
      platforms: game.platforms.map((platform) =>
        platform.platform ? platform.platform.name : platform.name
      ),
      released: game.released,
    };
  });
  return presentation;
};

const presentationInDetail = (game) => {
  return {
    id: game.id,
    name: game.name,
    description: game.description,
    image: game.background_image? game.background_image : game.image,
    genres: game.genres.map((genre) => genre.name),
    rating: game.rating,
    platforms: game.platforms.map((platform) =>
      platform.platform ? platform.platform.name : platform.name
    ),
    released: game.released,
  };
};

module.exports = { presentationInList, presentationInDetail };
