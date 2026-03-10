const express = require("express")
const mongoose = require("mongoose")
const multer = require("multer")
const cors = require("cors")
const path = require("path")

const Producto = require("./models/producto")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/uploads", express.static(path.join(__dirname, "uploads")))

/*mongoose.connect("mongodb://127.0.0.1:27017/yokieroec")*/
mongoose.connect("mongodb+srv://jroman:DD090620152025@cluster0.tdr7vkd.mongodb.net/yokieroec?retryWrites=true&w=majority")


.then(() => console.log("Conectado a MongoDB"))
.catch(err => console.log(err))

const storage = multer.diskStorage({
  destination: "./backend/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

app.post("/productos", upload.single("imagen"), async (req, res) => {

  const nuevoProducto = new Producto({
    nombre: req.body.nombre,
    precio: req.body.precio,
    categoria: req.body.categoria,
    descripcion: req.body.descripcion,
    imagen: req.file.filename
  })

  await nuevoProducto.save()

  res.json({mensaje:"Producto guardado"})
})

app.get("/productos", async (req, res) => {

  const productos = await Producto.find()

  res.json(productos)
})

app.delete("/productos/:id", async (req,res)=>{

await Producto.findByIdAndDelete(req.params.id)

res.json({mensaje:"Producto eliminado"})

})

app.put("/productos/:id", async (req,res)=>{

await Producto.findByIdAndUpdate(

req.params.id,
req.body

)

res.json({mensaje:"Producto actualizado"})

})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor funcionando en puerto " + PORT);
});
