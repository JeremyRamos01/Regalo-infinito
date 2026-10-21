const SECTORS = [
  {
    tag: 'Sector 01 // Fresa Neo',
    title: 'Bosque Digital',
    desc: 'Arquitectura brutalista con plataformas flotantes, contrastes nítidos y líneas de datos de alta velocidad.'
  },
  {
    tag: 'Sector 02 // Glaciar Mono',
    title: 'Páramo de Hielo',
    desc: 'Estructuras angulares con superficies limpias y sombras de impacto cero latencia.'
  },
  {
    tag: 'Sector 03 // Cacao Core',
    title: 'Cañón Sísmico',
    desc: 'Bloques de energía sólida vinculados directamente a la torre del superordenador.'
  }
];

export function renderSectors() {
  const root = document.getElementById('sectors-root');
  if (!root) return;

  root.innerHTML = SECTORS.map(
    (s) => `
      <article class="sector-card" data-magnetic>
        <span class="sector-tag">${s.tag}</span>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </article>
    `
  ).join('');
}
