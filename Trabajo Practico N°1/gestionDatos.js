let peliculas = [
  {
    id: 1,
    nombre: "La Naranja Mecánica",
    director: "Stanley Kubrick",
    precio: 12300,
    stock: 5
  },
  {
    id: 2,
    nombre: "Brasil",
    director: "Terry Gilliam",
    precio: 16000,
    stock: 10
  },
  {
    id: 3,
    nombre: "El Señor de los Anillos",
    director: "Peter Jackson",
    precio: 25000,
    stock: 12
  },
  {
    id: 4,
    nombre: "El viaje de Chihiro",
    director: "Hayao Miyazaki",
    precio: 15000,
    stock: 7
  },
  {
    id: 5,
    nombre: "Forrest Gump",
    director: "Robert Zemeckis",
    precio: 13000,
    stock: 8
  }
];

// consigna 2.1
console.log(peliculas.length);

// consigna 2.2
console.log(peliculas[1].nombre);
console.log(peliculas[3].nombre);

// consigna 3.1
for (let pelicula of peliculas) {
  console.log(pelicula.nombre, pelicula.precio);
}

// consigna 3.2
peliculas.forEach(function (pelicula) {
  console.log(`Nombre de la pelicula: ${pelicula.nombre} - Precio: ${pelicula.precio}`);
});

// consigna 4.1
peliculas.push(
  {
    id: 6,
    nombre: "Coherence",
    director: "James Ward Byrkit",
    precio: 18000,
    stock: 10
  },
  {
    id: 7,
    nombre: "12 hombres en pugna",
    director: "Sidney Lumet",
    precio: 25000,
    stock: 7
  }
);

console.log(peliculas);

// consigna 4.2
let peliculaEliminada = peliculas.pop();
console.log(peliculaEliminada);

// consigna 4.3
peliculas.unshift({
  id: 8,
  nombre: "Memento",
  director: "Christopher Nolan",
  precio: 10000,
  stock: 6
});
console.log(peliculas);

// consigna 4.4
peliculas.shift();
console.log(peliculas);

// consigna 4.5
let peliculasEnStock = peliculas.filter(function (pelicula) {
  return pelicula.stock > 0;
});
console.log(peliculasEnStock);

// consigna 4.6
let nombresPeliculas = peliculas.map(function (pelicula) {
  return pelicula.nombre;
});
console.log(nombresPeliculas);

// consigna 4.7
let peliculaEncontrada = peliculas.find(function (pelicula) {
  return pelicula.id === 3;
});

if (peliculaEncontrada) {
  console.log(`La película encontrada es ${peliculaEncontrada.nombre}`);
} else {
  console.log("Esa pelicula no existe");
}

// consigna 4.8
let peliculasCopia = peliculas.slice();

peliculasCopia.sort(function (a, b) {
  if (a.precio > b.precio) return -1;
  if (a.precio < b.precio) return 1;
  return 0;
});

console.log("El orden decreciente en precio de las películas es:");
console.log(peliculasCopia);