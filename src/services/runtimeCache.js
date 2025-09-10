// Хранится только в памяти процесса SPA (сбрасывается при полной перезагрузке).
export const runtimeCache = {
  discover: null,   // массив из 5 Discover
  showcase: null,   // массив по 1 на категорию
  recommend: null,  // карточка "You might like" в Favorites
};
