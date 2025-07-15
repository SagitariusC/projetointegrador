axios.defaults.baseURL = "http://localhost:3002/";
axios.defaults.headers.common["Content-Type"] =
    "application/json;charset=utf-8";

const token = localStorage.getItem("token");
    
    

//Abaxio ao clicar no link de sair é feito o logout
$(document).on("click", "#logoutSair", function (e) {
  e.preventDefault();
  localStorage.removeItem("token");
  window.location.href = "index.html";
});
    


$(document).ready(() => {
    loadDataTable();
});



//Ao clicar no botão de novo é feito o submit do mainForm
$('#btnSubmit').click(function() {
    $('#mainForm').submit();
});



//Validação dos dados do mainForm
$('#mainForm').validate({
    rules: {
        nomeusuario: {
            required: true
        },
        emailusuario: {
            required: true,
            email: true
        },
        senhausuario: {
            required: true,
            
        },
        permissao: {
            required: true,
        },
    },

    onfocusout: validateFiels,
    submitHandler: createAjaxPost
    
});



//Função que valida os dados do MainForm
function validateFiels(element, event) {
       $(element).valid();
}



//Função abaixo da um post de um novo usuario
function createAjaxPost() {

    const data = {
        nome: $('#nomeusuario')[0].value,
        email: $('#emailusuario')[0].value,
        senha: $('#senhausuario')[0].value,
        permissao: $('#permissao')[0].value
    }

    console.log("Teste");
    const res = axios.post('/usuarios', data, {headers: {Authorization: `Bearer ${token}`}});
    res.then((query) => {
        console.log(query.data);
        alert("Usuário cadastrado com sucesso!");
        // Limpar os campos do formulário após sucesso
        $('#nomeusuario').val('');
        $('#emailusuario').val('');
        $('#senhausuario').val('');

        // Resetar a validação do formulário
        $('#mainForm').validate().resetForm();

        // Após inserir, buscar e exibir todos os dados
        loadDataTable();
    }).catch((error) => {
        console.log(error);
    });
}



//Faz um get dos usuarios
function loadDataTable() {
    axios.get('/usuarios', {headers: {Authorization: `Bearer ${token}`}})
        .then((response) => {
            processResults(response.data);
        })
        .catch((error) => {
            console.log('Erro ao carregar dados:', error);
        });
}



//Mostra os dados do produto em formato de tabela
function processResults(rows) {
    // Limpar conteúdo anterior da tabela
    $('#rowTable').empty();

    let resultsTable = `
    <div class="col-12 mt-4">
        <table id="resultsTable" class="table table-striped">
        <thead>
            <tr>
                <th scope="col">Nome</th>
                <th scope="col">E-mail</th>
                <th scope="col">Permissão</th>
            </tr>
        </thead>
        <tbody>`;
    for (let i = 0; i < rows.length; i++) {
        resultsTable += `<tr><td> ${rows[i].nome_usu}</td>`;
        resultsTable += `<td>${rows[i].email_usu}</td>`
        resultsTable += `<td>${rows[i].descricao_per}</td>`
        resultsTable += `<td><div class="d-flex" style="gap: 10px;">
                          <button class="btnEdit btn btn-warning" data-id="${rows[i].email_usu}">Editar</button>
                           <button class="btnDelete btn btn-danger" data-id="${rows[i].email_usu}">Deletar</button>
                        </div></td></tr>`
    }
    resultsTable += `
        </tbody>
        </table>
    </div>`;

    // Manter o formulário visível e adicionar a tabela abaixo
    $(resultsTable).appendTo('#rowTable');
}



//Ao clicar no botão delete da tabela criada na função processResults ele deleta conforme o valor do email desse botão
$(document).on('click', '.btnDelete', function () {
    const email = $(this).data('id');
    axios.delete(`/usuarios/${email}`, {headers: {Authorization: `Bearer ${token}`}})
        .then((response) => {
            loadDataTable(); 
        })
        .catch((error) => {
            console.error(error);
        });
});


//Abaixo ao clicar no botão que é gerado no processResult() abre um formulário preenchido com os dado confore o id do btnedit
$(document).on('click', '.btnEdit', function () {
    const email = $(this).data('id');

    axios.get(`/usuarios/${email}`, {headers: {Authorization: `Bearer ${token}`}})
        .then((res) => {

            const usuario = res.data;
            $('#editPermissao').val(usuario.siglaper);
            $('#editNomeusuario').val(usuario.nome_usu);
            $('#editEmailusuario').val(usuario.email_usu);
             
            //Adiciona email ao valor do id do botão de salvar edição do formulário
            $('#btnSaveEdit').data('id', email); 

            $('#modalEdit').modal('show');
        })
        .catch((error) => {
            console.log("Erro ao buscar usuario para edição:", error);
        });
});


//Abaixo ocorre o submit do editForm
$('#btnSaveEdit').click(function () {
    $('#editForm').submit(); 
});



//Validação dos dados do editForm
$('#editForm').validate({
    rules: {
        editNomeusurio: {
            required: true,
        },
        editEmailusuario: {
            required: true,
            email: true
        },
        editPermissao: {
            required: true,
        },

    },
    onfocusout: validateFiels,
    submitHandler: createAjaxPut  
});


//Abaixo ao clicar em salvar no formulário e edição é feito o update dos dados
function createAjaxPut() {

    const email = $('#btnSaveEdit').data('id');

    const data = {
        nome: $('#editNomeusuario').val(),
        email: $('#editEmailusuario').val(),
        permissao: $('#editPermissao').val()
    };
    
    axios.put(`/usuarios/${email}`, data, {headers: {Authorization: `Bearer ${token}`}})
        .then(() => {
            $('#modalEdit').modal('hide');
            $('#editForm').validate().resetForm();
            loadDataTable();
        })
        .catch((error) => {
            console.error("Erro ao atualizar usuario:", error);
        });
}