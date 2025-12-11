/* Data for categories: metadata and sample games */
const CATEGORIES = {
    luta: {
        key: 'luta', title: 'Luta', scheme: 'scheme-luta', description: 'Encare os adversários em combates rápidos e intensos.' , games:[
            { id: 'luta-0', title:'Chóchó punch', price:39.90, image:'Imagens/luta-0.png', description:'Lute em arenas com o ex-campeão de boxe chóchó para reaver seu cinturão.' },
            { id: 'luta-1', title:'Os portões de Lee', price:59.90, image:'Imagens/luta-1.png', description:'Torne-se o Lee e lute contra madrugão para evitar um soco no olho enquanto libera os portões para ficar mais forte.' },
            { id: 'luta-2', title:'O prime de neu', price:49.90, image:'Imagens/luta-2.png', description:'Lute contra a invasão alienigena mutantes utilizando o prime de Neneu enquanto busca o elemento X.' }
        ]
    },
    gestao: {
        key:'gestao', title:'Gestão de Recursos', scheme:'scheme-gestao', description:'Planeje, expanda e gerencie recursos.', games:[
            { id: 'gestao-0', title:'Cobrarei simulator', price:79.90, image:'Imagens/gestao-0.png', description:'Cobre os alunos da facepe enquanto equilibra aula e cobranças.' },
            { id: 'gestao-1', title:'Postos Ipiranga do Madrugão', price:39.90, image:'Imagens/gestao-1.png', description:'Um novo empreendedor apareceu em Jardim Ipiranga Madrugão, gerencie um posto enquanto evita a cobrança do aluguel.' }
        ]
    },
    aventura:{ key:'aventura', title:'Aventura', scheme:'scheme-aventura', description:'Descubra mundos novos e viva aventuras épicas.', games:[
        { id: 'aventura-0', title:'Em busca da onça de jade', price:59.90, image:'Imagens/aventura-0.png', description:'Explore vales misteriosos e resolva enigmas antigos e desubra o passado de onça enquanto procura a lendaria onça de jade.' },
        { id: 'aventura-1', title:'Cleybson em busca do shampoo perdido', price:89.90, image:'Imagens/aventura-1.png', description:'O ancião Cleybson após anos de meditação perde todo seu cabelo então ele vai atrás do shampoo milagroso da Amazônia para crescer o cabelo de volta.' }
    ]},
    esporte:{ key:'esporte', title:'Esporte', scheme:'scheme-esporte', description:'Modalidades esportivas e simulações.', games:[
        { id: 'esporte-0', title:'Futebol dos negos', price:129.90, image:'Imagens/esporte-0.png', description:'Simulação de futebol com modos carreira e multiplayer com os 11 negos.'},
            {id: 'esporte-1', title:'Volei dos negos', price:29.90, image:'Imagens/esporte-0.png', description:'O interclasse está a milhão com os negos dominando tudo.'}
    ]},
    'visual-novel':{ key:'visual-novel', title:'Visual Novel', scheme:'scheme-visual-novel', description:'Experiências narrativas e relacionamento.', games:[
        { id: 'visual-novel-0', title:'As brancas', price:29.90, image:'Imagens/visual-novel-0.png', description:'Veja a história das brancas desde o 1 ano até o 3 nessa historia emocionante.' }
    ]},
    terror:{ key:'terror', title:'Terror', scheme:'scheme-terror', description:'Experiências intensas que mexem com a imaginação.', games:[
        { id: 'terror-0', title:'5 noites com o cobrador', price:39.90, image:'Imagens/terror-0.png', description:'Você esqueceu de fazer o tcc agora tem que sobreviver a 5 noites na ete enquanto se protege de Reginaldo.' }
    ]},
    plataforma:{ key:'plataforma', title:'Plataforma', scheme:'scheme-plataforma', description:'Jogo de precisão e ritmo.', games:[
        { id: 'plataforma-0', title:'Os Brothers', price:19.90, image:'Imagens/plataforma-0.png', description:'Controle o man em busca do seu irmão gemeo Men que foi capturado na praia de Candeias.' }
    ]},
    drama:{ key:'drama', title:'Drama', scheme:'scheme-drama', description:'Histórias emotivas e profundas.', games:[
        { id: 'drama-0', title:'Vida na Ete', price:24.90, image:'Imagens/drama-0.png', description:'Viva na pele de um estudante da ete e entre nessa história cheia de trabalhos e depressão.' }
    ]},
    infantil:{ key:'infantil', title:'Infantil', scheme:'scheme-infantil', description:'Experiências leves e educativas.', games:[
        { id: 'infantil-0', title:'Jp goods', price:0, image:'Imagens/infantil-0.png', description:'Brinque e aprenda com cores e formas no bobby goods vendido por JP.' }
    ]},
    carros:{ key:'carros', title:'Carros', scheme:'scheme-carros', description:'Corridas e velocidade.', games:[
        { id: 'carros-0', title:'O grupo da morte', price:19.90, image:'Imagens/carros-0.png', description:'Sobreviva a mais uma semana de apresentação nesse caos.' },
        { id: 'carros-1', title:'Palio de Meu fio', price:19.90, image:'Imagens/carros-1.png', description:'Corra em diversas pistas enquanto leva sua filha na escola e vai trabalhar.' }
    ]},
    estrategia:{ key:'estrategia', title:'Estratégia / Turnos', scheme:'scheme-estrategia', description:'Planejamento e tática.', games:[
        { id: 'estrategia-0', title:'A fila da merenda', price:49.90, image:'Imagens/estrategia-0.png', description:'Controle G enquanto tenta furar o maximo de fila possivel para comer cedo.' }
    ]},
    'mundo-aberto':{ key:'mundo-aberto', title:'Mundo Aberto', scheme:'scheme-mundoaberto', description:'Exploração em escala.', games:[
        { id: 'mundo-aberto-0', title:'A ida ao cedro', price:199.90, image:'Imagens/mundo-aberto-0.png', description:'Mundos gigantescos para explorar enquanto recebe instrucções de Cleybson jovem.' }
    ]},
    indies:{ key:'indies', title:'Jogos Indies', scheme:'scheme-indies', description:'Estúdios independentes com propostas únicas.', games:[
        { id: 'indies-0', title:'Os tchola', price:9.90, image:'Imagens/indies-0.png', description:'uma aventura de terror e suspense em que um grupo de jovens nominados de tcholas terão que salvar a cidade de monstros do submundo .' },
        { id: 'indies-1', title:'A dadiva do mestre', price:14.90, image:'Imagens/indies-1.png', description:'Um jogo incirvel onde o mestre irá te guiar sobre todos os fundamentos do ping pong.' }
    ]}
};

function getCategory(key){
    return CATEGORIES[key] || null;
}
