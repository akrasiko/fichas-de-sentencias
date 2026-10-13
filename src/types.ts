export interface RazonamientosDetalle {
  hipotesisSujetoActivo: string;
  hipotesisSujetoPasivo: string;
  hechosPacificos: string;
  pruebasRendidas: string;
  valoracionPrueba: string;
  reglasDecision: string;
  pruebaIrrelevante: string;
}

export interface FichaAnalisis {
  id: string;
  createdAt: string;
  nombreArchivo?: string;
  rol: string;
  tribunal: string;
  partes: string;
  tipoProcedimiento: string;
  hechos: string;
  razonamientos: RazonamientosDetalle;
  decision: string;
  fallo: string;
  doctrinaNormativaJurisprudencia: string;
  comentario: string;
}

export interface SampleSentence {
  id: string;
  title: string;
  materia: string;
  description: string;
  content: string;
}
