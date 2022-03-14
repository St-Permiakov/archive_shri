import { initMap } from "./map";
/* Без фигурных скобок работает только с export default, а здесь такого нет */
ymaps.ready(() => {
  initMap(ymaps, "map");
  console.log("inited");
});
