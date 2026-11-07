export function elemento(id: string): HTMLElement {
  const encontrado = document.getElementById(id);

  if (!encontrado) {
    throw new Error(`Elemento #${id} não encontrado no HTML.`);
  }

  return encontrado;
}
