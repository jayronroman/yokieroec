const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = 3000;

// --- CORRECCIÓN DE RUTAS ABSOLUTAS ---
const DATA_FILE = path.join(__dirname, 'productos.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Asegurar que la carpeta uploads existe al arrancar
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json());

// IMPORTANTE: Servir la carpeta de forma absoluta
app.use('/uploads', express.static(UPLOADS_DIR));

// Configuración de Multer
//const storage = multer.diskStorage({
    //destination: (req, file, cb) => {
        //cb(null, UPLOADS_DIR); // Usar la ruta absoluta
    //},
    //filename: (req, file, cb) => {
        //cb(null, Date.now() + '-' + file.originalname);
    //}
//});
//const upload = multer({ storage });
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuración usando las variables que pusiste en Railway
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// Configurar el almacenamiento en la nube
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'yokieroec_fotos', // Nombre de la carpeta en Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

// RUTA PARA CREAR PRODUCTO (MODIFICADA)
app.post('/productos', upload.single('imagen'), (req, res) => {
    const productos = leerProductos();
    const nuevoProducto = {
        _id: Date.now().toString(),
        nombre: req.body.nombre,
        precio: req.body.precio,
        categoria: req.body.categoria,
        descripcion: req.body.descripcion,
        // IMPORTANTE: Ahora guardamos el link directo de internet
        imagen: req.file ? req.file.path : 'https://via.placeholder.com/300'
    };
    productos.push(nuevoProducto);
    guardarProductos(productos);
    res.json({ message: "Producto creado", producto: nuevoProducto });
});

// Funciones para manejar el JSON
const leerProductos = () => {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
};

const guardarProductos = (productos) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(productos, null, 2));
};

// --- RUTAS API ---

app.get('/productos', (req, res) => {
    res.json(leerProductos());
});

app.post('/productos', upload.single('imagen'), (req, res) => {
    const productos = leerProductos();
    const nuevoProducto = {
        _id: Date.now().toString(),
        nombre: req.body.nombre,
        precio: req.body.precio,
        categoria: req.body.categoria,
        descripcion: req.body.descripcion,
        imagen: req.file ? req.file.filename : 'default.jpg'
    };
    productos.push(nuevoProducto);
    guardarProductos(productos);
    res.json({ message: "Producto creado", producto: nuevoProducto });
});

app.put('/productos/:id', (req, res) => {
    let productos = leerProductos();
    const index = productos.findIndex(p => p._id === req.params.id);
    
    if (index !== -1) {
        productos[index] = { ...productos[index], ...req.body };
        guardarProductos(productos);
        res.json({ message: "Producto actualizado" });
    } else {
        res.status(404).json({ message: "No encontrado" });
    }
});

app.delete('/productos/:id', (req, res) => {
    let productos = leerProductos();
    const productoAEliminar = productos.find(p => p._id === req.params.id);
    
    if (productoAEliminar && productoAEliminar.imagen !== 'default.jpg') {
        const rutaImagen = path.join(UPLOADS_DIR, productoAEliminar.imagen);
        if (fs.existsSync(rutaImagen)) fs.unlinkSync(rutaImagen);
    }

    productos = productos.filter(p => p._id !== req.params.id);
    guardarProductos(productos);
    res.json({ message: "Producto eliminado" });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Carpeta de imágenes: ${UPLOADS_DIR}`); // Esto te dirá dónde está buscando las fotos
});