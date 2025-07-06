const express = require("express");
const { body, validationResult } = require('express-validator');
const pgp = require("pg-promise")({});

const usuario = "usuario";
const senha = "senha";
const db = pgp(`postgres://${usuario}:${senha}@localhost:5432/nomedobanco`);

const app = express();
app.use(express.json());

// busca os arquivos 'estáticos' na pasta 'public': JS e CSS
app.use(express.static(__dirname + "/public"));

const PORT = 3002;
app.listen(PORT, () => console.log(`Servidor está rodando na porta ${PORT}.`));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/produto.html");
});


// -------------------- APIs de Produtos ------------------//

//Pega todos os produtos
app.get("/produtos", async (req, res) => {
  try {
    const produtos = await db.any("SELECT cod_prod, nome_prod, grupo_produto, status_prod FROM produto order by cod_prod;");
    console.log("Retornando todos os produtos.");
    res.status(200).json(produtos);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});


//Pega produto conforme id informado
app.get("/produtos/:id", async (req, res) => {
  try {
    const cod = req.params.id;
    console.log(`Retornando ID: ${cod}.`);
    const produtos = await db.one(
      "SELECT cod_prod, nome_prod, grupo_produto, status_prod FROM produto WHERE cod_prod = $1;",[cod]
    );
    res.json(produtos).status(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});


//Abaixo pega os produtos com base no código informado
app.get("/filtraprodutos/:id", async (req, res) => {
  try {
    const cod = req.params.id;
    console.log(`Retornando ID: ${cod}.`);
    const produtos = await db.any(
      "SELECT cod_prod, nome_prod, grupo_produto, status_prod FROM produto WHERE CAST(cod_prod AS VARCHAR) LIKE $1;", [`%${cod}%`]
    );
    res.json(produtos).status(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});


//Insere produto
app.post("/produtos", async (req, res) => {
  try {
    const cod = req.body.cod;
    const nome = req.body.nome;
    const grupo = req.body.grupo;
    const stat = req.body.stat;

    const novoProduto = await db.one(
      "INSERT INTO produto (cod_prod, nome_prod, grupo_produto, status_prod) VALUES ($1, $2, $3, $4) RETURNING cod_prod;",
      [cod, nome, grupo, stat]
    );
    console.log(`Produto criado de código: ${cod}`);
    res.status(201).json(novoProduto);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});


//Atualiza produto com base no id informado
app.put("/produtos/:id", async (req, res) => {
  try {
    const cod = req.body.cod;
    const nome = req.body.nome;
    const grupo = req.body.grupo;
    const stat = req.body.stat;
    const codalt = req.params.id;
  
    await db.none("UPDATE produto SET cod_prod=$1, nome_prod=$2, grupo_produto=$3, status_prod=$4  WHERE cod_prod=$5;", [
      cod, nome, grupo, stat, codalt
    ]);

    console.log(`Produto alterado: COD ${codalt}`);
    res.sendStatus(202);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});


//Deleta prodiuto com bas no id informado
app.delete("/produtos/:id", async (req, res) => {
  try {
    const cod = req.params.id;

    await db.none("DELETE FROM produto WHERE cod_prod=$1;", [cod]);

    console.log(`Produto removido: ID ${cod}`);
    res.sendStatus(202);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});




// -------------------- APIs de Estoque Inicial ------------------//




//Estoque inicial é identificado pelo tipo_est = 1 (tipo do estoque)
app.get("/estoqueinicial", async (req, res) => {
  try {

    const estoque = await db.any("SELECT CAST(e.datafab_est AS DATE) AS datafab_est, e.cod_prod, e.qtd_est, e.validade_est, p.nome_prod, p.grupo_produto FROM estoque e inner join produto p on p.cod_prod = e.cod_prod WHERE tipo_est = 1 order by e.cod_prod;");
    console.log("Retornando estoque inicial.");
    res.status(200).json(estoque);

  } catch (error) {

    console.log(error);
    res.sendStatus(400);

  }
});


//Abaixo insere um estoque do tipo inicial (tipo_est = 1)
app.post("/estoqueinicial", async (req, res) => {
  try {

    const cod = req.body.cod;
    const qtdest = req.body.qtdest;
    const validade = req.body.validade;
    const datest = req.body.datest;

    const novoEstoque = await db.one(
      "INSERT INTO estoque (datafab_est, qtd_est, validade_est, cod_prod, tipo_est) VALUES ($1, $2, $3, $4, 1) RETURNING cod_prod;",
      [datest, qtdest, validade, cod]
    );

    console.log(`Estoque criado do produto de código: ${cod}`);
    res.status(201).json(novoEstoque);

  } catch (error) {

    console.log(error);
    res.status(400).json({ error: error.message });

  }
});


//Abaixo deleta o estoque inicial conforme a data e o código do produto
app.delete("/estoqueinicial/:id/:datafab", async (req, res) => {
  try {
    const cod = req.params.id;
    const datafab = req.params.datafab;

    await db.none("DELETE FROM estoque WHERE tipo_est = 1 and cod_prod = $1 and datafab_est = $2;", [cod, datafab]);

    console.log(`Estoque removido do produto: ID ${cod} e Data Fab ${datafab}`);
    res.sendStatus(202);

  } catch (error) {

    console.log(error);
    res.status(400).json({ error: error.message });

  }
});


//Abaixo traz o estoque inicial com base no id do produto e na data de fabricação
app.get("/estoqueinicial/:id/:datafab", async (req, res) => {
  try {

    const cod = req.params.id;
    const datafab = req.params.datafab;

    console.log(`Retornando ID: ${cod} e Data Fabricação: ${datafab}.`);

    const estoque = await db.one(
      "SELECT e.datafab_est, e.cod_prod, e.qtd_est, e.validade_est, p.nome_prod, p.grupo_produto FROM estoque e inner join produto p on p.cod_prod = e.cod_prod WHERE e.tipo_est = 1 and e.cod_prod = $1 and e.datafab_est = $2;", [cod, datafab]
    );

    res.json(estoque).status(200);

  } catch (error) {

    console.log(error);
    res.sendStatus(400);

  }
});


//Abaixo faz o update do estoque inicial conforme a data da fabricação e o código do produto
app.put("/estoqueinicial/:id/:datafab", async (req, res) => {
  try {

    const cod = req.body.cod;
    const datest = req.body.datest;
    const validade = req.body.validade;
    const qtdest = req.body.qtdest;
    const datalt = req.params.datafab;
    const codalt = req.params.id;
     
    await db.none("UPDATE estoque SET cod_prod = $1, qtd_est = $2, validade_est = $3, datafab_est = $4  WHERE cod_prod = $5 and datafab_est = $6 and tipo_est = 1;", [
      cod, qtdest, validade, datest, codalt, datalt]);

    console.log(`Estoque alterado: COD ${codalt} e Data: ${datalt}`);
    res.sendStatus(202);

  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});




// -------------------- APIs de Estoque Contado ------------------//




//Estoque contado é identificado pelo tipo_est = 2 (tipo do estoque)
app.get("/estoquecontado", async (req, res) => {
  try {

    const estoque = await db.any("SELECT CAST(e.datafab_est AS DATE) AS datafab_est, e.cod_prod, e.qtd_est, e.validade_est, p.nome_prod, p.grupo_produto FROM estoque e inner join produto p on p.cod_prod = e.cod_prod WHERE tipo_est = 2 order by e.cod_prod;");
    console.log("Retornando estoque contado.");
    res.status(200).json(estoque);

  } catch (error) {

    console.log(error);
    res.sendStatus(400);

  }
});


//Abaixo insere um estoque do tipo contado (tipo_est = 2)
app.post("/estoquecontado", async (req, res) => {
  try {

    const cod = req.body.cod;
    const qtdest = req.body.qtdest;
    const validade = req.body.validade;
    const datest = req.body.datest;

    const novoEstoque = await db.one(
      "INSERT INTO estoque (datafab_est, qtd_est, validade_est, cod_prod, tipo_est) VALUES ($1, $2, $3, $4, 2) RETURNING cod_prod;",
      [datest, qtdest, validade, cod]
    );

    console.log(`Estoque criado do produto de código: ${cod}`);
    res.status(201).json(novoEstoque);

  } catch (error) {

    console.log(error);
    res.status(400).json({ error: error.message });

  }
});


//Abaixo deleta o estoque contado conforme a data e o código do produto
app.delete("/estoquecontado/:id/:datafab", async (req, res) => {
  try {
    const cod = req.params.id;
    const datafab = req.params.datafab;

    await db.none("DELETE FROM estoque WHERE tipo_est = 2 and cod_prod = $1 and datafab_est = $2;", [cod, datafab]);

    console.log(`Estoque removido do produto: ID ${cod} e Data Fab ${datafab}`);
    res.sendStatus(202);

  } catch (error) {

    console.log(error);
    res.status(400).json({ error: error.message });

  }
});


//Abaixo traz o estoque contado com base no id do produto e na data de fabricação
app.get("/estoquecontado/:id/:datafab", async (req, res) => {
  try {

    const cod = req.params.id;
    const datafab = req.params.datafab;

    console.log(`Retornando ID: ${cod} e Data Fabricação: ${datafab}.`);

    const estoque = await db.one(
      "SELECT e.datafab_est, e.cod_prod, e.qtd_est, e.validade_est, p.nome_prod, p.grupo_produto FROM estoque e inner join produto p on p.cod_prod = e.cod_prod WHERE e.tipo_est = 2 and e.cod_prod = $1 and e.datafab_est = $2;", [cod, datafab]
    );

    res.json(estoque).status(200);

  } catch (error) {

    console.log(error);
    res.sendStatus(400);

  }
});


//Abaixo faz o update do estoque contado conforme a data da fabricação e o código do produto
app.put("/estoquecontado/:id/:datafab", async (req, res) => {
  try {

    const cod = req.body.cod;
    const datest = req.body.datest;
    const validade = req.body.validade;
    const qtdest = req.body.qtdest;
    const datalt = req.params.datafab;
    const codalt = req.params.id;
     
    await db.none("UPDATE estoque SET cod_prod = $1, qtd_est = $2, validade_est = $3, datafab_est = $4  WHERE cod_prod = $5 and datafab_est = $6 and tipo_est = 2;", [
      cod, qtdest, validade, datest, codalt, datalt]);

    console.log(`Estoque alterado: COD ${codalt} e Data: ${datalt}`);
    res.sendStatus(202);

  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});



// -------------------- APIs de Estoque Produção ------------------//




//Estoque produção é identificado pelo tipo_est = 3 (tipo do estoque)
app.get("/estoqueproducao", async (req, res) => {
  try {

    const estoque = await db.any("SELECT CAST(e.datafab_est AS DATE) AS datafab_est, e.cod_prod, e.qtd_est, e.validade_est, p.nome_prod, p.grupo_produto FROM estoque e inner join produto p on p.cod_prod = e.cod_prod WHERE tipo_est = 3 order by e.cod_prod;");
    console.log("Retornando estoque contado.");
    res.status(200).json(estoque);

  } catch (error) {

    console.log(error);
    res.sendStatus(400);

  }
});


//Abaixo insere um estoque do tipo contado (tipo_est = 3)
app.post("/estoqueproducao", async (req, res) => {
  try {

    const cod = req.body.cod;
    const qtdest = req.body.qtdest;
    const validade = req.body.validade;
    const datest = req.body.datest;

    const novoEstoque = await db.one(
      "INSERT INTO estoque (datafab_est, qtd_est, validade_est, cod_prod, tipo_est) VALUES ($1, $2, $3, $4, 3) RETURNING cod_prod;",
      [datest, qtdest, validade, cod]
    );

    console.log(`Estoque criado do produto de código: ${cod}`);
    res.status(201).json(novoEstoque);

  } catch (error) {

    console.log(error);
    res.status(400).json({ error: error.message });

  }
});


//Abaixo deleta o estoque produção conforme a data e o código do produto
app.delete("/estoqueproducao/:id/:datafab", async (req, res) => {
  try {
    const cod = req.params.id;
    const datafab = req.params.datafab;

    await db.none("DELETE FROM estoque WHERE tipo_est = 3 and cod_prod = $1 and datafab_est = $2;", [cod, datafab]);

    console.log(`Estoque removido do produto: ID ${cod} e Data Fab ${datafab}`);
    res.sendStatus(202);

  } catch (error) {

    console.log(error);
    res.status(400).json({ error: error.message });

  }
});


//Abaixo traz o estoque produção com base no id do produto e na data de fabricação
app.get("/estoqueproducao/:id/:datafab", async (req, res) => {
  try {

    const cod = req.params.id;
    const datafab = req.params.datafab;

    console.log(`Retornando ID: ${cod} e Data Fabricação: ${datafab}.`);

    const estoque = await db.one(
      "SELECT e.datafab_est, e.cod_prod, e.qtd_est, e.validade_est, p.nome_prod, p.grupo_produto FROM estoque e inner join produto p on p.cod_prod = e.cod_prod WHERE e.tipo_est = 3 and e.cod_prod = $1 and e.datafab_est = $2;", [cod, datafab]
    );

    res.json(estoque).status(200);

  } catch (error) {

    console.log(error);
    res.sendStatus(400);

  }
});


//Abaixo faz o update do estoque produção conforme a data da fabricação e o código do produto
app.put("/estoqueproducao/:id/:datafab", async (req, res) => {
  try {

    const cod = req.body.cod;
    const datest = req.body.datest;
    const validade = req.body.validade;
    const qtdest = req.body.qtdest;
    const datalt = req.params.datafab;
    const codalt = req.params.id;
     
    await db.none("UPDATE estoque SET cod_prod = $1, qtd_est = $2, validade_est = $3, datafab_est = $4  WHERE cod_prod = $5 and datafab_est = $6 and tipo_est = 3;", [
      cod, qtdest, validade, datest, codalt, datalt]);

    console.log(`Estoque alterado: COD ${codalt} e Data: ${datalt}`);
    res.sendStatus(202);

  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});






// -------------------- APIs de Vendas ------------------//




//Pega as vendas
app.get("/vendas", async (req, res) => {
  try {

    const estoque = await db.any("SELECT CAST(v.data_ven AS DATE) AS data_ven, v.cod_prod, v.qtd_ven, p.nome_prod, p.grupo_produto FROM vendas v inner join produto p on p.cod_prod = v.cod_prod order by v.cod_prod;");
    console.log("Retornando as vendas.");
    res.status(200).json(estoque);

  } catch (error) {

    console.log(error);
    res.sendStatus(400);

  }
});


//Abaixo insere um estoque do tipo contado (tipo_est = 3)
app.post("/vendas", async (req, res) => {
  try {

    const cod = req.body.cod;
    const qtdven = req.body.qtdven;
    const dataven = req.body.dataven;

    const novoEstoque = await db.one(
      "INSERT INTO vendas (data_ven, cod_prod, qtd_ven) VALUES ($1, $2, $3) RETURNING cod_prod;",
      [dataven, cod, qtdven]
    );

    console.log(`Venda criada do produto de código: ${cod}`);
    res.status(201).json(novoEstoque);

  } catch (error) {

    console.log(error);
    res.status(400).json({ error: error.message });

  }
});


//Abaixo deleta a venda conforme a data e o código do produto
app.delete("/vendas/:id/:dataven", async (req, res) => {
  try {
    const cod = req.params.id;
    const dataven = req.params.dataven;

    await db.none("DELETE FROM vendas WHERE cod_prod = $1 and data_ven = $2;", [cod, dataven]);

    console.log(`Venda removida do produto: ID ${cod} e Data Venda: ${dataven}`);
    res.sendStatus(202);

  } catch (error) {

    console.log(error);
    res.status(400).json({ error: error.message });

  }
});


//Abaixo traz o estoque produção com base no id do produto e na data de fabricação
app.get("/vendas/:id/:datafab", async (req, res) => {
  try {

    const cod = req.params.id;
    const datafab = req.params.datafab;

    console.log(`Retornando ID: ${cod} e Data Venda: ${datafab}.`);

    const estoque = await db.one(
      "SELECT CAST(v.data_ven AS DATE) AS data_ven, v.cod_prod, v.qtd_ven, p.nome_prod, p.grupo_produto FROM vendas v inner join produto p on p.cod_prod = v.cod_prod WHERE v.cod_prod = $1 and v.data_ven = $2;", [cod, datafab]
    );

    res.json(estoque).status(200);

  } catch (error) {

    console.log(error);
    res.sendStatus(400);

  }
});


//Abaixo faz o update da venda conforme a data da venda e o código do produto
app.put("/vendas/:id/:dataven", async (req, res) => {
  try {

    const cod = req.body.cod;
    const dataven = req.body.dataven;
    const qtdven = req.body.qtdven;
    const datalt = req.params.dataven;
    const codalt = req.params.id;
     
    await db.none("UPDATE vendas SET cod_prod = $1, qtd_ven = $2, data_ven = $3  WHERE cod_prod = $4 and data_ven = $5;", [
      cod, qtdven, dataven, codalt, datalt]);

    console.log(`Venda alterada: COD ${codalt} e Data: ${datalt}`);
    res.sendStatus(202);

  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});



