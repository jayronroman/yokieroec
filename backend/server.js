const express = require("express")
const mongoose = require("mongoose")
const multer = require("multer")
const cors = require("cors")
const path = require("path")

const app = express()

app.use(cors())
app.use(express.json())

/* Carpeta de imágenes */
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

/* Conexión MongoDB */
mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/yokieroec")
.then(()=> console.log("MongoDB conectado"))
.catch(err => console.log(err))

/* Modelo producto */
const Producto = mongoose.model("Producto", {
    nombre:String,
    precio:Number,
    categoria:String,
    descripcion:String,
    imagen:String
})

/* Configuración multer */
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"uploads")
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+"-"+file.originalname)
    }
})

const upload = multer({storage})

/* Rutas */

/* Obtener productos */
app.get("/productos", async(req,res)=>{
    const productos = await Producto.find()
    res.json(productos)
})

/* Crear producto */
app.post("/productos", upload.single("imagen"), async(req,res)=>{

    const nuevo = new Producto({
        nombre:req.body.nombre,
        precio:req.body.precio,
        categoria:req.body.categoria,
        descripcion:req.body.descripcion,
        imagen:req.file ? req.file.filename : ""
    })

    await nuevo.save()
    res.json(nuevo)
})

/* Actualizar producto */
app.put("/productos/:id", async(req,res)=>{

    await Producto.findByIdAndUpdate(req.params.id,{
        nombre:req.body.nombre,
        precio:req.body.precio,
        categoria:req.body.categoria,
        descripcion:req.body.descripcion
    })

    res.json({mensaje:"producto actualizado"})
})

/* Eliminar producto */
app.delete("/productos/:id", async(req,res)=>{

    await Producto.findByIdAndDelete(req.params.id)

    res.json({mensaje:"producto eliminado"})
})

/* Puerto Railway */
const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log("Servidor corriendo en puerto "+PORT)
})