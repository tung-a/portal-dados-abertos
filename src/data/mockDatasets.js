export const datasets = [
  {
    id: 1,
    title: "Densidade Demográfica de São Vicente (2022)",
    category: "População",
    formats: ["Excel", "Shapefile"],
    lastUpdated: "15/03/2026",
    source: "IBGE / Censo 2022",
    description:
      "Dados espaciais e estatísticos sobre a concentração de habitantes por setor censitário no município de São Vicente.",
    metadata: {
      rows: "450 setores",
      columns: 8,
      encoding: "UTF-8",
      crs: "SIRGAS 2000 / UTM zone 23S",
    },
    preview: [
      {
        setor: "355100905000001",
        bairro: "Centro",
        populacao: 1240,
        area_km2: 0.15,
        densidade: 8266.6,
      },
      {
        setor: "355100905000002",
        bairro: "Gonzaguinha",
        populacao: 980,
        area_km2: 0.08,
        densidade: 12250.0,
      },
      {
        setor: "355100905000003",
        bairro: "Itararé",
        populacao: 2100,
        area_km2: 0.12,
        densidade: 17500.0,
      },
    ],
  },
  {
    id: 2,
    title: "Áreas de Risco de Inundação",
    category: "Meio Ambiente & Risco",
    formats: ["Shapefile"],
    lastUpdated: "10/01/2026",
    source: "Defesa Civil / Prefeitura de São Vicente",
    description:
      "Mapeamento poligonal das zonas com alta, média e baixa suscetibilidade a alagamentos e inundações costeiras e fluviais.",
    metadata: {
      rows: "32 zonas",
      columns: 5,
      encoding: "UTF-8",
      crs: "SIRGAS 2000",
    },
    preview: [
      {
        id_zona: "INU-01",
        bairro: "Sambaiatuba",
        nivel_risco: "Alto",
        pop_afetada_est: 3500,
      },
      {
        id_zona: "INU-02",
        bairro: "Jóquei Clube",
        nivel_risco: "Médio",
        pop_afetada_est: 1200,
      },
    ],
  },
  {
    id: 3,
    title: "Localização dos Estabelecimentos de Saúde",
    category: "Saúde",
    formats: ["Excel"],
    lastUpdated: "20/02/2026",
    source: "DATASUS / Prefeitura",
    description:
      "Geolocalização (latitude e longitude) de UBSs, UPAs e hospitais municipais para análise de cobertura de atendimento.",
    metadata: {
      rows: "28 unidades",
      columns: 6,
      encoding: "UTF-8",
    },
    preview: [
      {
        cnes: "2081234",
        nome: "UBS Central",
        tipo: "Centro de Saúde",
        bairro: "Centro",
        lat: -23.963,
        lng: -46.391,
      },
      {
        cnes: "2085678",
        nome: "ESF Sambaiatuba",
        tipo: "Posto de Saúde",
        bairro: "Sambaiatuba",
        lat: -23.948,
        lng: -46.412,
      },
    ],
  },
  {
    id: 4,
    title: "Renda Média por Setor Censitário (2022)",
    category: "Socioeconômico",
    formats: ["Excel", "Shapefile"],
    lastUpdated: "15/03/2026",
    source: "IBGE",
    description:
      "Distribuição de renda domiciliar per capita para cruzamento com indicadores de vulnerabilidade e justiça climática.",
    metadata: {
      rows: "450 setores",
      columns: 4,
      encoding: "UTF-8",
    },
    preview: [
      { setor: "355100905000001", bairro: "Centro", renda_media_sm: 4.5 },
      {
        setor: "355100905000004",
        bairro: "Vila Margarida",
        renda_media_sm: 1.8,
      },
    ],
  },
  {
    id: 5,
    title: "Áreas Contaminadas e Passivos Ambientais",
    category: "Meio Ambiente & Risco",
    formats: ["Shapefile"],
    lastUpdated: "05/11/2025",
    source: "CETESB / Pesquisa FAPESP",
    description:
      "Cadastramento de áreas com contaminação do solo ou lençol freático identificadas no município.",
    metadata: {
      rows: "14 locais",
      columns: 7,
      encoding: "UTF-8",
    },
    preview: [
      {
        id_area: "AC-001",
        origem: "Industrial",
        status: "Em monitoramento",
        risco_a_saude: "Moderado",
      },
    ],
  },
];
