axios.defaults.baseURL = "http://localhost:3002/";
axios.defaults.headers.common["Content-Type"] =
    "application/json;charset=utf-8";




//mainForm é o formulário de login da página de login.
document.getElementById('mainForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('nomeLogin').value;
    const senha = document.getElementById('senhaLogin').value;

    try {
      const res = await axios.post('/login', { email, senha });

      const token = res.data.token;
      localStorage.setItem('token', token);

      //Abaixo pega o retorno da permissão para pode dar acesso a telas especifica
      const payload = JSON.parse(atob(token.split('.')[1]));
      window.location.href = 'index.html';
    } catch (err) {
      alert('Usuário ou senha errados.');
      console.error(err);
    }
  });

