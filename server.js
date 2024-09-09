const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = 3000;

// Configurações de conexão com o MongoDB
const uri = "mongodb+srv://nicolassiribolabordini:OzV8YeG6z813dPWs@cluster0.btxom.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Middleware para analisar JSON
app.use(express.json());

// Conectar ao MongoDB
async function connectMongo() {
  try {
    await client.connect();
    console.log("Conectado ao MongoDB");
  } catch (err) {
    console.error("Erro ao conectar ao MongoDB:", err);
  }
}

connectMongo();

// Endpoint para registrar ações
app.post('/historico', async (req, res) => {
  const { usuario, acao } = req.body;

  if (!usuario || !acao) {
    return res.status(400).json({ message: 'Usuário e ação são obrigatórios' });
  }

  try {
    const db = client.db("chatbot"); // Nome do banco de dados
    const collection = db.collection("historico"); // Nome da collection

    const result = await collection.insertOne({ usuario, acao, timestamp: new Date() });
    res.status(201).json({ message: 'Ação registrada', id: result.insertedId });
  } catch (err) {
    console.error("Erro ao inserir documento:", err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Fechar a conexão quando o processo terminar
process.on('SIGINT', async () => {
  await client.close();
  console.log("Conexão com o MongoDB fechada");
  process.exit(0);
});
