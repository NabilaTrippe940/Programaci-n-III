import { readFile, writeFile } from "fs/promises";
const API_URL = "https://fakestoreapi.com/products"; 

// A) OPERACIONES CON FETCH
// 1. Recuperar la información de todos los productos (GET)
async function todosLosProductos() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    console.log("\n[GET] Todos los productos:");
    console.log(data);
    return data;
  } catch (error) {
    console.error(" Error al obtener todos los productos:", error);
  }
}

// 2. Recuperar la información de un número limitado de productos (GET con parámetro)
async function productosConLimites(limit = 10) {
  try {
    const res = await fetch(`${API_URL}?limit=${limit}`);
    const data = await res.json();
    console.log(`\n[GET] ${limit} productos:`);
    console.log(data);

    // Persistir los datos de la consulta anterior en un archivo local JSON.
    await writeFile("productos.json", JSON.stringify(data, null, 2));
    console.log(" Archivo productos.json creado con los datos limitados");

    return data;
  } catch (error) {
    console.error(" Error al obtener productos limitados:", error);
  }
}

// 3. Agregar un nuevo producto (POST)
async function agregarProducto() {
  try {
    const nuevo = {
      title: "Saco de paño para mujer",
      price: 180,
      description: "Saco de paño clásico, ideal para el invierno. Abrigado, moderno y elegante.",
      image: "https://i.postimg.cc/1RCgpkJf/Outfits-con-saco-de-pano-para-mujer-scaled.jpg",
      category: "women's clothing",
    };

    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(nuevo),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    console.log("\n[POST] Producto agregado:");
    console.log(data);
    return data;
  } catch (error) {
    console.error(" Error al agregar producto:", error);
  }
}

// 4. Buscar la información de un determinado producto, utilizando un “id” como parámetro (GET)
async function buscarProductoPorId(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const data = await res.json();
    console.log(`\n[GET] Producto con id=${id}:`);
    console.log(data);
    return data;
  } catch (error) {
    console.error(` Error al buscar producto con id=${id}:`, error);
  }
}

// 5. Eliminar un producto (DELETE)
async function eliminarUnProducto(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const data = await res.json();
    console.log(`\n[DELETE] Producto con id=${id} eliminado:`);
    console.log(data);
    return data;
  } catch (error) {
    console.error(` Error al eliminar producto con id=${id}:`, error);
  }
}

// 6. Modificar los datos de un producto. Usamos PUT
async function modificarUnProducto(id) {
  try {
    const cambios = {
      title: "Producto actualizado",
      price: 220,
    };

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(cambios),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    console.log(`\n[PUT] Producto con id=${id} modificado:`);
    console.log(data);
    return data;
  } catch (error) {
    console.error(` Error al actualizar producto con id=${id}:`, error);
  }
}

// B) OPERACIONES CON FILESYSTEM (ASÍNCRONAS)

// 1. Agregar producto al archivo local
async function agregarProductoAlArchivoLocal() {
  try {
    let data = JSON.parse(await readFile("productos.json", "utf8"));
    const nuevo = { id: 999, title: "Abrigo de mujer", price: 250 };
    data.push(nuevo);
    await writeFile("productos.json", JSON.stringify(data, null, 2));
    console.log("\n[FS] Producto agregado al archivo local:", nuevo);
  } catch (error) {
    console.error(" Error al agregar producto al archivo:", error);
  }
}

// 2. Eliminar los productos superiores a un determinado valor
async function eliminarProductoConValorSuperior(limitPrice) {
  try {
    let data = JSON.parse(await readFile("productos.json", "utf8"));
    data = data.filter(p => p.price <= limitPrice);
    await writeFile("productos.json", JSON.stringify(data, null, 2));
    console.log(`\n[FS] Productos con precio <= ${limitPrice} guardados en archivo`);
  } catch (error) {
    console.error(" Error al eliminar productos caros del archivo:", error);
  }
}

async function main() {
  await todosLosProductos();
  await productosConLimites(10);
  await agregarProducto();
  await buscarProductoPorId(1);
  await eliminarUnProducto(7);
  await modificarUnProducto(9);

  // FileSystem
  await agregarProductoAlArchivoLocal();
  await eliminarProductoConValorSuperior(100); // Eliminar los productos con precio mayor a 100
}

main();
