/* Data for categories: metadata and sample games */
const CATEGORIES = {
    luta: {
        key: 'luta', title: 'Luta', scheme: 'scheme-luta', description: 'Encare os adversários em combates rápidos e intensos.' , games:[
            { id: 'luta-0', title:'Street Clash', price:49.90, image:'Imagens/luta-0.png', description:'Lute em arenas urbanas com combos e especial moves.' },
            { id: 'luta-1', title:'Kombat Fury', price:69.90, image:'Imagens/luta-1.png', description:'Torne-se o campeão em torneios globais.' },
            { id: 'luta-2', title:'Blade Masters', price:59.90, image:'Imagens/luta-2.png', description:'Combates com lâminas e habilidades especiais.' }
        ]
    },
    gestao: {
        key:'gestao', title:'Gestão de Recursos', scheme:'scheme-gestao', description:'Planeje, expanda e gerencie recursos.', games:[
            { id: 'gestao-0', title:'City Planner', price:79.90, image:'Imagens/gestao-0.png', description:'Construa uma cidade próspera gerenciando serviços e finanças.' },
            { id: 'gestao-1', title:'Farm Empire', price:39.90, image:'Imagens/gestao-1.png', description:'Cultive, expanda e vença desafios agrícolas.' }
        ]
    },
    aventura:{ key:'aventura', title:'Aventura', scheme:'scheme-aventura', description:'Descubra mundos novos e viva aventuras épicas.', games:[
        { id: 'aventura-0', title:'Lost Valley', price:59.90, image:'Imagens/aventura-0.png', description:'Explore vales misteriosos e resolva enigmas antigos.' },
        { id: 'aventura-1', title:'Sea of Tales', price:89.90, image:'Imagens/aventura-1.png', description:'Navegue por mares cheios de histórias e segredos.' }
    ]},
    esporte:{ key:'esporte', title:'Esporte', scheme:'scheme-esporte', description:'Modalidades esportivas e simulações.', games:[
        { id: 'esporte-0', title:'Soccer Pro', price:129.90, image:'Imagens/esporte-0.png', description:'Simulação de futebol com modos carreira e multiplayer.' }
    ]},
    'visual-novel':{ key:'visual-novel', title:'Visual Novel', scheme:'scheme-visual-novel', description:'Experiências narrativas e relacionamento.', games:[
        { id: 'visual-novel-0', title:'Love & Fate', price:29.90, image:'Imagens/visual-novel-0.png', description:'História ramificada sobre escolhas e destino.' }
    ]},
    terror:{ key:'terror', title:'Terror', scheme:'scheme-terror', description:'Experiências intensas que mexem com a imaginação.', games:[
        { id: 'terror-0', title:'Night Whisper', price:39.90, image:'Imagens/terror-0.png', description:'Um horror psicológico que acompanha seus piores medos.' }
    ]},
    plataforma:{ key:'plataforma', title:'Plataforma', scheme:'scheme-plataforma', description:'Jogo de precisão e ritmo.', games:[
        { id: 'plataforma-0', title:'Jump Quest', price:19.90, image:'Imagens/plataforma-0.png', description:'Saltos precisos e fases desafiadoras.' }
    ]},
    drama:{ key:'drama', title:'Drama', scheme:'scheme-drama', description:'Histórias emotivas e profundas.', games:[
        { id: 'drama-0', title:'Family Ties', price:24.90, image:'Imagens/drama-0.png', description:'Um drama familiar sobre escolhas e consequências.' }
    ]},
    infantil:{ key:'infantil', title:'Infantil', scheme:'scheme-infantil', description:'Experiências leves e educativas.', games:[
        { id: 'infantil-0', title:'Color Kids', price:0, image:'Imagens/infantil-0.png', description:'Brinque e aprenda com cores e formas.' }
    ]},
    carros:{ key:'carros', title:'Carros', scheme:'scheme-carros', description:'Corridas e velocidade.', games:[
        { id: 'carros-0', title:'Racer X', price:19.90, image:'Imagens/carros-0.png', description:'Corridas rápidas em pistas futuristas.' }
    ]},
    estrategia:{ key:'estrategia', title:'Estratégia / Turnos', scheme:'scheme-estrategia', description:'Planejamento e tática.', games:[
        { id: 'estrategia-0', title:'Kingdom Tactics', price:49.90, image:'Imagens/estrategia-0.png', description:'Comande exércitos e vença batalhas táticas.' }
    ]},
    'mundo-aberto':{ key:'mundo-aberto', title:'Mundo Aberto', scheme:'scheme-mundoaberto', description:'Exploração em escala.', games:[
        { id: 'mundo-aberto-0', title:'Open Realms', price:199.90, image:'Imagens/mundo-aberto-0.png', description:'Mundos gigantescos para explorar e conquistar.' }
    ]},
    indies:{ key:'indies', title:'Jogos Indies', scheme:'scheme-indies', description:'Estúdios independentes com propostas únicas.', games:[
        { id: 'indies-0', title:'Retro Pixel', price:9.90, image:'Imagens/indies-0.png', description:'Estilo retrô com desafios nostálgicos.' },
        { id: 'indies-1', title:'Quiet Garden', price:14.90, image:'Imagens/indies-1.png', description:'Relaxante e contemplativo, explore um jardim sereno.' }
    ]}
};

function getCategory(key){
    return CATEGORIES[key] || null;
}
