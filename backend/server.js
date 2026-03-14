const express = require("express")
const mongoose = require("mongoose")
const multer = require("multer")
const cors = require("cors")
const path = require("path")

const app = express()

app.use(cors())
app.use(express.json())

/* ========================
   CONEXIÓN MONGODB
======================== */

mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/yokieroec")
.then(()=> console.log("MongoDB conectado"))
.catch(err => console.log(err))

/* ========================
   MODELO PRODUCTO
======================== */

const Producto = mongoose.model("Producto",{
    nombre:String,
    precio:Number,
    categoria:String,
    descripcion:String,
    imagen:String
})

/* ========================
   MULTER SUBIDA IMÁGENES
======================== */

const storage = multer.diskStorage({

    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,"uploads"))
    },

    filename:(req,file,cb)=>{
        cb(null,Date.now()+"-"+file.originalname)
    }

})

const upload = multer({storage})

/* ========================
   SERVIR FRONTEND
======================== */

app.use(express.static(path.join(__dirname,"../frontend")))

/* SERVIR IMÁGENES */

app.use("/uploads", express.static(path.join(__dirname,"uploads")))

/* ========================
   RUTA PRINCIPAL
======================== */

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"../frontend/index.html"))
})

/* ========================
   API PRODUCTOS
======================== */

/* LISTAR */

app.get("/productos", async(req,res)=>{

    const productos = await Producto.find()

    res.json(productos)

})

/* CREAR */

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

/* EDITAR */

app.put("/productos/:id", async(req,res)=>{

    await Producto.findByIdAndUpdate(req.params.id,{
        nombre:req.body.nombre,
        precio:req.body.precio,
        categoria:req.body.categoria,
        descripcion:req.body.descripcion
    })

    res.json({mensaje:"producto actualizado"})
})

/* ELIMINAR */

app.delete("/productos/:id", async(req,res)=>{

    await Producto.findByIdAndDelete(req.params.id)

    res.json({mensaje:"producto eliminado"})
})

/* ========================
   PUERTO
======================== */

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log("Servidor corriendo en puerto "+PORT)
})