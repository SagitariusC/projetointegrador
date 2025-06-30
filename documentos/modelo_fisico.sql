-- Exported from QuickDBD: https://www.quickdatabasediagrams.com/
-- Link to schema: https://app.quickdatabasediagrams.com/#/d/HlZJ2K
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.


CREATE TABLE "usuario" (
    "email_usu" varchar(50)   NOT NULL,
    "nome_usu" varchar(50)   NOT NULL,
    "senha_usu" varchar(20)   NOT NULL,
    "siglaper" varchar(4)   NOT NULL,
    CONSTRAINT "pk_usuario" PRIMARY KEY (
        "email_usu"
     )
);

CREATE TABLE "permissao" (
    "sigla_per" varchar(4)   NOT NULL,
    "descricao_per" varchar(50)   NOT NULL,
    CONSTRAINT "pk_permissao" PRIMARY KEY (
        "sigla_per"
     )
);

CREATE TABLE "produto" (
    "cod_prod" int   NOT NULL,
    "nome_prod" varchar(50)   NOT NULL,
    "grupo_produto" varchar(50)   NOT NULL,
    "status_prod" boolean   NOT NULL,
    CONSTRAINT "pk_produto" PRIMARY KEY (
        "cod_prod"
     )
);

CREATE TABLE "vendas" (
    "data_ven" date   NOT NULL,
    "qtd_ven" int   NOT NULL,
    "cod_prod" int   NOT NULL,
    CONSTRAINT "pk_vendas" PRIMARY KEY (
        "data_ven","cod_prod"
     )
);

CREATE TABLE "estoque" (
    "datafab_est" date   NOT NULL,
    "qtd_est" int   NOT NULL,
    "validade_est" int   NOT NULL,
    "tipo_est" int   NOT NULL,
    "cod_prod" int   NOT NULL,
    CONSTRAINT "pk_estoque" PRIMARY KEY (
        "datafab_est","tipo_est","cod_prod"
     )
);

CREATE TABLE "historico_estoque" (
    "data_his" date   NOT NULL,
    "vl_his" int   NOT NULL,
    "tipo_his" int   NOT NULL,
    "cod_prod" int   NOT NULL,
    CONSTRAINT "pk_historico_estoque" PRIMARY KEY (
        "data_his","tipo_his","cod_prod"
     )
);

ALTER TABLE "usuario" ADD CONSTRAINT "fk_usuario_siglaper" FOREIGN KEY("siglaper")
REFERENCES "permissao" ("sigla_per");

ALTER TABLE "vendas" ADD CONSTRAINT "fk_vendas_cod_prod" FOREIGN KEY("cod_prod")
REFERENCES "produto" ("cod_prod");

ALTER TABLE "estoque" ADD CONSTRAINT "fk_estoque_cod_prod" FOREIGN KEY("cod_prod")
REFERENCES "produto" ("cod_prod");

ALTER TABLE "historico_estoque" ADD CONSTRAINT "fk_historico_estoque_cod_prod" FOREIGN KEY("cod_prod")
REFERENCES "produto" ("cod_prod");

