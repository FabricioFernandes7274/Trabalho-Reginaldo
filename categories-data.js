/* Data for categories: metadata and sample games */
const CATEGORIES = {
    luta: {
        key: 'luta', title: 'Luta', scheme: 'scheme-luta', description: 'Encare os adversários em combates rápidos e intensos.' , games:[
            { title:'Street Clash', price:49.90, image:'https://via.placeholder.com/640x360?text=Street+Clash', description:'Lute em arenas urbanas com combos e especial moves.' },
            { title:'Kombat Fury', price:69.90, image:'https://via.placeholder.com/640x360?text=Kombat+Fury', description:'Torne-se o campeão em torneios globais.' },
            { title:'Blade Masters', price:59.90, image:'https://via.placeholder.com/640x360?text=Blade+Masters', description:'Combates com lâminas e habilidades especiais.' }
        ]
    },
    gestao: {
        key:'gestao', title:'Gestão de Recursos', scheme:'scheme-gestao', description:'Planeje, expanda e gerencie recursos.', games:[
            { title:'City Planner', price:79.90, image:'https://via.placeholder.com/640x360?text=City+Planner', description:'Construa uma cidade próspera gerenciando serviços e finanças.' },
            { title:'Farm Empire', price:39.90, image:'https://via.placeholder.com/640x360?text=Farm+Empire', description:'Cultive, expanda e vença desafios agrícolas.' }
        ]
    },
    aventura:{ key:'aventura', title:'Aventura', scheme:'scheme-aventura', description:'Descubra mundos novos e viva aventuras épicas.', games:[
        { title:'Lost Valley', price:59.90, image:'https://via.placeholder.com/640x360?text=Lost+Valley', description:'Explore vales misteriosos e resolva enigmas antigos.' },
        { title:'Sea of Tales', price:89.90, image:'https://via.placeholder.com/640x360?text=Sea+of+Tales', description:'Navegue por mares cheios de histórias e segredos.' }
    ]},
    esporte:{ key:'esporte', title:'Esporte', scheme:'scheme-esporte', description:'Modalidades esportivas e simulações.', games:[
        { title:'Soccer Pro', price:129.90, image:'https://via.placeholder.com/640x360?text=Soccer+Pro', description:'Simulação de futebol com modos carreira e multiplayer.' }
    ]},
    'visual-novel':{ key:'visual-novel', title:'Visual Novel', scheme:'scheme-visual-novel', description:'Experiências narrativas e relacionamento.', games:[
        { title:'Love & Fate', price:29.90, image:'https://via.placeholder.com/640x360?text=Love+%26+Fate', description:'História ramificada sobre escolhas e destino.' }
    ]},
    terror:{ key:'terror', title:'Terror', scheme:'scheme-terror', description:'Experiências intensas que mexem com a imaginação.', games:[
        { title:'Night Whisper', price:39.90, image:'https://via.placeholder.com/640x360?text=Night+Whisper', description:'Um horror psicológico que acompanha seus piores medos.' }
    ]},
    plataforma:{ key:'plataforma', title:'Plataforma', scheme:'scheme-plataforma', description:'Jogo de precisão e ritmo.', games:[
        { title:'Jump Quest', price:19.90, image:'https://via.placeholder.com/640x360?text=Jump+Quest', description:'Saltos precisos e fases desafiadoras.' }
    ]},
    drama:{ key:'drama', title:'Drama', scheme:'scheme-drama', description:'Histórias emotivas e profundas.', games:[
        { title:'Family Ties', price:24.90, image:'https://via.placeholder.com/640x360?text=Family+Ties', description:'Um drama familiar sobre escolhas e consequências.' }
    ]},
    infantil:{ key:'infantil', title:'Infantil', scheme:'scheme-infantil', description:'Experiências leves e educativas.', games:[
        { title:'Color Kids', price:0, image:'https://via.placeholder.com/640x360?text=Color+Kids', description:'Brinque e aprenda com cores e formas.' }
    ]},
    carros:{ key:'carros', title:'Carros', scheme:'scheme-carros', description:'Corridas e velocidade.', games:[
        { title:'Racer X', price:19.90, image:'https://via.placeholder.com/640x360?text=Racer+X', description:'Corridas rápidas em pistas futuristas.' }
    ]},
    estrategia:{ key:'estrategia', title:'Estratégia / Turnos', scheme:'scheme-estrategia', description:'Planejamento e tática.', games:[
        { title:'Kingdom Tactics', price:49.90, image:'https://via.placeholder.com/640x360?text=Kingdom+Tactics', description:'Comande exércitos e vença batalhas táticas.' }
    ]},
    'mundo-aberto':{ key:'mundo-aberto', title:'Mundo Aberto', scheme:'scheme-mundoaberto', description:'Exploração em escala.', games:[
        { title:'Open Realms', price:199.90, image:'https://via.placeholder.com/640x360?text=Open+Realms', description:'Mundos gigantescos para explorar e conquistar.' }
    ]},
    indies:{ key:'indies', title:'Jogos Indies', scheme:'scheme-indies', description:'Estúdios independentes com propostas únicas.', games:[
        { title:'Retro Pixel', price:9.90, image:'https://via.placeholder.com/640x360?text=Retro+Pixel', description:'Estilo retrô com desafios nostálgicos.' },
        { title:'Quiet Garden', price:14.90, image:'https://via.placeholder.com/640x360?text=Quiet+Garden', description:'Relaxante e contemplativo, explore um jardim sereno.' }
    ]}
};

function getCategory(key){
    return CATEGORIES[key] || null;
}
