const API = "http://192.168.56.1:8000";
function show() {
  fetch(API + "/items")
    .then((response) => response.json()) // converte pra JSON
    .then((data) => {
      console.log(data); // vê no DevTools primeiro
    });
}
