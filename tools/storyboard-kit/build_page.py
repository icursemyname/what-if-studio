import base64, html
B = "/root/what-if-studio/out/one-touch-gold/board"
beats = [
 ("Cold open", "0:00", [
  ("S01","0:00","Plano geral","Quarto à meia-noite. Arlo na escrivaninha, o abajur aceso, o relógio vira 00:00. As pontas dos dedos começam a brilhar.","At exactly midnight, your fingertips start to glow."),
  ("S02","0:05","Inserto macro","O dedo brilhando desce até o clipe de aço.","You poke it."),
  ("S03","0:08","Inserto macro","O clipe agora é de ouro. Brilhos.","It doesn't look like gold. It IS gold."),
  ("S04","0:14","Contra-plongée","Nina na porta, contra a luz do corredor, abraçada ao coelho.","…Why is your paperclip shiny?"),
  ("S05","0:20","Close","Arlo olha a própria mão. O brilho sumiu.","One touch. That's all you get."),
  ("S06","0:30","Cartela de título","A casa à meia-noite, título por cima.","What if you could turn one thing into gold every day?")]),
 ("As regras", "0:45", [
  ("S07","0:55","Plano médio","Manhã. Arlo abraçado a um travesseiro de ouro maciço, torto de dor no pescoço.","You wake up hugging a solid gold pillow."),
  ("S08","1:10","Inserto","Uma luva de ouro cai no chão (clanc).","Gloves don't help."),
  ("S09","1:25","Plano médio","23:59. Arlo sentado na beira da cama, muito parado, decidindo.","…and you choose.")]),
 ("A parte divertida", "1:40", [
  ("S10","1:45","Plano médio","Cozinha ao entardecer. A mãe mexe o café com a colher de ouro.","Your mom stirs her coffee with it for a week."),
  ("S11","2:00","Plano geral","Rua ao pôr do sol. A bicicleta de ouro dobrou feito pretzel; Arlo no chão.","Gold bike: zero stars."),
  ("S12","2:25","Por cima do ombro","Theo segura o bloco de ouro em forma de celular. Cadê a tela?","…Where's the screen?"),
  ("S13","2:55","Plano geral","Dia 12. A mãe dorme no sofá às 8 da noite, sorrindo. Conta marcada PAGO.","Your mom quits the late shift."),
  ("S14","3:02","Close","Nina encara a fatia de bolo com folha de ouro.","Can I eat gold?")]),
 ("Por que o ouro é especial", "3:10", [
  ("S15","3:15","Esquema","Todo o ouro já extraído: um cubo de 22,6 m ao lado de um prédio de 7 andares, com Arlo minúsculo para escala.","A cube about twenty-two meters on each side."),
  ("S16","3:40","Esquema","Duas estrelas de nêutrons colidem e espalham ouro.","Two dead stars smashed into each other."),
  ("S17","3:55","Esquema","O anel do acelerador. Leituras: 29 pg, menos de um milionésimo de segundo.","About 29 trillionths of a gram. That's real.")]),
 ("O preço", "4:20", [
  ("S18","4:25","Plano geral","Ferro-velho ao pôr do sol. O carro de ouro afunda na lama; Arlo pequeno à esquerda.","A gold car weighs as much as a small truck."),
  ("S19","4:45","Inserto","TV: a manchete e o preço do ouro despencando.","The price of gold starts to fall."),
  ("S20","5:00","Plano geral","Caravana de camelos com ouro no deserto, Cairo, 1324. Leitura: 25 → 22 dirhams.","It lost value there for years."),
  ("S21","5:20","Plano conjunto","Varanda ao anoitecer. Theo segura o colar da avó; Arlo ao lado, culpado.","The shop says it's worth less now.")]),
 ("Alguém percebe", "5:40", [
  ("S22","5:45","Plongée","Dia 26. Um carro cinza parado do outro lado da rua, faróis acesos.","A grey car parks across the street."),
  ("S23","6:00","Por cima do ombro","O homem de terno na porta, com a pasta; a mãe preocupada à direita.","We know what you can do."),
  ("S24","6:25","Inserto zenital","A pasta aberta: foto da casa e foto da escola da Nina.","A photo of Nina's school.")]),
 ("Dia 30", "6:50", [
  ("S25","6:55","Plano geral","23:50. Faróis atravessam as cortinas. A mãe anda de um lado para o outro; Theo na porta dos fundos.","Day thirty. 11:50 p.m."),
  ("S26","7:20","Close","O relógio marca 00:00. As pontas dos dedos acendem.","The clock: 12:00."),
  ("S27","7:30","Contra-plongée","Nina desce a escada correndo, braços abertos.","Don't go!"),
  ("S28","7:40","Close","Arlo decide. Luz de recorte vermelha.","There's only one thing you can touch."),
  ("S29","7:45","Inserto macro","Os dedos brilhando apertam a própria palma; o ouro se espalha até o pulso.","You press your fingertips into your own palm."),
  ("S30","7:55","Plano médio","Nina abraça Arlo; a mão de ouro nas costas dela. O terno fecha a pasta na porta.","She's not gold. Your hand is.")]),
 ("Final", "8:10", [
  ("S31","8:15","Plano geral","Manhã. A caminho da escola, Nina segura a mão de ouro.","Like it's the coolest thing in the world."),
  ("S32","8:30","Inserto macro","O clipe de ouro pendurado no zíper da mochila da Nina.","Only one of them was worth it."),
  ("S33","8:45","Plano geral","TV numa sala vazia: em algum lugar, outra criança acende os dedos à meia-noite.","Subscribe for part two.")]),
]
cards = []
for bi,(bname,bt,shots) in enumerate(beats):
    items=[]
    for sid,tc,size,desc,line in shots:
        b64=base64.b64encode(open(f"{B}/{sid}.jpg","rb").read()).decode()
        items.append(f'''<figure class="shot"><img src="data:image/jpeg;base64,{b64}" alt="{html.escape(sid+': '+desc)}" loading="lazy" width="960" height="540"><figcaption><div class="meta"><span class="sid">{sid}</span><span class="tc">{tc}</span><span class="size">{html.escape(size)}</span></div><p class="desc">{html.escape(desc)}</p><p class="line" lang="en">{html.escape(line)}</p></figcaption></figure>''')
    cards.append(f'''<section class="beat"><header class="beat-h"><span class="bt">{bt}</span><h2>{html.escape(bname)}</h2><span class="count">{len(shots)} planos</span></header><div class="grid">{''.join(items)}</div></section>''')
page=f'''<title>Storyboard One Thing Into Gold</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Layout: a screening-room contact sheet — beats as reels, shots as frames in a wrapping grid, timecode first. */
:root {{
  --bg:#f3efe8; --panel:#fffdf9; --fg:#1c1824; --muted:#6a6272; --line:#ddd5ca; --gold:#a8740f; --gold-soft:#f1dfae;
  --f-display:"Bricolage Grotesque", "Avenir Next", system-ui, sans-serif;
  --f-body:"IBM Plex Sans", system-ui, sans-serif;
  --f-mono:"IBM Plex Mono", ui-monospace, Menlo, monospace;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#14111b; --panel:#1d1926; --fg:#efe9df; --muted:#a49cae; --line:#2f2a3b; --gold:#e9bc4a; --gold-soft:#3a2f17; color-scheme:dark }} }}
:root[data-theme="dark"] {{ --bg:#14111b; --panel:#1d1926; --fg:#efe9df; --muted:#a49cae; --line:#2f2a3b; --gold:#e9bc4a; --gold-soft:#3a2f17; color-scheme:dark }}
body {{ background:var(--bg); color:var(--fg); font-family:var(--f-body); font-size:15px; line-height:1.5;
  padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); padding-block:32px 64px; }}
.wrap {{ max-width:1240px; margin:0 auto; display:flex; flex-direction:column; gap:44px; }}
.top {{ display:flex; flex-wrap:wrap; gap:16px 40px; align-items:end; justify-content:space-between; border-bottom:1px solid var(--line); padding-bottom:22px; }}
.kicker {{ font-family:var(--f-mono); font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--gold); margin:0 0 6px; }}
h1 {{ font-family:var(--f-display); font-weight:800; font-size:clamp(30px, 5vw, 52px); line-height:1.02; margin:0; text-wrap:balance; }}
h1 em {{ font-style:normal; color:var(--gold); }}
.facts {{ display:flex; flex-wrap:wrap; gap:8px 26px; margin:0; font-family:var(--f-mono); font-size:13px; color:var(--muted); }}
.facts div {{ display:flex; flex-direction:column; }}
.facts dt {{ font-size:11px; letter-spacing:.1em; text-transform:uppercase; }}
.facts dd {{ margin:0; color:var(--fg); font-variant-numeric:tabular-nums; }}
.note {{ max-width:68ch; color:var(--muted); margin:0; }}
.beat {{ display:flex; flex-direction:column; gap:16px; }}
.beat-h {{ display:flex; align-items:baseline; gap:14px; flex-wrap:wrap; }}
.bt {{ font-family:var(--f-mono); font-size:13px; color:var(--gold); font-variant-numeric:tabular-nums; }}
.beat-h h2 {{ font-family:var(--f-display); font-weight:500; font-size:24px; margin:0; }}
.count {{ font-family:var(--f-mono); font-size:12px; color:var(--muted); margin-left:auto; }}
.grid {{ display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap:18px; }}
.shot {{ margin:0; background:var(--panel); border:1px solid var(--line); border-radius:6px; overflow:hidden; display:flex; flex-direction:column; min-width:0; }}
.shot img {{ display:block; width:100%; height:auto; aspect-ratio:16/9; max-width:100%; background:#000; }}
figcaption {{ padding:12px 14px 14px; display:flex; flex-direction:column; gap:6px; }}
.meta {{ display:flex; gap:10px; align-items:center; font-family:var(--f-mono); font-size:12px; color:var(--muted); font-variant-numeric:tabular-nums; }}
.sid {{ color:var(--fg); font-weight:500; background:var(--gold-soft); padding:1px 7px; border-radius:3px; }}
.size {{ margin-left:auto; text-transform:uppercase; letter-spacing:.06em; font-size:11px; }}
.desc {{ margin:0; font-size:14px; }}
.line {{ margin:0; font-size:13px; color:var(--muted); font-style:italic; }}
</style>
<div class="wrap">
  <div class="top">
    <div>
      <p class="kicker">Storyboard · rascunho 2 · elenco stickman</p>
      <h1>One Thing Into <em>Gold</em></h1>
    </div>
    <dl class="facts">
      <div><dt>Duração</dt><dd>~8:50</dd></div>
      <div><dt>Planos-chave</dt><dd>33</dd></div>
      <div><dt>Elenco</dt><dd>Arlo · Nina · Theo · Mãe · Terno</dd></div>
    </dl>
  </div>
  <p class="note">Um quadro-chave por plano, na ordem do roteiro aprovado. Cada cartão traz o tempo aproximado, o enquadramento, o que se vê e a fala em inglês que cai sobre ele. Na animação, cada beat ganha mais cortes entre esses quadros.</p>
  {''.join(cards)}
</div>
'''
open("/root/what-if-studio/out/one-touch-gold/storyboard.html","w").write(page)
import os; print(os.path.getsize("/root/what-if-studio/out/one-touch-gold/storyboard.html")//1024, "KB")
