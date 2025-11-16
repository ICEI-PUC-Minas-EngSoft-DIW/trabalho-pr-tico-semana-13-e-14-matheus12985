// app.js — Consumo de JSON Server + CRUD + Dashboard com Chart.js

const API_BASE = 'http://localhost:3000';
const RESOURCE = 'filmes';

// --------- Funções de acesso à API (CRUD) ---------

async function listarFilmes() {
  const resp = await fetch(`${API_BASE}/${RESOURCE}`);
  if (!resp.ok) {
    throw new Error('Erro ao carregar filmes');
  }
  return resp.json();
}

async function obterFilme(id) {
  const resp = await fetch(`${API_BASE}/${RESOURCE}/${id}`);
  if (!resp.ok) {
    throw new Error('Filme não encontrado');
  }
  return resp.json();
}

async function criarFilme(filme) {
  const resp = await fetch(`${API_BASE}/${RESOURCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filme)
  });
  if (!resp.ok) {
    throw new Error('Erro ao criar filme');
  }
  return resp.json();
}

async function atualizarFilme(id, filme) {
  const resp = await fetch(`${API_BASE}/${RESOURCE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filme)
  });
  if (!resp.ok) {
    throw new Error('Erro ao atualizar filme');
  }
  return resp.json();
}

async function excluirFilme(id) {
  const resp = await fetch(`${API_BASE}/${RESOURCE}/${id}`, {
    method: 'DELETE'
  });
  if (!resp.ok) {
    throw new Error('Erro ao excluir filme');
  }
  return true;
}

// --------- Helpers ---------

function parseNota(avaliacao) {
  if (!avaliacao) return null;
  const parte = avaliacao.split('/')[0].replace(',', '.');
  const num = parseFloat(parte);
  return Number.isNaN(num) ? null : num;
}

function lerFilmeDoFormulario(form) {
  const formData = new FormData(form);
  const galeriaStr = formData.get('galeria') || '';
  const galeria = galeriaStr
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return {
    titulo: formData.get('titulo') || '',
    descricao: formData.get('descricao') || '',
    sinopse: formData.get('sinopse') || '',
    ano: Number(formData.get('ano')) || null,
    genero: formData.get('genero') || '',
    diretor: formData.get('diretor') || '',
    duracao: formData.get('duracao') || '',
    avaliacao: formData.get('avaliacao') || '',
    destaque: formData.get('destaque') === 'on',
    imagem: formData.get('imagem') || '',
    galeria: galeria
  };
}

// --------- Página index: lista + destaques ---------

async function montaIndex() {
  const carouselInner = document.getElementById('carousel-inner');
  const cardsContainer = document.getElementById('cards-container');

  if (!carouselInner || !cardsContainer) return;

  carouselInner.innerHTML = '';
  cardsContainer.innerHTML = '';

  try {
    const filmes = await listarFilmes();

    const destaques = filmes.filter(f => f.destaque).slice(0, 3);
    const slides = (destaques.length ? destaques : filmes).slice(0, 3);

    slides.forEach((f, i) => {
      const div = document.createElement('div');
      div.className = 'carousel-item' + (i === 0 ? ' active' : '');
      const imagem = f.imagem || 'assets/img/avatar1.jpg';

      div.innerHTML = `
        <img src="${imagem}" alt="${f.titulo}">
        <div class="carousel-caption">
          <div class="carousel-caption__box">
            <h5 class="carousel-caption__title">${f.titulo}</h5>
            <p class="carousel-caption__text">${f.descricao || ''}</p>
            <a href="detalhe.html?id=${f.id}" class="btn-detalhes btn-detalhes--sm">Ver detalhes</a>
          </div>
        </div>`;
      carouselInner.appendChild(div);
    });

    filmes.forEach(f => {
      const col = document.createElement('div');
      col.className = 'col-md-4 mb-4';

      const imagem = f.imagem || 'assets/img/avatar1.jpg';

      col.innerHTML = `
        <div class="card h-100">
          <img src="${imagem}" class="card-img-top" alt="${f.titulo}">
          <div class="card-body">
            <h5 class="card-title">${f.titulo}</h5>
            <p class="card-text">${f.descricao || ''}</p>
            <div class="card-actions">
              <a href="detalhe.html?id=${f.id}" class="btn-detalhes btn-detalhes--sm">Ver detalhes</a>
              <a href="cadastro_filmes.html?id=${f.id}" class="btn btn-sm btn-outline-light">Editar</a>
            </div>
          </div>
        </div>`;
      cardsContainer.appendChild(col);
    });
  } catch (err) {
    cardsContainer.innerHTML =
      `<p class="text-danger">Erro ao carregar filmes: ${err.message}</p>`;
  }
}

// --------- Página de detalhes ---------

async function montaDetalhe() {
  const main = document.getElementById('detalhe-main');
  if (!main) return;

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);

  if (!id) {
    main.innerHTML = '<p>Filme não informado.</p>';
    return;
  }

  try {
    const filme = await obterFilme(id);

    main.innerHTML = `
      <section class="section">
        <div class="row">
          <div class="col-md-5">
            <img src="${filme.imagem || ''}" alt="${filme.titulo}" class="img-fluid rounded shadow-sm mb-3 detalhe__img">
          </div>
          <div class="col-md-7">
            <h2 class="detalhe__title">${filme.titulo}</h2>
            <p class="detalhe__meta">
              <strong>Diretor:</strong> ${filme.diretor || ''} • 
              <strong>Ano:</strong> ${filme.ano || ''} • 
              <strong>Gênero:</strong> ${filme.genero || ''} •
              <strong>Duração:</strong> ${filme.duracao || ''} •
              <strong>Avaliação:</strong> ${filme.avaliacao || ''}
            </p>
            <p class="detalhe__sinopse">${filme.sinopse || ''}</p>
            <div class="mb-3">
              <a href="cadastro_filmes.html?id=${filme.id}" class="btn btn-primary btn-sm me-2">Editar</a>
              <a href="index.html" class="btn-detalhes">⬅ Voltar</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <h4 class="section__subtitle">Galeria</h4>
        <div class="row" id="galeria"></div>
      </section>`;

    const gal = document.getElementById('galeria');
    (filme.galeria || []).forEach((src, i) => {
      const c = document.createElement('div');
      c.className = 'col-sm-6 col-md-4';
      c.innerHTML = `
        <div class="card">
          <img src="${src}" class="card-img-top" alt="Cena ${i + 1} de ${filme.titulo}">
          <div class="card-body" style="text-align:center"><small>Cena ${i + 1}</small></div>
        </div>`;
      gal.appendChild(c);
    });
  } catch (err) {
    main.innerHTML = `<p class="text-danger">Erro ao carregar o filme: ${err.message}</p>`;
  }
}

// --------- Página de cadastro (formulário CRUD) ---------

async function initCadastroPage() {
  const form = document.getElementById('cadastro-filme-form');
  if (!form) return;

  const statusDiv = document.getElementById('cadastro-status');
  const tituloEl = document.getElementById('cadastro-titulo');
  const btnExcluir = document.getElementById('btn-excluir');

  const params = new URLSearchParams(window.location.search);
  let idEdicao = params.get('id') ? parseInt(params.get('id'), 10) : null;

  // Se tiver id => modo edição
  if (idEdicao) {
    tituloEl.textContent = 'Editar Filme';
    btnExcluir.classList.remove('d-none');

    try {
      const filme = await obterFilme(idEdicao);
      form.titulo.value = filme.titulo || '';
      form.ano.value = filme.ano || '';
      form.avaliacao.value = filme.avaliacao || '';
      form.genero.value = filme.genero || '';
      form.diretor.value = filme.diretor || '';
      form.duracao.value = filme.duracao || '';
      form.imagem.value = filme.imagem || '';
      form.galeria.value = (filme.galeria || []).join(', ');
      form.descricao.value = filme.descricao || '';
      form.sinopse.value = filme.sinopse || '';
      form.destaque.checked = !!filme.destaque;
    } catch (err) {
      statusDiv.textContent = `Erro ao carregar filme para edição: ${err.message}`;
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const filme = lerFilmeDoFormulario(form);

    try {
      if (idEdicao) {
        await atualizarFilme(idEdicao, filme);
        statusDiv.textContent = 'Filme atualizado com sucesso!';
      } else {
        const criado = await criarFilme(filme);
        idEdicao = criado.id;
        statusDiv.textContent = 'Filme cadastrado com sucesso!';
        form.reset();
      }
    } catch (err) {
      statusDiv.textContent = `Erro ao salvar filme: ${err.message}`;
    }
  });

  btnExcluir.addEventListener('click', async () => {
    if (!idEdicao) return;
    const confirma = window.confirm('Tem certeza que deseja excluir este filme?');
    if (!confirma) return;

    try {
      await excluirFilme(idEdicao);
      statusDiv.textContent = 'Filme excluído com sucesso!';
      form.reset();
      idEdicao = null;
      btnExcluir.classList.add('d-none');
    } catch (err) {
      statusDiv.textContent = `Erro ao excluir filme: ${err.message}`;
    }
  });
}

// --------- Dashboard com Chart.js ---------

async function montaDashboard() {
  const canvasGeneros = document.getElementById('chart-generos');
  const canvasAvaliacoes = document.getElementById('chart-avaliacoes');
  const msg = document.getElementById('dashboard-mensagens');

  if (!canvasGeneros || !canvasAvaliacoes) return;

  try {
    const filmes = await listarFilmes();

    // 1) Pizza: filmes por gênero principal (antes da barra "/")
    const contagemPorGenero = {};
    filmes.forEach(f => {
      const texto = (f.genero || 'Outro');
      const generoPrincipal = texto.split('/')[0].trim() || 'Outro';
      contagemPorGenero[generoPrincipal] = (contagemPorGenero[generoPrincipal] || 0) + 1;
    });

    const generosLabels = Object.keys(contagemPorGenero);
    const generosData = Object.values(contagemPorGenero);

    if (typeof Chart !== 'undefined') {
      new Chart(canvasGeneros, {
        type: 'pie',
        data: {
          labels: generosLabels,
          datasets: [{
            data: generosData
          }]
        },
        options: {
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // 2) Barras: média de avaliação por ano
    const agrupadoPorAno = {};
    filmes.forEach(f => {
      if (!f.ano) return;
      const nota = parseNota(f.avaliacao);
      if (nota == null) return;

      if (!agrupadoPorAno[f.ano]) {
        agrupadoPorAno[f.ano] = { soma: 0, qtd: 0 };
      }
      agrupadoPorAno[f.ano].soma += nota;
      agrupadoPorAno[f.ano].qtd += 1;
    });

    const anos = Object.keys(agrupadoPorAno).sort();
    const medias = anos.map(ano => {
      const obj = agrupadoPorAno[ano];
      return obj.soma / obj.qtd;
    });

    if (typeof Chart !== 'undefined') {
      new Chart(canvasAvaliacoes, {
        type: 'bar',
        data: {
          labels: anos,
          datasets: [{
            label: 'Média da avaliação (0-10)',
            data: medias
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 10
            }
          }
        }
      });
    }

    if (msg) {
      msg.textContent = 'Gráficos gerados a partir dos dados do JSON Server.';
    }
  } catch (err) {
    if (msg) {
      msg.textContent = `Erro ao carregar dados para os gráficos: ${err.message}`;
    }
  }
}

// --------- Inicialização geral ---------

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('carousel-inner')) {
    montaIndex();
  }
  if (document.getElementById('detalhe-main')) {
    montaDetalhe();
  }
  if (document.getElementById('cadastro-filme-form')) {
    initCadastroPage();
  }
  if (document.getElementById('chart-generos')) {
    montaDashboard();
  }
});
