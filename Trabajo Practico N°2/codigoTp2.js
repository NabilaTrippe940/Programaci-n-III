const urlApi = 'https://fakestoreapi.com/products';
const fs = require('fs').promises;

// Recuperar la Información de Todos los Productos (GET).
async function recuperarProductos() {
    try{
        const response = await fetch(urlApi);
        if (!response.ok){ 
            throw new Error(`ERROR ${response.status}`)
        }  
        const datos_productos = await response.json();
        console.log(datos_productos);
        return datos_productos;
    }catch(error){
        console.log(`ERROR ${error}`);
        return [];
    }
}

// Recuperar la Información de un Número Limitado de Productos (GET). 
async function recuperarProductosLimitados(productos) {
    try {
        const response = await fetch(`${urlApi}?limit=${productos}`);
        if (!response.ok) {
            throw new Error(`ERROR ${response.status}`);
        }
        const datos_productos = await response.json();
        console.log(datos_productos);
        // Persistir los Datos de la Consulta Anterior en un Archivo Local JSON.
        await fs.writeFile("productosLimitados.json", JSON.stringify(datos_productos, null, 2));
        console.log("\nDatos Guardados...");
        return datos_productos;
    } catch (error) {
        console.log(`ERROR ${error}`);
        return [];
    }
}

// Agregar un Nuevo Producto (POST).
async function agregarProducto(producto) {
    try {
        const response = await fetch(urlApi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto) // la API genera el id automáticamente
        });
        if (!response.ok) 
            throw new Error(`ERROR ${response.status}`);
        const nuevoProducto = await response.json();
        console.log(nuevoProducto);
        return nuevoProducto;
    } catch (error) {
        console.log(`ERROR ${error}`);
        return null;
    }
}

// Buscar la Información de un Determinado Producto, Utilizando un “ID” Como Parámetro (GET).
async function buscarProductoPorId(id) {
    try {
        const response = await fetch(`${urlApi}/${id}`);
        if (!response.ok){ 
            throw new Error(`ERROR ${response.status}`)
        }
        const producto = await response.json();
        console.log(producto);
        return producto;
    } catch (error) {
        console.error(`ERROR ${error}`);
        return null;
    }
}

// Eliminar un Producto (DELETE).
async function eliminarProducto(id) {
    try {
        const response = await fetch(`${urlApi}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok){ 
            throw new Error(`ERROR ${response.status}`)
        }
        const producto = await response.json();
        console.log(producto);
        return producto;
    } catch (error) {
        console.error(`ERROR ${error}`);
        return null;
    }
}

// Modificar los Datos de un Producto (UPDATE).
async function modificarProductos(id, datosActualizados) {
    try {
        const response = await fetch(`${urlApi}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        if (!response.ok){ 
            throw new Error(`ERROR ${response.status}`)
        }
        const productoActualizado = await response.json();
        console.log(productoActualizado);
        return productoActualizado;
    } catch (error) {
        console.error(`ERROR ${error}`);
        return null;
    }
}

// Agregar un Producto al Archivo Local.
async function agregarProductoLocal(producto) {
    try {
        const datos = await fs.readFile('productosLimitados.json', 'utf-8');
        const productos = JSON.parse(datos);

        const productoCompleto = {
            id: producto.id || 99,
            title: producto.title || "string",
            price: producto.price || 0.10,
            description: producto.description || "string",
            category: producto.category || "string",
            image: producto.image || "http://example.com"
        };
        productos.push(productoCompleto);
        await fs.writeFile('productosLimitados.json', JSON.stringify(productos, null, 2));
        console.log("\nNuevo Producto Agregado...");
        console.log(productoCompleto);
    } catch (error) {
        console.error(`ERROR ${error}`);
    }
}

// Eliminar los Productos Superiores a un Determinado Valor.
async function eliminarProductosPorValor(productoValor) {
    try {
        const datos = await fs.readFile('productosLimitados.json', 'utf-8');
        const productos = JSON.parse(datos);
        const productos_filtrados = productos.filter(producto => producto.price <= productoValor);
        await fs.writeFile('productosLimitados.json', JSON.stringify(productos_filtrados, null, 2));
        console.log(`\nLos Productos Con Precio Menor o Igual a ${productoValor} Fueron Guardados...`);
        console.log(productos_filtrados);
    } catch (error) {
        console.error(`ERROR${error}`);
    }
}

// Imprimir en Consola Para Verificar las Operaciones Realizadas
(async () => {

    console.log("\nRecuperar la Información de Todos los Productos (GET).");
    await recuperarProductos();

    console.log("\nRecuperar la Información de un Número Limitado de Productos (GET).");
    await recuperarProductosLimitados(5);

    console.log("\nAgregar un Nuevo Producto (POST).");
    await agregarProducto({ 
        title: "Nuevo Producto",
        price: 7.30,
        description: "string",
        category: "string",
        image: "http://example.com"
    });

    console.log("\nBuscar la Información de un Determinado Producto, Utilizando un “ID” Como Parámetro (GET).");
    await buscarProductoPorId(5);

    console.log("\nModificar los Datos de un Producto (UPDATE).");
    await modificarProductos(5, { 
        title: "Alta Mar", 
        price: 99.9,
        description: "string",
        category: "string",
        image: "http://example.com"
    });

    console.log("\nEliminar un Producto (DELETE).");
    await eliminarProducto(6);

    console.log("\nAgregar un Producto al Archivo Local.");
    await agregarProductoLocal({
        id: 99,
        title: "Producto Local",
        price: 0.10,
        description: "string",
        category: "string",
        image: "http://example.com"
    });

    console.log("\nEliminar los Productos Superiores a un Determinado Valor.");
    await eliminarProductosPorValor(100);

})();