# projetointegrador
Repositório dedicado ao projeto integrador - 2025/01

Alunos: Bruno Vieira Florisbal (matrícula 1921101033) e Willian Patrick Gonçalves (matrícula 20230003870)

# Pasta Documentos
Contêm todos os documentos necessários para a aplicação, nele
está o arquivo "requisitos.pdf" onde se econtram os requisitos 
do sistema, também tem o arquivo "Trabalho Integrador - Modelo Conceitual Ajustado.png"
e o "linkmodeloconceitual" que são o png e a base do modelo modelo conceitual 
conforme os requisitos utilizando do brModelo.
Também possuí as telas de engenharia, que são a de produtos (tela_produtos_engenharia_software),
cadastro de produtos(tela_produtos_cadastro_engenharia_software),
edição de produtos(tela_produtos_edicao_engenharia_software)
e balanço de estoque(tela_balanco_estoque_engenharia_software).
Nessa pasta tem o arquivo "Trabalho Integrador - Modelo Lógico Gráfico.png" que é o 
gráfico do modelo lógico do banco utilizando "QuickDBD".
Também tem o arquivo "modelo_fisico.sql" que é o SQL de criação das tabelas conforme o
modelo lógico feito no "QuickDBD" exportando o modelo para PostgreSQL.

# Pasta Frontend
Contêm os códigos do front-end do sistema. 
Para executar é necessário copiar ou baixar e dar um npm install e npm run dev no terminal
da pasta.


# Pasta Backend
Contêm os códigos do backend do sistema.
Para executar é necssário dar um npm install e npm nodemon server.js e abrir no navegador o link "http://localhost:3002/"
no navegador.
Obs: Para executar basta baixar a pasta backend e fazer os passo acima.

# Instruções de execução
Criar um banco "controle_estoque" ou do nome que desejar usando PostgreSQL, executar o arquivo
"modelo_fisico.sql" no banco criado, após sucesso na criação do banco e das tabelas, é necessário
adicionar as permissões (não existe um CRUD de permissão, não tem RF pra isso) então
execute "insert into permissao (sigla_per, descricao_per) VALUES('VEN','Venda'), ('PRD','Produção'), ('CON','Estoque Contado'), ('ADM','Geral');" 
no banco criado, outra coisa, como é feito hash para criação de senha dos usuários e a tabela de usuários tem senha
com VARCHAR(20) é necsssário aumentar o tamanho do atributo então execute "alter table usuario alter column senha_usu type varchar(200);", após 
isso insere o na tabela de usuários um novo usuário com "insert into usuario(email_usu, nome_usu, senha_usu, siglaper) values('teste@teste.com', 'Teste', '$2b$10$nw2Ukh06VVIZJjvjYRIktOQLtkrOFzkOGlsW65HwZPAJLSBpT2cT.', 'ADM');", após esse preparatório, baixa a pasta backend (abre o server.js e
altera o usário, a senha do banco e altera o nome do banco se for diferente de "controle_estoque" no seguinte trecho de código:

"const usuario = "postgres";
const senha = "pr3dict";
const db = pgp(`postgres://${usuario}:${senha}@localhost:5432/controle_estoque`);"

e executa npm install e nodemon server.js na pasta backend, então abre no navegador o link "http://localhost:3002/", vai ir para uma tela de login, o e-mail é
"teste@teste.com" e asenha é "senha" :)




