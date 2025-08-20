import fs from "fs";
import fetch from "node-fetch";  //Instalar Node: npm install node-fetch

// archivo donde voy a guardar los productos
const archivoProductos = "productos.json";

// funcion para hacer las consultas
async function main() {
    try {
        // 1. Recuperar todos los productos
        const res1 = await fetch("https://fakestoreapi.com/products");
        const todosProductos = await res1.json();
        console.log("Todos los productos:", todosProductos.length);

        // 2. Recuperar un número limitado de productos (por ejemplo 5)
        const res2 = await fetch("https://fakestoreapi.com/products?limit=5");
        const productosLimitados = await res2.json();
        console.log("Productos limitados (5):", productosLimitados);

        // 3. Mantener los datos en un archivo local JSON
        fs.writeFileSync(archivoProductos, JSON.stringify(productosLimitados, null, 2));
        console.log("Archivo productos.json creado con 5 productos");

        // 4. Agregar un nuevo producto (POST)
        const nuevoProducto = {
            title: "Zapatillas deportivas",
            price: 250,
            description: "Zapatillas de running color negro",
            image: "https://i.pravatar.cc",
            category: "sport"
        };
        const resPost = await fetch("https://fakestoreapi.com/products", {
            method: "POST",
            body: JSON.stringify(nuevoProducto),
            headers: { "Content-Type": "application/json" }
        });
        const productoAgregado = await resPost.json();
        console.log("Producto agregado (POST):", productoAgregado);

        // 5. Buscar un producto por id
        const idBuscado = 2;
        const res3 = await fetch(`https://fakestoreapi.com/products/${idBuscado}`);
        const productoPorId = await res3.json();
        console.log("Producto con id 2:", productoPorId);

        // 6. Eliminar un producto (DELETE)
        const idEliminar = 6;
        const resDelete = await fetch(`https://fakestoreapi.com/products/${idEliminar}`, {
            method: "DELETE"
        });
        const productoEliminado = await resDelete.json();
        console.log("Producto eliminado:", productoEliminado);

        // 7. Modificar datos de un producto (PUT)
        const idModificar = 7;
        const cambios = {
            title: "Producto modificado",
            price: 999
        };
        const resPut = await fetch(`https://fakestoreapi.com/products/${idModificar}`, {
            method: "PUT",
            body: JSON.stringify(cambios),
            headers: { "Content-Type": "application/json" }
        });
        const productoModificado = await resPut.json();
        console.log("Producto modificado:", productoModificado);

        // ============================
        // Parte 2: FileSystem
        // ============================

        // Leer el archivo local
        let productosLocal = JSON.parse(fs.readFileSync(archivoProductos, "utf-8"));
        console.log("Productos en archivo local:", productosLocal.length);

        // 1. Agregar producto al archivo local
        productosLocal.push({
            id: 999,
            title: "Producto local agregado",
            price: 150,
            description: "Ejemplo agregado desde el archivo local"
        });
        fs.writeFileSync(archivoProductos, JSON.stringify(productosLocal, null, 2));
        console.log("Producto agregado al archivo local");

        // 2. Eliminar los productos cuyo precio supere un valor
        const limitePrecio = 200;
        productosLocal = productosLocal.filter(p => p.price <= limitePrecio);
        fs.writeFileSync(archivoProductos, JSON.stringify(productosLocal, null, 2));
        console.log("Se eliminaron los productos con precio mayor a", limitePrecio);

        // 3. Mostrar archivo final en consola
        console.log("Archivo local final:", productosLocal);

    } catch (error) {
        console.log("Error en el script:", error);
    }
}

// ejecuto el main
main();
