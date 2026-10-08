// Onde mora uma release publicada: imagem do painel no GHCR e o repositório
// de onde o host-updater baixa o tarball da tag. Módulo mínimo (sem imports)
// para host-updater.ts e release-pronta.ts compartilharem os valores sem um
// depender do outro. Os valores têm que bater com release.yml/build.yml
// (superfície monitor-instalador-nomes).
export const PANEL_IMAGE_REPO = "ghcr.io/enchaaluno/setup-panel";
export const SETUPTESTE_REPO = "enchaaluno/setupteste";
