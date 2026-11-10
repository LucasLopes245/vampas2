# Vampetase 2.0 (versão independente)

Modernização não oficial inspirada na extensão [Vampetase de Fabiano Moraes](https://github.com/famoraes/vampetase).

## Instalação no Google Chrome

1. Extraia o arquivo ZIP em uma pasta permanente (por exemplo, `Documentos/Vampetase-2.0`).
2. No Chrome, abra `chrome://extensions`.
3. Ative **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação**.
5. Selecione a pasta `vampetase-2.0`, que contém o arquivo `manifest.json`.
6. Abra um site comum com fotos, atualize a página e veja as substituições.
7. Clique no ícone da extensão para ativar/desativar, escolher a intensidade ou pausá-la no site aberto.

**Importante:** Não selecione o arquivo ZIP nem a pasta acima da que contém o `manifest.json`. Não apague a pasta depois de instalar: o Chrome usa os arquivos locais.

## Funcionalidades

- Manifest V3, compatível com o Chrome moderno.
- Fotos embarcadas; nenhuma conexão externa é necessária para obter as imagens.
- Substituição de tags `img`, incluindo conteúdo que chega depois pelo DOM.
- Suporte a `srcset` e imagens em elementos `picture`.
- Botão liga/desliga, porcentagem de intensidade (0–100%) e pausa por domínio.
- Três modos de coleção: **Clássicas** (6 fotos resgatadas do código de 2014), **Misturadas** (10) e **Alternativas** (4).
- Substituição opcional de imagens de fundo CSS (experimental).
- Restauração das imagens originais ao desligar (quando o site não tiver recriado os elementos).
- Sem bibliotecas de terceiros, servidores, analytics ou coleta de dados.

## Limitações

- O Chrome não permite modificar páginas internas (`chrome://...`), Chrome Web Store e algumas outras páginas protegidas.
- Conteúdo desenhado em `canvas`, certos frames isolados ou imagens sob shadow DOM não são substituídos.
- Alguns sites podem redesenhar imagens continuamente. Recarregar a aba costuma ajudar.
- O modo de fundo CSS é experimental e pode alterar a aparência de elementos inesperados.
- Três das nove URLs históricas do projeto de 2014 não estavam acessíveis na verificação. Seis foram recuperadas e incorporadas localmente.

## Fotografias recuperadas do projeto original

O código original de 2014 referenciava nove links públicos de fotos de terceiros. Foi possível recuperar seis imagens, sem modificações, nos seguintes endereços:

| Arquivo incluído | Fonte do código original |
|---|---|
| `original-01-muvuca.jpg` | https://g.glbimg.com/og/gs/gsat2/f/original/2012/11/01/vampeta_muvuca.jpg |
| `original-03-sorvete.jpg` | https://e.imguol.com/esporte/futebol/2011/03/09/vampeta-toma-sorvete-enquanto-acompanha-uma-partida-de-futebol-1299716262839_1024x768.jpg |
| `original-04-g-magazine.jpg` | https://imguol.com/2012/09/25/vampeta-fala-sobre-ensaio-nu-para-a-g-magazine-1348607286095_956x500.jpg |
| `original-05-entrevista.jpeg` | https://f.i.uol.com.br/fotografia/2013/09/10/316315-970x600-1.jpeg |
| `original-08-blogspot.jpg` | https://4.bp.blogspot.com/-8Tp2Bcd6DTE/TguiDKwVi7I/AAAAAAAACZc/hTLf52aB04s/s1600/vampeta.jpg |
| `original-09-dupla.jpg` | https://images.uncyc.org/pt/7/77/Ricardinho_Vampeta_gays.jpg |

**Direitos:** Essas seis imagens não têm licenças de redistribuição verificadas. Esta cópia foi preparada para uso pessoal/experimental a pedido do usuário; não publique nem redistribua o pacote com essas imagens sem verificar as permissões dos titulares. Os arquivos `original-02`, `original-06` e `original-07` não foram recuperados.

## Créditos das quatro fotos alternativas

As imagens alternativas foram redistribuídas sem edição, com as atribuições abaixo:

| Arquivo | Autor/fonte | Licença | Página de origem |
|---|---|---|---|
| `images/vampeta-2005.jpg` | Ricardo Stuckert / Palácio do Planalto | Licença de atribuição da Presidência, segundo o Wikimedia Commons | https://commons.wikimedia.org/wiki/File:Vampeta.jpg |
| `images/vampeta-2010.jpg` | Portal de Dados Abertos do TSE (autor desconhecido) | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:2010_VAMPETA_CANDIDATO_DEPUTADO_FEDERAL_SP_(250000003170).jpg |
| `images/vampeta-2012-evento.jpg` | Roberto Sabino | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Vampeta,_dezembro_de_2012_(8248012898).jpg |
| `images/vampeta-2012-retrato.jpg` | Roberto Sabino (recorte publicado por Raphael Figueira) | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Vampeta_(cropped).jpg |

Licenças Creative Commons: https://creativecommons.org/licenses/by/4.0/ e https://creativecommons.org/licenses/by/2.0/.

Os ícones foram reaproveitados do repositório original de Fabiano Moraes. Não há licença explícita identificada no ZIP original para esses ícones; a versão é destinada a uso pessoal e experimental. Para publicação ou redistribuição, substitua os ícones ou confirme a permissão do autor.

## Desenvolvimento

Arquivos principais: `manifest.json`, `content.js`, `popup.html`, `popup.css` e `popup.js`.

Edite os arquivos na pasta extraída e pressione o botão **Atualizar** na página `chrome://extensions`. Atualize também o site em teste.
