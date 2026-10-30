# Golden Hour What If

O estilo visual do canal: cenários de anime lo-fi, pintados e cheios de detalhe, com personagens limpos em cel shading. Toda cena acontece numa hora do dia, e é essa hora que decide a paleta. O resultado tem que parecer um lugar onde alguém mora, no fim de uma tarde quente.

Este documento vale para storyboards, animação, thumbnails e cartelas. Ele foi montado a partir de 10 imagens de referência escolhidas pelo dono do canal: ruas residenciais ao pôr do sol e à noite, salas e quartos com luz de abajur e de sol baixo, um acampamento sob o céu estrelado e uma folha de personagem no estilo anime. As referências guiam o clima e o nível de detalhe; nada delas é copiado.

## Os cinco princípios

1. **A hora do dia é a paleta.** Existem três climas, e cada cena usa um só: `golden` (sol baixo e dourado), `dusk` (céu azul-profundo encontrando laranja e vinho) e `night` (azul-marinho com janelas amarelas). As cores de cenário vêm dos tokens desse clima; nunca misture dois climas no mesmo plano.
2. **Toda luz tem uma fonte que aparece em cena.** Sol baixo numa janela, abajur, poste de rua, tela de TV, fogueira. A luz desenha formas: o caixilho da janela projetado no chão, o cone do poste no asfalto, a mancha do abajur na parede. Os meios-tons ficam escuros (`wall-shade`, `shadow-core`) para que a luz (`sun-key`, `practical-glow`) brilhe. Nada é iluminado por igual.
3. **Cenário rico, personagem limpo.** O cenário é pintado: gradientes suaves, textura, traço fino (`line-bg`, 1,5px). O personagem é chapado: duas cores por material (base e sombra), contorno grosso (`char-line`, 3px) e recorte de luz (`rim-light`) do lado da fonte. É esse contraste que faz o personagem saltar.
4. **Profundidade em camadas.** Todo plano tem céu, fundo, meio e primeiro plano separados, para que a câmera possa deslizar (parallax). Em um terço dos planos, um objeto escuro e desfocado ocupa a borda do quadro.
5. **Um mundo vivido.** Um plano geral tem pelo menos 20 objetos desenhados. Parede vazia e chão liso são erro.

## Os três climas

| Clima | Céu | Luz principal | Onde usar |
| --- | --- | --- | --- |
| golden | turquesa suave descendo para creme; nuvens grandes e fofas | sol baixo amarelo entrando por janelas, manchas no chão com sombra do caixilho | manhãs, a parte divertida, finais felizes |
| dusk | azul-profundo no topo, laranja e vinho no horizonte; cúmulos iluminados por baixo | sol se pondo no fim da rua, recorte laranja | aberturas, viradas, a cartela de título |
| night | azul-marinho com estrelas, lua crescente, às vezes estrelas cadentes | janelas amarelas, postes laranja com cone de luz | tensão, o homem de terno, o clímax |

## Cenários: o que cada um precisa ter

**Rua residencial.** Ponto de fuga central e rua descendo para o horizonte. Postes de madeira ou concreto com muitos fios cruzando o céu e convergindo para o fundo. Faixa de pedestres em primeiro plano, meio-fio, linhas pintadas no asfalto. Casas de dois andares com telhado de telha, calhas, janelas com cortina, aparelho de ar-condicionado, muro de blocos com vasos e plantas, caixa de correio, uma bicicleta encostada, um gato no muro. Um carro estacionado. Placa de trânsito.

**Sala.** Janela grande (do chão ao teto ou com sacada) mostrando a cidade ou o céu, cortinas finas. Estantes com livros de cores variadas, vasos com plantas pendentes, abajur de pé, sofá com almofadas, mesinha de centro, tapete, piso de madeira com as manchas de luz da janela, quadros na parede, ar-condicionado no alto, TV, livros empilhados no chão.

**Quarto.** Cama encostada na parede, com cabeceira, dois travesseiros, edredom com dobras e lençol aparecendo. Criado-mudo com gaveta, abajur de cúpula acendendo a parede num leque de luz, plantinha, relógio, um copo. Quadro na parede, cortina e janela com luz entrando, vaso grande no canto, piso de madeira.

**Exterior aberto (deserto, campo, montanha).** Céu ocupa dois terços do quadro. Formações rochosas recortadas contra o horizonte, pedras espalhadas no chão com contorno, uma fonte de luz quente no chão (fogueira, barraca acesa, farol de carro) iluminando só o que está perto dela.

**Esquema científico.** O único lugar onde o estilo fica gráfico: fundo `night` escuro com grade fina, ícones de linha, números na fonte `mono`, ouro com brilho. Usado só nos trechos de ciência.

## Personagens

Proporção de anime: adolescente com cerca de 6 cabeças de altura, criança com 4,5. Olhos grandes com dois brilhos (`eye-hi`), sobrancelhas que fazem quase toda a atuação, boca simples. Cabelo em mechas pontudas com uma sombra só. Mãos com quatro dedos visíveis e polegar, nunca bolinhas. Roupas com dobras simples: o capuz, o bolso canguru e os cordões do moletom aparecem.

Cada personagem tem uma folha de referência no formato das referências: frente, três-quartos e perfil de corpo inteiro, quatro a seis expressões em close e duas poses de ação. A folha é feita antes do primeiro episódio e nunca muda.

| Personagem | Papel | Silhueta e cores |
| --- | --- | --- |
| Pip | "você", o herói | 15 anos, cabelo castanho-escuro bagunçado com um topete, moletom carvão-arroxeado (`pip-hoodie`) com cordões mostarda (`pip-accent`), jeans escuro, tênis branco |
| Nina | a irmã | 7 anos, maria-chiquinhas com elásticos coral (`nina-accent`), roupa verde-água (`nina-pj`), coelho de pelúcia |
| Theo | o melhor amigo | 15 anos, cabelo cacheado, pele `skin-warm`, jaqueta oliva (`theo-jacket`), fones coral no pescoço (`theo-accent`) |
| Mãe | | cabelo chanel castanho, cardigã rosado (`mom-cardigan`) |
| Homem de terno | o poder que percebe | cabelo penteado para trás, terno carvão (`suit`), gravata vermelha (`suit-tie`), sorriso educado |

O elenco é original. Nenhum personagem pode lembrar o herói de outro canal ou um personagem famoso: nada de moletom vermelho com cabelo preto espetado nem de moletom amarelo.

## Composição

O vídeo é horizontal, 1920x1080, mesmo que várias referências sejam verticais. Horizonte num terço da altura. Linhas que guiam o olhar (fios, rua, faixa, rodapé) apontam para o personagem ou para o ponto de fuga. Títulos e leituras ficam dentro de `safe-title`; ação importante dentro de `safe-action`. Texto na tela é só a cartela de título e leituras curtas em `mono` (DAY 12, 00:00, 22.6 m).

## Como produzir neste estilo

Este nível de pintura não sai de desenho feito com código: formas vetoriais geradas uma a uma ficam simples, como no primeiro storyboard. O caminho é separar as camadas:

1. **Cenários** são pinturas paradas, feitas uma vez por local e reaproveitadas entre episódios (o quarto do Pip, a rua, a sala). Podem ser pintadas ou geradas por uma ferramenta de imagem com o prompt-base abaixo, sempre conferidas contra a lista do cenário.
2. **Personagens** saem da folha de referência fixa, como recortes em camadas (cabeça, corpo, braços, expressões trocáveis), para animar sem redesenhar.
3. **Animação** monta as camadas: parallax entre fundo e frente, movimento de câmera, luz animada (cone do poste, brilho dos dedos), partículas de poeira, troca de expressão.

### Prompt-base para cenários (em inglês)

> anime lo-fi background painting, cozy residential [LOCAL], [CLIMA], detailed clean linework, soft painterly gradients, warm light from [FONTE] casting visible light shapes, deep shadows in the midtones, lots of lived-in details: [DETALHES DA LISTA], 16:9 wide shot, no people, no text

- `[CLIMA]` golden: "golden hour, low sun, cream sky with big soft clouds"; dusk: "dusk, deep blue sky meeting orange and wine-red clouds lit from below"; night: "night, navy sky with stars and a crescent moon, warm yellow lit windows".
- Evitar: "text, watermark, logo, people, characters, photorealistic, 3d render, oversaturated neon".

## Checklist de cada quadro

1. Dá para entender a ação em um segundo, no tamanho do celular.
2. Planos vizinhos têm tamanhos diferentes (geral, médio, close, inserto, contra-plongée).
3. A fonte de luz está visível e cria formas; os meios-tons estão escuros.
4. O rosto do personagem é a área mais clara e nítida da região dele, com o recorte de luz do lado da fonte.
5. Um plano geral tem 20 objetos ou mais, e todo objeto apoiado tem sombra de contato.
6. A perspectiva fecha: objetos no chão certo, na escala certa, apontando para o ponto de fuga.
7. Objetos e móveis têm o tamanho real deles (o edredom tem a largura da cama).
8. Mesma roupa, mesmo cenário, mesmos objetos nos mesmos lugares ao longo da cena.
9. Só título e leituras como texto, escritos certos.
10. Nada lembra personagem famoso, marca ou o herói de outro canal.
