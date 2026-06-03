/**
 * cidades.js — Seletor estado/cidade usando API do IBGE
 * Uso:
 *   CidadeSelector.init('id-select-estado', 'id-input-cidade', { onSelect: function(estado, cidade){} })
 */

var ESTADOS = [
  { uf:'AC', nome:'Acre' }, { uf:'AL', nome:'Alagoas' }, { uf:'AP', nome:'Amapá' },
  { uf:'AM', nome:'Amazonas' }, { uf:'BA', nome:'Bahia' }, { uf:'CE', nome:'Ceará' },
  { uf:'DF', nome:'Distrito Federal' }, { uf:'ES', nome:'Espirito Santo' },
  { uf:'GO', nome:'Goiás' }, { uf:'MA', nome:'Maranhão' }, { uf:'MT', nome:'Mato Grosso' },
  { uf:'MS', nome:'Mato Grosso do Sul' }, { uf:'MG', nome:'Minas Gerais' },
  { uf:'PA', nome:'Para' }, { uf:'PB', nome:'Paraiba' }, { uf:'PR', nome:'Parana' },
  { uf:'PE', nome:'Pernambuco' }, { uf:'PI', nome:'Piaui' }, { uf:'RJ', nome:'Rio de Janeiro' },
  { uf:'RN', nome:'Rio Grande do Norte' }, { uf:'RS', nome:'Rio Grande do Sul' },
  { uf:'RO', nome:'Rondonia' }, { uf:'RR', nome:'Roraima' }, { uf:'SC', nome:'Santa Catarina' },
  { uf:'SP', nome:'Sao Paulo' }, { uf:'SE', nome:'Sergipe' }, { uf:'TO', nome:'Tocantins' },
];

var CidadeSelector = (function() {

  function init(estadoSelectId, cidadeInputId, opts) {
    opts = opts || {};

    var estadoEl  = document.getElementById(estadoSelectId);
    var cidadeEl  = document.getElementById(cidadeInputId);
    var listEl    = document.getElementById(cidadeInputId + '-list');

    if (!estadoEl || !cidadeEl) return;

    // Preenche select de estados
    estadoEl.innerHTML = '<option value="">Selecione o estado...</option>' +
      ESTADOS.map(function(e) {
        return '<option value="' + e.uf + '">' + e.nome + ' (' + e.uf + ')' + '</option>';
      }).join('');

    var todasCidades = [];
    var cidadeSelecionada = '';

    estadoEl.addEventListener('change', function() {
      var uf = estadoEl.value;
      cidadeEl.value = '';
      cidadeSelecionada = '';
      todasCidades = [];
      if (!uf) { cidadeEl.disabled = true; return; }
      cidadeEl.disabled = false;
      cidadeEl.placeholder = 'Carregando cidades...';

      fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/' + uf + '/municipios')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          todasCidades = data.map(function(m) { return m.nome; }).sort();
          cidadeEl.placeholder = 'Digite para buscar a cidade...';
        })
        .catch(function() {
          cidadeEl.placeholder = 'Digite o nome da cidade';
          todasCidades = [];
        });
    });

    cidadeEl.addEventListener('input', function() {
      cidadeSelecionada = '';
      var q = cidadeEl.value.trim().toLowerCase();
      if (!listEl) return;
      if (!q || todasCidades.length === 0) { listEl.innerHTML = ''; listEl.style.display = 'none'; return; }

      var matches = todasCidades.filter(function(c) {
        return c.toLowerCase().indexOf(q) === 0;
      }).slice(0, 8);

      if (matches.length === 0) { listEl.innerHTML = ''; listEl.style.display = 'none'; return; }

      listEl.innerHTML = matches.map(function(c) {
        return '<div class="cidade-option" data-cidade="' + c + '">' + c + '</div>';
      }).join('');
      listEl.style.display = 'block';

      listEl.querySelectorAll('.cidade-option').forEach(function(opt) {
        opt.addEventListener('mousedown', function(e) {
          e.preventDefault();
          cidadeEl.value = opt.dataset.cidade;
          cidadeSelecionada = opt.dataset.cidade;
          listEl.innerHTML = '';
          listEl.style.display = 'none';
          if (opts.onSelect) opts.onSelect(estadoEl.value, cidadeSelecionada);
        });
      });
    });

    cidadeEl.addEventListener('blur', function() {
      setTimeout(function() {
        if (listEl) { listEl.innerHTML = ''; listEl.style.display = 'none'; }
        if (!cidadeSelecionada && cidadeEl.value.trim()) {
          // aceita valor digitado livremente também
          cidadeSelecionada = cidadeEl.value.trim();
          if (opts.onSelect) opts.onSelect(estadoEl.value, cidadeSelecionada);
        }
      }, 150);
    });

    // Pré-carrega valores existentes se passados
    if (opts.initialState) {
      estadoEl.value = opts.initialState;
      estadoEl.dispatchEvent(new Event('change'));
    }
    if (opts.initialCity) {
      setTimeout(function() { cidadeEl.value = opts.initialCity; cidadeSelecionada = opts.initialCity; }, 600);
    }
  }

  return { init: init, estados: ESTADOS };
})();
