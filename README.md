# Currículo online – Nícollas Theodoro

Site estático (GitHub Pages) com painel administrativo.

## Estrutura
- `index.html` – site público (renderizado a partir de `data/dados.json`)
- `admin.html` – painel admin (login por token do GitHub)
- `data/dados.json` – **todo o conteúdo do site** (perfil, skills, experiências, formações, certificados, projetos, contato)
- `css/` e `js/` – estilos e scripts. `js/config.js` guarda usuário/repositório/branch.
- `imagens/uploads/` e `arquivos/uploads/` – arquivos enviados pelo admin

## Usando o admin
1. Gere um token: GitHub → Settings → Developer settings → Fine-grained tokens.
   Repository access: só `site-repositorio`. Permissions → Contents: Read and write.
2. Abra `/admin.html`, cole o token e entre.
3. Edite o que quiser e clique em **Publicar alterações**. O site atualiza em ~1 minuto.

## Rodando localmente
Use o Live Server do VS Code (o site precisa de um servidor para carregar o JSON).
