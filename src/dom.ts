export function elemento(id: string): HTMLElement {
  const encontrado = document.getElementById(id);

  if (!encontrado) {
    throw new Error(`Elemento #${id} não encontrado no HTML.`);
  }

  return encontrado;
}

// Atalhos com o tipo certo para os campos do formulário
export function campo(id: string): HTMLInputElement {
  return elemento(id) as HTMLInputElement;
}

export function selecao(id: string): HTMLSelectElement {
  return elemento(id) as HTMLSelectElement;
}
