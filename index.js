const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const req = require("express/lib/request");
// import uniqid from 'uniqid';

// Configuration
const PORT = 8080;

//middleware
app.use(express.static('public'));
app.use(cors());
app.use(express.json());

function readSellers(){
  const sellersFile = fs.readFileSync('./data/sellers.json');
  const sellersData = JSON.parse(sellersFile);
  return sellersData;
}

app.get("/hello", (req, res) => {
  res.send("Hello world, capstone server");
});

app.get("/mangos", (req, res) => {
  const sellersData = readSellers();

  const mangoSellers = [];

  sellersData.forEach((seller) => {
    seller.selling.forEach((item) => {
      if (item.product === "mango") {
        mangoSellers.push({id: seller.id,
                           first: seller.first_name,
                           last: seller.last_name,
                           productId: item.id,
                           productImg: item.image                      
                          });
      }
    });
  });
  res.status(201).json(mangoSellers);
});

app.get("/listing/:id", (req, res) => {
  const sellersData = readSellers();
  const idFromURL = req.params.id;
  sellersData.forEach((seller) => {
    seller.selling.forEach((product) => {
      if (product.id === idFromURL) {
        res.json(
          {
            image: product.image,
            product: product.product,
            seller: seller.first_name,
            email: seller.email,
            sellerId: seller.id
          }
        );
      }
    });
  });
});
///////

app.delete("/listing/:id", (req, res)=>{
  const sellersData = readSellers();
  const idFromURL = req.params.id;
  sellersData.forEach((seller) => {
    let sellingData = seller.selling;
    sellingData.forEach((product) => {
      if (product.id === idFromURL) {
          let updatedSellingData = sellingData.filter((item)=>
            item.id !== idFromURL
          );
          seller.selling = updatedSellingData;
          const strigifiedData = JSON.stringify(sellersData)
          fs.writeFileSync('./data/sellers.json', strigifiedData);
          res.json(sellersData);
      }
    });
  });
});

app.put("/listing/:id", (req, res)=>{
  const sellersData = readSellers();
  const idFromURL = req.params.id;
  sellersData.forEach((seller) => {
    let sellingData = seller.selling;
    sellingData.forEach((product) => {
      if (product.id === idFromURL) {
          seller.email = req.body.email
          const strigifiedData = JSON.stringify(sellersData)
          fs.writeFileSync('./data/sellers.json', strigifiedData);
          res.json(sellersData);
      }
    });
  });
})
app.post('/signin', (req, res) => {
  const sellersData = readSellers();
  if(req.body.email === sellersData[0].email &&
     req.body.password === sellersData[0].password){
       let redir = {redirect: '/'}       
       return res.json({page:redir,
        id: sellersData[0].id})
     }else{
       let redir = {redirect: '/signin'}
       return res.json(redir);
     }
});

app.post('/register', (req, res) => {
  const {email, name, password} = req.body;
  const sellersData = readSellers();
  let uniqid = require('uniqid');
  let id = uniqid();
  sellersData.unshift({
    id: id,
    first_name: name, 
    email: email,
    password: password,
    selling: null
  })
  res.json(sellersData[0])
})

///post new listing
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
////
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.sendStatus(500);
    }
    res.send(req.file);
  });
});

const upload = multer({ storage: storage }).single('file')
////////////////////////////////////////
app.post('/createlisting', (req, res) => {
    const sellersData = readSellers();
    let uniqid = require('uniqid');
    let newId = uniqid();
    sellersData[0].selling.unshift(
      {
       id: newId,
       image: "http://localhost:8080/"+req.body.image,
       product: req.body.product
      }
    )
    const strigifiedData = JSON.stringify(sellersData)
    fs.writeFileSync('./data/sellers.json', strigifiedData);
    res.sendStatus(200);
})

app.listen(PORT, ()=> {
  console.log(`server is running on ${PORT}`)
})
