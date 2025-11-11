/* Data for categories: metadata and sample games */
const CATEGORIES = {
    luta: {
        key: 'luta', title: 'Luta', scheme: 'scheme-luta', description: 'Encare os adversários em combates rápidos e intensos.' , games:[{title:'Street Clash',price:49.90},{title:'Kombat Fury',price:69.90},{title:'Blade Masters',price:59.90}]
    },
    gestao: {
        key:'gestao', title:'Gestão de Recursos', scheme:'scheme-gestao', description:'Planeje, expanda e gerencie recursos.', games:[{title:'City Planner',price:79.90},{title:'Farm Empire',price:39.90}]
    },
    aventura:{ key:'aventura', title:'Aventura', scheme:'scheme-aventura', description:'Descubra mundos novos e viva aventuras épicas.', games:[{title:'Lost Valley',price:59.90},{title:'Sea of Tales',price:89.90}]},
    esporte:{ key:'esporte', title:'Esporte', scheme:'scheme-esporte', description:'Modalidades esportivas e simulações.', games:[{title:'Soccer Pro',price:129.90}]},
    'visual-novel':{ key:'visual-novel', title:'Visual Novel', scheme:'scheme-visual-novel', description:'Experiências narrativas e relacionamento.', games:[{title:'Love & Fate',price:29.90}]},
    terror:{ key:'terror', title:'Terror', scheme:'scheme-terror', description:'Experiências intensas que mexem com a imaginação.', games:[{title:'Night Whisper',price:39.90}]},
    plataforma:{ key:'plataforma', title:'Plataforma', scheme:'scheme-plataforma', description:'Jogo de precisão e ritmo.', games:[{title:'Jump Quest',price:19.90}]},
    drama:{ key:'drama', title:'Drama', scheme:'scheme-drama', description:'Histórias emotivas e profundas.', games:[{title:'Family Ties',price:24.90}]},
    infantil:{ key:'infantil', title:'Infantil', scheme:'scheme-infantil', description:'Experiências leves e educativas.', games:[{title:'Color Kids',price:0}]},
    carros:{ key:'carros', title:'Carros', scheme:'scheme-carros', description:'Corridas e velocidade.', games:[{title:'Racer X',price:19.90}]},
    estrategia:{ key:'estrategia', title:'Estratégia / Turnos', scheme:'scheme-estrategia', description:'Planejamento e tática.', games:[{title:'Kingdom Tactics',price:49.90}]},
    'mundo-aberto':{ key:'mundo-aberto', title:'Mundo Aberto', scheme:'scheme-mundoaberto', description:'Exploração em escala.', games:[{title:'Open Realms',price:199.90}]},
    indies:{ key:'indies', title:'Jogos Indies', scheme:'scheme-indies', description:'Estúdios independentes com propostas únicas.', games:[{title:'Retro Pixel',price:9.90},{title:'Quiet Garden',price:14.90}]}
};

function getCategory(key){
    return CATEGORIES[key] || null;
}
