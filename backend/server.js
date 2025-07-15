const express = require("express");
const { body, validationResult } = require('express-validator');
const pgp = require("pg-promise")({});
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const usuario = "postgres";
const senha = "senha";
const db = pgp(`postgres://${usuario}:${senha}@localhost:5432/controle_estoque`);

const app = express();
app.use(express.json());

// busca os arquivos 'estáticos' na pasta 'public': JS e CSS
app.use(express.static(__dirname + "/public"));

const PORT = 3002;
app.listen(PORT, () => console.log(`Servidor está rodando na porta ${PORT}.`));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});







// -------------------- Autenticacao ------------------//

app.use(passport.initialize());


//Passport para login
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",   
      passwordField: "senha"
    },
    async (email, senha, done) => {
      try {
        const usuario = await db.oneOrNone(
          "SELECT * FROM usuario WHERE email_usu = $1;",
          [email]
        );

        if (!usuario) {
          return done(null, false, { message: "Usuário não encontrado." });
        }

        const senhaOk = await bcrypt.compare(senha, usuario.senha_usu);

        if (!senhaOk) {
          return done(null, false, { message: "Senha incorreta." });
        }

        return done(null, usuario);
      } catch (err) {
        return done(err);
      }
    }
  )
);


//Posto do Login, o arquivo login.js utiliza dessa função para pega as permissões
app.post("/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    const usuario = req.user;

    //Adiciona permissão no retorno para pode utilizar no acesso das telas
    const payload = {
      email: usuario.email_usu,
      permissao: usuario.siglaper, 
    };

    const token = jwt.sign(payload, "your-secret-key", { expiresIn: "1h" });

    res.json({ message: "Login efetuado com sucesso", token });
  }
);



//Abaixo é verificado a permissao para liberar as APIs que pode ter acesso
function requirePermissao(permissoesPermitidas) {
  return (req, res, next) => {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token ausente ou inválido" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, "your-secret-key");

      if (!permissoesPermitidas.includes(decoded.permissao)) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      req.usuario = decoded; 
      next(); 
    } catch (err) {
      return res.status(401).json({ message: "Token inválido" });
    }
  };
}


// -------------------- APIs de Produtos ------------------//

//Pega todos os produtos
app.get("/produtos", requirePermissao(["VEN", "ADM", "CON", "PRD"]), async (req, res) => {
  try {
    const produtos = await db.any("SELECT cod_prod, nome_prod, grupo_produto, CASE WHEN status_prod = true then 'Ativo' else 'Inativo' end as status_prod FROM produto order by cod_prod;");
    console.log("Retornando todos os produtos.");
    res.status(200).json(produtos);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});


//Pega produto conforme id informado, essa API é utilizada para pegar um produto em uma tabela conforme o botão do lado do CRUD
app.get("/produtos/:id", requirePermissao(["VEN", "ADM", "CON", "PRD"]), async (req, res) => {
  try {
    const cod = req.params.id;
    console.log(`Retornando ID: ${cod}.`);
    const produtos = await db.one(
      "SELECT cod_prod, nome_prod, grupo_produto, cast(status_prod as varchar) as status_prod FROM produto WHERE cod_prod = $1;",[cod]
    );
    res.json(produtos).status(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});


//Abaixo filtra os produtos com base no código informado
app.get("/filtraprodutos/:id", requirePermissao(["VEN", "ADM", "CON", "PRD"]), async (req, res) => {
  try {
    const cod = req.params.id;
    console.log(`Retornando ID: ${cod}.`);
    const produtos = await db.any(
      "SELECT cod_prod, nome_prod, grupo_produto, CASE WHEN status_prod = true then 'Ativo' else 'Inativo' end as status_prod  FROM produto WHERE CAST(cod_prod AS VARCHAR) LIKE $1;", [`%${cod}%`]
    );
    res.json(produtos).status(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});


//Insere produto
app.post("/produtos", requirePermissao(["VEN", "ADM", "CON", "PRD"]), async (req, res) => {
  try {
    const cod = req.body.cod;
    const nome = req.body.nome;
    const grupo = req.body.grupo;
    const stat = req.body.stat;

    const novoProduto = await db.one(
      "INSERT INTO produto (cod_prod, nome_prod, grupo_produto, status_prod) VALUES ($1, $2, $3, CASE WHEN $4 = 'ativo' then true else false end) RETURNING cod_prod;",
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
app.put("/produtos/:id", requirePermissao(["VEN", "ADM", "CON", "PRD"]), async (req, res) => {
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


//Deleta prodiuto com base no id informado
app.delete("/produtos/:id", requirePermissao(["VEN", "ADM", "CON", "PRD"]), async (req, res) => {
  try {
    const cod = req.params.id;

      await db.none("DELETE FROM historico_estoque WHERE cod_prod = $1;", [cod]);
      await db.none("DELETE FROM vendas WHERE cod_prod = $1;", [cod]);
      await db.none("DELETE FROM estoque WHERE cod_prod = $1;", [cod]);
      await db.none("DELETE FROM produto WHERE cod_prod = $1;", [cod]);

    console.log(`Produto removido: ID ${cod}`);
    res.sendStatus(202);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});







// -------------------- APIs de Estoque Inicial ------------------//




//Estoque inicial é identificado pelo tipo_est = 1 (tipo do estoque), abaixo traz todo o estoque inicial 
app.get("/estoqueinicial", requirePermissao(["VEN", "ADM", "CON", "PRD"]), async (req, res) => {
  try {

    const estoque = await db.any("SELECT CAST(e.datafab_est AS DATE) AS datafab_est, e.cod_prod, e.qtd_est, e.validade_est, p.nome_prod, p.grupo_produto FROM estoque e inner join produto p on p.cod_prod = e.cod_prod WHERE tipo_est = 1 order by e.cod_prod;");
    console.log("Retornando estoque inicial.");
    res.status(200).json(estoque);

  } catch (error) {

    console.log(error);
    res.sendStatus(400);

  }
});



//Abaixo traz a contagem estoque histórico inicial tipo_est = 1 (tipo do estoque), essa parte é utilizada pelo estoquecontad.js para validar se teve etsoque inicial, já que é necessário ter um estoque inicial antes de tudo
app.get("/contagemestoqueinicial/:id", requirePermissao(["VEN", "ADM", "CON", "PRD"]), async (req, res) => {
  try {

    const cod = req.params.id;

    console.log(`Retornando contagem estoque ID: ${cod}.`);

    const estoqueInicial = await db.one(
      "SELECT COUNT(*) as qtd FROM estoque WHERE cod_prod = $1 and tipo_est = 1;", [cod]
    );

    res.json(estoqueInicial).status(200);

  } catch (error) {

    console.log(error);
    res.sendStatus(400);

  }
});



//Abaixo insere um estoque do tipo inicial (tipo_est = 1)
app.post("/estoqueinicial", requirePermissao(["VEN", "ADM", "CON", "PRD"]), async (req, res) => {
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
app.delete("/estoqueinicial/:id/:datafab", requirePermissao(["VEN", "ADM", "CON", "PRD"]), async (req, res) => {
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
app.get("/estoqueinicial/:id/:datafab", requirePermissao(["VEN", "ADM", "CON", "PRD"]), async (req, res) => {
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
app.put("/estoqueinicial/:id/:datafab", requirePermissao(["VEN", "ADM", "CON", "PRD"]), async (req, res) => {
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
app.get("/estoquecontado", requirePermissao(["ADM", "CON"]),  async (req, res) => {
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
app.post("/estoquecontado", requirePermissao(["ADM", "CON"]), async (req, res) => {
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
app.delete("/estoquecontado/:id/:datafab", requirePermissao(["ADM", "CON"]), async (req, res) => {
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
app.get("/estoquecontado/:id/:datafab", requirePermissao(["ADM", "CON"]), async (req, res) => {
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
app.put("/estoquecontado/:id/:datafab", requirePermissao(["ADM", "CON"]), async (req, res) => {
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




//Estoque produção é identificado pelo tipo_est = 3 (tipo do estoque), abaixo traz todo o estoque produção
app.get("/estoqueproducao", requirePermissao(["ADM", "PRD"]), async (req, res) => {
  try {

    const estoque = await db.any("SELECT CAST(e.datafab_est AS DATE) AS datafab_est, e.cod_prod, e.qtd_est, e.validade_est, p.nome_prod, p.grupo_produto FROM estoque e inner join produto p on p.cod_prod = e.cod_prod WHERE tipo_est = 3 order by e.cod_prod;");
    console.log("Retornando estoque contado.");
    res.status(200).json(estoque);

  } catch (error) {

    console.log(error);
    res.sendStatus(400);

  }
});


//Abaixo insere um estoque producao (tipo_est = 3)
app.post("/estoqueproducao", requirePermissao(["ADM", "PRD"]), async (req, res) => {
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
app.delete("/estoqueproducao/:id/:datafab", requirePermissao(["ADM", "PRD"]), async (req, res) => {
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
app.get("/estoqueproducao/:id/:datafab", requirePermissao(["ADM", "PRD"]), async (req, res) => {
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
app.put("/estoqueproducao/:id/:datafab", requirePermissao(["ADM", "PRD"]), async (req, res) => {
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
app.get("/vendas", requirePermissao(["ADM", "VEN"]), async (req, res) => {
  try {

    const estoque = await db.any("SELECT CAST(v.data_ven AS DATE) AS data_ven, v.cod_prod, v.qtd_ven, p.nome_prod, p.grupo_produto FROM vendas v inner join produto p on p.cod_prod = v.cod_prod order by v.cod_prod;");
    console.log("Retornando as vendas.");
    res.status(200).json(estoque);

  } catch (error) {

    console.log(error);
    res.sendStatus(400);

  }
});


//Abaixo insere vendas
app.post("/vendas", requirePermissao(["ADM", "VEN"]), async (req, res) => {
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
app.delete("/vendas/:id/:dataven", requirePermissao(["ADM", "VEN"]), async (req, res) => {
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
app.get("/vendas/:id/:datafab", requirePermissao(["ADM", "VEN"]), async (req, res) => {
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
app.put("/vendas/:id/:dataven", requirePermissao(["ADM", "VEN"]), async (req, res) => {
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







// -------------------- APIs de Historico de Estoque ------------------//




//Abaixo as API são bem importantes pois elas que armazenam os dados no histórico que é utilizado para mostrar no balanço de estoque
//No caso é utilizada a contagemhistoricoestoque para ver se tem um historico de estoque de hoje para ser atualizado com aprodução ou venda
//O historico de estoque é feito a partir do estoque inicial, quando se é cadastrado um estoque inicial é necessário fazer uma
//chamada na API historicoinicial pois ela vai inserir o primeiro histórico que vai ser atualizado ou inserido automáticamente quando
//for feito inserção nas vendas ou na produção, e vai depender da contagem do estoque atual conforme mencionado no início desse texto
//se contagemhistoricoestoque/:id = 0, isso quer dizer que não é o dia do estoque inicial então tem que dar um post("/historicoinicial"
//caso contrário é dia de estoque inicial e nesse caso tem que atualizar app.put("/historicoestoquevendas", e app.put("/historicoestoqueproducao",
//com o valor da produção e das vendas (ver requisitos funcionais).


//Abaixo traz a contagem estoque histórico calculado (historico estoque calculado é tipo_his = 1)
app.get("/contagemhistoricoestoque/:id", requirePermissao(["ADM", "VEN", "CON", "PRD"]), async (req, res) => {
  try {

    const cod = req.params.id;

    console.log(`Retornando contagem estoque ID: ${cod}.`);

    const historicoEstoque = await db.one(
      "SELECT COUNT(*) as qtd FROM historico_estoque WHERE cod_prod = $1 and CAST(data_his AS DATE) = CAST(NOW() AS DATE) and tipo_his = 1;", [cod]
    );

    res.json(historicoEstoque).status(200);

  } catch (error) {

    console.log(error);
    res.sendStatus(400);

  }
});



//Abaixo insere  o histórico inicial como histórico calculado (historico estoque calculado é tipo_his = 1)
app.post("/historicoinicial", requirePermissao(["ADM", "VEN", "CON", "PRD"]), async (req, res) => {
  try {

    const cod = req.body.cod;
    const qtdest = req.body.qtdest;

    const novoHistoricoEstoque = await db.one(
      "INSERT INTO historico_estoque (data_his, vl_his, tipo_his, cod_prod)  VALUES(CAST(NOW() AS DATE), $1, 1, $2) RETURNING cod_prod",
      [qtdest, cod]
    );

    console.log(`Historico inserido do produto: ${cod}`);
    res.status(201).json(novoHistoricoEstoque);

  } catch (error) {

    console.log(error);
    res.status(400).json({ error: error.message });

  }
});



//Abaixo insere o histórico estoque como histórico calculado (historico estoque calculado é tipo_his = 1)
app.post("/historicoestoque", requirePermissao(["ADM", "VEN", "CON", "PRD"]), async (req, res) => {
  try {

    const cod = req.body.cod;
    const producao = req.body.qtdest;
    const vendas = req.body.qtdVendas;

    const novoHistoricoEstoque = await db.one(
      "WITH estoque_anterior (valor, cod_prod) AS (SELECT vl_his, cod_prod FROM historico_estoque WHERE tipo_his = 1 and cod_prod = $1 and CAST(data_his AS DATE) < CAST(NOW() AS DATE) ORDER BY data_his DESC limit 1) INSERT INTO historico_estoque (data_his, vl_his, tipo_his, cod_prod)  VALUES(CAST(NOW() AS DATE), (SELECT valor FROM estoque_anterior) + $2 - $3, 1, $4) RETURNING cod_prod;",
      [cod, producao, vendas, cod]
    );

    console.log(`Historico inserido do produto: ${cod}`);
    res.status(201).json(novoHistoricoEstoque);

  } catch (error) {

    console.log(error);
    res.status(400).json({ error: error.message });

  }
});




// Atualiza histórico estoque calculado (tipo_his = 1) na parte das vendas
app.put("/historicoestoquevendas", requirePermissao(["ADM", "VEN", "CON", "PRD"]), async (req, res) => {
  try {

    const cod = req.body.cod;

    await db.none(
      "WITH contagem_vendas (qtd) AS (SELECT  COALESCE(SUM(qtd_ven), 0)  FROM vendas WHERE  cast(data_ven as date) = cast(now() as date) and cod_prod = $1), estoque_anterior (qtd) AS (SELECT COALESCE(vl_his, 0) FROM historico_estoque  WHERE cod_prod = $2 AND tipo_his = 1 AND CAST(data_his AS DATE) = CAST(NOW() AS DATE)) UPDATE historico_estoque SET vl_his =  ((SELECT qtd FROM estoque_anterior) - (select qtd from contagem_vendas)) WHERE cod_prod = $3 AND tipo_his = 1 AND CAST(data_his AS DATE) = CAST(NOW() AS DATE);",
      [cod, cod, cod]
    );

    console.log(`Atualizado estoque historico venda do produto opa: ${cod}`);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});



// Atualiza histórico estoque calculado (tipo_his = 1) na parte da produção
app.put("/historicoestoqueproducao", requirePermissao(["ADM", "VEN", "CON", "PRD"]), async (req, res) => {
  try {

    const cod = req.body.cod;

    await db.none(
      "WITH contagem_producao (qtd) AS (SELECT COALESCE(SUM(qtd_est), 0) FROM estoque WHERE tipo_est = 3 and cast(datafab_est as date) = cast(now() as date) and cod_prod = $1), estoque_anterior (qtd) AS (SELECT COALESCE(vl_his, 0) FROM historico_estoque  WHERE cod_prod = $2 AND tipo_his = 1 AND CAST(data_his AS DATE) = CAST(NOW() AS DATE)) UPDATE historico_estoque SET vl_his =  ((SELECT qtd FROM estoque_anterior) + (select qtd from contagem_producao)) WHERE cod_prod = $3 AND tipo_his = 1 AND CAST(data_his AS DATE) = CAST(NOW() AS DATE);",
      [cod, cod, cod]
    );

    console.log(`Atualizado estoque historico producçao do produto opa: ${cod}`);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});



// Atualiza histórico estoque calculado (tipo_his = 1) na parte da venda
app.put("/historicoestoquevendaedicao", requirePermissao(["ADM", "VEN", "CON", "PRD"]), async (req, res) => {
  try {

    const cod = req.body.cod;
    const qtd_ante = req.body.qtd_ant;
    const qtd_novo = req.body.qtd_novo;
    const datareferencia = req.body.dataven;
    await db.none(
      "UPDATE historico_estoque AS h1 SET vl_his = h2.vl_his +  CAST($1 AS INT) - CAST($2 AS INT) FROM historico_estoque h2 WHERE h1.cod_prod = h2.cod_prod AND CAST(h2.data_his AS DATE) = CAST(h1.data_his AS DATE) AND CAST(h1.data_his AS DATE) >= $3 AND h1.cod_prod = $4;",
      [qtd_ante, qtd_novo, datareferencia, cod]
    );

    console.log(`Atualizado estoque historico do produto : ${cod}, e ${qtd_ante} opa ${qtd_novo} olha ${datareferencia}`);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});






// Atualiza histórico estoque calculado (tipo_his = 1) na parte da venda
app.put("/historicoestoquevendaedicao", requirePermissao(["ADM", "VEN", "CON", "PRD"]), async (req, res) => {
  try {

    const cod = req.body.cod;
    const qtd_ante = req.body.qtd_ant;
    const qtd_novo = req.body.qtd_novo;
    const datareferencia = req.body.dataven;
    await db.none(
      "UPDATE historico_estoque AS h1 SET vl_his = h2.vl_his +  CAST($1 AS INT) - CAST($2 AS INT) FROM historico_estoque h2 WHERE h1.cod_prod = h2.cod_prod AND CAST(h2.data_his AS DATE) = CAST(h1.data_his AS DATE) AND CAST(h1.data_his AS DATE) >= $3 AND h1.cod_prod = $4;",
      [qtd_ante, qtd_novo, datareferencia, cod]
    );

    console.log(`Atualizado estoque historico do produto epapappape: ${cod}`);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});



// Atualiza histórico estoque calculado (tipo_his = 1) na parte da producao
app.put("/historicoestoqueproducaoedicao", requirePermissao(["ADM", "VEN", "CON", "PRD"]), async (req, res) => {
  try {

    const cod = req.body.cod;
    const qtd_ante = req.body.qtd_anterior;
    const qtd_novo = req.body.qtd_novo;
    const datareferencia = req.body.datest;
    await db.none(
      "UPDATE historico_estoque AS h1 SET vl_his = h2.vl_his +  CAST($1 AS INT) - CAST($2 AS INT) FROM historico_estoque h2 WHERE h1.cod_prod = h2.cod_prod AND CAST(h1.data_his AS DATE) >= $3 AND h2.cod_prod = $4",
      [qtd_novo, qtd_ante, datareferencia, cod]
    );

    console.log(`Atualizado estoque historico do produto elapa: ${cod}`);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});



// Atualiza histórico estoque calculado (tipo_his = 1) na parte da venda
app.put("/historicoestoqueaodeletarvenda", requirePermissao(["ADM", "VEN", "CON", "PRD"]), async (req, res) => {
  try {

    const cod = req.body.cod;
    const qtd_ante = req.body.qtd_venda;
    const datareferencia = req.body.datavenda;
    await db.none(
      "UPDATE historico_estoque AS h1 SET vl_his = h2.vl_his + CAST($1 AS INT) FROM historico_estoque h2 WHERE h1.cod_prod = h2.cod_prod AND CAST(h1.data_his AS DATE) >= $2 AND h2.cod_prod = $3",
      [qtd_ante, datareferencia, cod]
    );

    console.log(`Atualizado estoque historico do produto deletado: ${cod}`);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});





// Atualiza histórico estoque calculado (tipo_his = 1) na parte da producao
app.put("/historicoestoqueaodeletarproducao", requirePermissao(["ADM", "VEN", "CON", "PRD"]), async (req, res) => {
  try {

    const cod = req.body.cod;
    const qtd_ante = req.body.qtd_prod;
    const datareferencia = req.body.dataprdo;
    await db.none(
      "UPDATE historico_estoque AS h1 SET vl_his = h2.vl_his + CAST($1 AS INT) FROM historico_estoque h2 WHERE h1.cod_prod = h2.cod_prod AND CAST(h1.data_his AS DATE) >= $2 AND h2.cod_prod = $3",
      [qtd_ante, datareferencia, cod]
    );

    console.log(`Atualizado estoque historico do produto deletado: ${cod}`);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});









// -------------------- APIs de Balanço de Estoque  ------------------//






//Pega o balanço de estoque conforme o dia atual
app.get("/balancoestoque/:datafiltro", requirePermissao(["ADM", "VEN", "CON", "PRD"]), async (req, res) => {
  try {
    
    //console.log(`Retornando o balanco de estoque na data ${datafiltro}`);
    const datafiltro = req.params.datafiltro;
    const balancoEstoque = await db.any("SELECT he.data_his as dt_referencia, pr.cod_prod, pr.nome_prod, pr.grupo_produto, COALESCE(ep.qtd_est, 0) AS qtd_producao, CASE WHEN (SELECT he2.vl_his FROM historico_estoque he2 where he2.cod_prod = he.cod_prod and cast(he2.data_his as date) < cast(he.data_his as date) order by he.data_his limit 1) IS NULL THEN (COALESCE(he.vl_his,0) + COALESCE(ve.qtd_ven,0) - COALESCE(ep.qtd_est,0)) ELSE (SELECT he2.vl_his FROM historico_estoque he2 where he2.cod_prod = he.cod_prod and cast(he2.data_his as date) < cast(he.data_his as date) order by he.data_his limit 1) END as qtd_estoque_anterior, he.vl_his as qtd_estoque_calculado, coalesce(ve.qtd_ven,0) as qtd_vendas, coalesce(ec.qtd_est,0) as qtd_contado, coalesce(ep.qtd_est,0) as qtd_producao, (coalesce(he.vl_his, 0) - coalesce(ec.qtd_est, 0)) as qtd_balanco FROM historico_estoque he LEFT JOIN vendas ve on ve.cod_prod = he.cod_prod and CAST(ve.data_ven AS DATE) = CAST(he.data_his AS DATE) LEFT JOIN ( SELECT datafab_est, qtd_est, cod_prod FROM estoque WHERE tipo_est = 2 ) ec on ec.cod_prod = he.cod_prod and CAST(ec.datafab_est AS DATE) = CAST(he.data_his AS DATE) LEFT JOIN (SELECT datafab_est, qtd_est, cod_prod FROM estoque WHERE tipo_est = 3) ep on ep.cod_prod = he.cod_prod and CAST(ep.datafab_est AS DATE) = CAST(he.data_his AS DATE) LEFT JOIN produto pr ON pr.cod_prod = he.cod_prod WHERE he.data_his = $1;", [datafiltro]);
    console.log(`Retornando o balanco de estoque na data ${datafiltro}`);

    res.status(200).json(balancoEstoque);
  } catch (error) {

    console.log(error);
    res.sendStatus(400);

  }
});







// -------------------- APIs de Usuairo  ------------------//

app.post("/usuarios",requirePermissao(["ADM"]), async (req, res) => {
	const saltRounds = 10;
	try {

    console.log("Teste");
		const nome = req.body.nome;
		const email = req.body.email;
    const senha = req.body.senha;
    const permissao = req.body.permissao;
		const salt = bcrypt.genSaltSync(saltRounds);
		const senhahashe = bcrypt.hashSync(senha, salt);
   
		console.log(`Email: ${email} - Senha: ${senhahashe}`);
		db.none("INSERT INTO usuario (email_usu, nome_usu, senha_usu, siglaper) VALUES ($1, $2, $3, CASE WHEN $4 = 'geral' THEN 'ADM' WHEN $4 = 'venda' THEN 'VEN' WHEN $4 = 'producao' THEN 'PRD' ELSE 'CON' END);", [
			email,
			nome,
      senhahashe,
      permissao
		]);
		res.sendStatus(200);
	} catch (error) {
		console.log(error);
		res.sendStatus(400);
	}
});



//Pega todos os usuarios
app.get("/usuarios", requirePermissao(["ADM"]), async (req, res) => {
  try {
    const usuarios = await db.any("select us.nome_usu, us.email_usu, pe.descricao_per from usuario us INNER JOIN permissao pe ON us.siglaper = pe.sigla_per;");
    console.log("Retornando todos os usuarios.");
    res.status(200).json(usuarios);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});



//Pega usuario conforme id informado
app.get("/usuarios/:email", requirePermissao(["ADM"]), async (req, res) => {
  try {
    const email = req.params.email;
    console.log(`Retornando usuairo email: ${email}.`);
    const usuario = await db.one(
      "select us.nome_usu, us.email_usu, pe.descricao_per, CASE WHEN us.siglaper = 'ADM' THEN 'geral' WHEN us.siglaper = 'CON' THEN 'contado' WHEN us.siglaper = 'PRD' THEN 'producao' else 'producao' END AS siglaper from usuario us INNER JOIN permissao pe ON us.siglaper = pe.sigla_per and us.email_usu = $1;",[email]
    );
    res.json(usuario).status(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});




//Deleta usuario com base no email informado
app.delete("/usuarios/:email", requirePermissao(["ADM"]), async (req, res) => {
  try {
    const email = req.params.email;

    await db.none("DELETE FROM usuario WHERE email_usu=$1;", [email]);
    console.log(`Usuário removido: email ${email}`);

    res.sendStatus(202);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }

});


//Atualiza usuario com base no email informado, não atualiza a senha apenas demais informações
app.put("/usuarios/:email", requirePermissao(["ADM"]), async (req, res) => {
  try {
    const email = req.body.email;
    const nome = req.body.nome;
    const permissao = req.body.permissao;
    const emailalt = req.params.email;
  
    await db.none("UPDATE usuario SET email_usu=$1, nome_usu=$2, siglaper=(CASE WHEN $3 = 'geral' THEN 'ADM' WHEN $3 = 'venda' THEN 'VEN' WHEN $3 = 'producao' THEN 'PRD' ELSE 'CON' END)  WHERE email_usu=$4;", [
      email, nome, permissao, emailalt
    ]);

    console.log(`Usuario alterado: email ${emailalt}`);
    res.sendStatus(202);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});






