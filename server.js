const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = 3000;
app.use(express.static('public')); // Serve static files from the 'public' directory
  
// Permitir requisições de múltiplas origens
const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:5500'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, origin);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

const uri = "mongodb+srv://nicolassiribolabordini:OzV8YeG6z813dPWs@cluster0.btxom.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

// Middleware to parse JSON request bodies
app.use(express.json());

async function connectMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("Error connecting to MongoDB Atlas:", err);
    process.exit(1); // Exit the process on connection failure
  }
}

connectMongo();

// Endpoint to register conversation history
app.post('/historico', async (req, res) => {
  const { usuario, mensagem, timestamp = new Date() } = req.body; // Include timestamp by default

  // if (!usuario || !mensagem) {
  //   return res.status(400).json({ message: 'Usuário e mensagem são obrigatórios' });
  // }

  try {
    const db = client.db("chatbot"); // Replace with your actual database name
    const collection = db.collection("historico"); // Replace with your actual collection name

    const result = await collection.insertOne({ usuario, mensagem, timestamp });
    res.status(201).json({ message: 'Conversa registrada', id: result.insertedId });
  } catch (err) {
    console.error("Error inserting conversation document:", err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Endpoint to register login data (example)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios' });
  }

  // Implement login validation logic here (e.g., check against a user database)
  // ...

  try {
    const db = client.db("chatbot"); // Replace with your actual database name
    const collection = db.collection("logins"); // Replace with your actual collection name

    await collection.insertOne({ username, timestamp: new Date() }); // Log login attempt
    res.status(200).json({ message: 'Login registrado' }); // Adjust response based on validation
  } catch (err) {
    console.error("Error inserting login document:", err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Graceful shutdown on termination
process.on('SIGINT', async () => {
  await client.close();
  console.log("Conexão com o MongoDB Atlas fechada");
  process.exit(0);
});

const tabela = mongoose.model(
  "historico",
  {
    mensagem: String
  }
);