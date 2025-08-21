import { writeFile } from "fs/promises";

const BASE_URL = 'https://fakestoreapi.com'


//Recuperar la información de todos los productos (GET)

async function getAllProducts() {
    try {
        const allProducts = await fetch(`${BASE_URL}/products`);
        const data = await allProducts.json();
        console.log(data)
        
    } catch (error) {
        console.error (error);
    
    }
}
getAllProducts();

//Recuperar la información de un número limitado de productos (GET)

async function getLimitedProducts(limit){
    try{
        const limitedProducts = await fetch (`${BASE_URL}/products?limit=${limit}`);
        const data = await limitedProducts.json();
        console.log (data);
        return data;
    
    } catch (error) {
        console.error (error);
    
    }
}

getLimitedProducts(10);

//Persistir los datos de la consulta anterior en un archivo local JSON.

async function saveToFile(data, filename) {
  try {
    await writeFile(filename, JSON.stringify(data, null, 2), "utf-8");
    console.log(`Archivo guardado en: ${filename}`);
  } catch (error) {
    console.error("Error al guardar archivo:", error);    //función para guardar datos en un archivo
  }
}

async function persistFile() {
  const productos = await getLimitedProducts(5);   // reutilizamos la función del punto anterior 
  await saveToFile(productos, "./productos.json"); // lo guardamos en archivo
}

persistFile();

//Agregar un nuevo producto (POST).
async function addProduct(product) {
  try {
    const response = await fetch(`${BASE_URL}/products`, {
      method: "POST",              //  POST le dice a la API que queremos enviar datos (no leer)
      headers: {
        "Content-Type": "application/json", //  se aclara que enviamos un JSON
      },
      body: JSON.stringify(product),        // convierte el objeto JS en JSON para enviarlo
    });
    
    const data = await response.json();     // leemos la respuesta que nos da la API
    console.log("Producto creado:", data);  // mostramos el resultado
    return data;
  } catch (error) {
    console.error("Error al crear producto:", error);
  }
}

async function postNewProduct() {
  const nuevoProducto = {
   "id": 43,
    "title": "Remeras ",
    "price": 83,
    "description": "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The Henley style round neckline includes a three-button placket.",
    "category": "men's clothing",
    "image": "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png",
    "rating": {
      "rate": 4.1,
      "count": 259
        }
  };
  

  await addProduct(nuevoProducto);
}

postNewProduct();

//Buscar la información de un determinado producto, utilizando un “id” como parámetro (GET)

async function getProductById(id) {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`); // ponemos el id en la URL
    const data = await response.json();
    console.log("Producto encontrado:", data);
    return data;
  } catch (error) {
    console.error("Error al buscar producto:", error);
  }
}

async function returnProductById() {
  const producto = await getProductById(5); // acá le pasamos el id que queremos 
  console.log(producto); 
}

returnProductById();

//Eliminar un producto (DELETE)

async function deleteProduct(id) {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE'
    });

    // Procesamos la respuesta de la API
    const data = await response.json();
    console.log("Respuesta de la API:", data);

    console.log(`Producto con id ${id} eliminado`);
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
  }
}

deleteProduct(5);  //se pasa por parametro el numero de id del producto que queremos eliminar


//Modificar los datos de un producto (UPDATE)

async function updateProduct(id, newData){
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT', //para modificar la totalidad del producto, si el cambio es parcial debemos usar PATCH
      headers: {
        "Content-Type": "application/json", //  se aclara que enviamos un JSON
      },
      body: JSON.stringify(newData),
    });
    
    const data = await response.json();
    console.log("Producto actualizado (simulado):", data);
  
  } catch (error){
      console.error("Error al modificar los datos del producto", error);
  }
}
async function putNewProduct() {
  const nuevoProducto = {
   "id": 32,
    "title": "Zapatillas deportivas ",
    "price": 83,
    "description": "Zapatillas negras del 34 al 44",
    "category": "zapatillas",
    "image": "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png",
    "rating": {
      "rate": 4.1,
      "count": 259
        }
  };
  

  await updateProduct(32, nuevoProducto);
}

putNewProduct(); 


//Agregar producto al archivo local

async function addProductToLocalFile() {
  const nuevoProducto = {
   "id": 67,
    "title": "Zapatillas  ",
    "price": 83,
    "description": "Zapatillas negras",
    "category": "zapatillas",
    "image": "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png",
    "rating": {
      "rate": 4.1,
      "count": 259
        }
  };    
  await saveToFile(nuevoProducto, "./productos.json"); // lo guardamos en archivo local, reutilizando funcion saveToFile
  console.log ("Este es el producto agregado a tu archivo local:", nuevoProducto.title )
}

addProductToLocalFile();