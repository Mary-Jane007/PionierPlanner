import type { LocaleCode } from "@/types"
import type { PioneerTip, TipCategory } from "@/lib/tips/types"

function copy(
  nl: [string, string, string],
  en: [string, string, string],
  es: [string, string, string],
  pap: [string, string, string]
): Pick<PioneerTip, "title" | "text" | "reflection"> {
  return {
    title: { nl: nl[0], en: en[0], es: es[0], pap: pap[0] },
    text: { nl: nl[1], en: en[1], es: es[1], pap: pap[1] },
    reflection: { nl: nl[2], en: en[2], es: es[2], pap: pap[2] },
  }
}

export const TIP_CATEGORIES: TipCategory[] = [
  "pioneering",
  "ministry",
  "studies",
  "return",
  "informal",
  "time",
  "study",
  "encourage",
  "challenges",
]

export const builtInTips: PioneerTip[] = [
  {
    id: "tip-one-conversation",
    category: "encourage",
    scriptureReference: "Kolossenzen 4:6",
    ...copy(
      [
        "Maak vandaag ruimte voor één goed gesprek.",
        "Je hoeft de hele dag niet vol te plannen. Eén oprecht gesprek kan al een mooie dag maken.",
        "Een kalm tempo helpt je om mensen écht op te merken — onderweg, bij de deur of in een korte pauze.",
      ],
      [
        "Leave room today for one good conversation.",
        "You do not need to fill the whole day. One sincere conversation can already make it a good day.",
        "A calm pace helps you actually notice people — on the way, at the door, or in a short pause.",
      ],
      [
        "Deja hoy espacio para una buena conversación.",
        "No hace falta llenar todo el día. Una conversación sincera ya puede hacer que el día valga la pena.",
        "Un ritmo calmado te ayuda a notar de verdad a las personas: de camino, en la puerta o en una pausa breve.",
      ],
      [
        "Laga spasio awe pa un bon konversashon.",
        "Bo no mester yena e dia kompletu. Un konversashon sincer por hasi e dia bunita kaba.",
        "Un ritmo kalm ta yuda bo mira hende di bèrdat — na kaminda, na porta òf den un pausa kòrtiku.",
      ]
    ),
  },
  {
    id: "tip-open-slot",
    category: "time",
    scriptureReference: "Spreuken 16:9",
    ...copy(
      [
        "Plan ruimte voor onverwachte gesprekken.",
        "Laat in je ochtend of middag een klein stukje open. Zo blijft er lucht voor iemand die je niet had voorzien.",
        "Een goede planning is stevig én soepel. Die combinatie houdt dienst vreugdevol.",
      ],
      [
        "Plan space for unexpected conversations.",
        "Leave a small gap in the morning or afternoon so there is room for someone you did not expect.",
        "A good plan is both steady and flexible. That mix keeps ministry joyful.",
      ],
      [
        "Deja hueco para conversaciones inesperadas.",
        "Deja un rato libre por la mañana o la tarde. Así hay aire para alguien que no tenías previsto.",
        "Una buena planificación es firme y flexible. Esa mezcla mantiene el ministerio con gozo.",
      ],
      [
        "Planeá spasio pa konversashon inesperá.",
        "Laga un pedasito liber den mainta òf tardi. Asina tin aire pa un hende ku bo no a spera.",
        "Un bon planning ta fihá i fleksibel. E kombinashon ei ta tene servicio ku alegria.",
      ]
    ),
  },
  {
    id: "tip-start-small",
    category: "encourage",
    scriptureReference: "Galaten 6:9",
    ...copy(
      [
        "Begin klein, blijf vriendelijk.",
        "Als de dag vol voelt, kies dan één haalbaar blok. Consistentie groeit vaak uit rustige keuzes.",
        "Je hoeft vandaag niet alles in te halen. Je kunt wel één volgende stap zetten.",
      ],
      [
        "Start small, stay kind.",
        "If the day feels full, choose one realistic block. Consistency often grows from calm choices.",
        "You do not have to catch everything up today. You can still take one next step.",
      ],
      [
        "Empieza en pequeño y sé amable.",
        "Si el día se siente lleno, elige un bloque realista. La constancia suele nacer de decisiones tranquilas.",
        "Hoy no tienes que recuperarlo todo. Sí puedes dar un siguiente paso.",
      ],
      [
        "Kuminsá chikí, keda amabel.",
        "Si e dia ta yen, skoge un blòki ku bo por. Konsistensi ta krese for di eskohonan kalm.",
        "Bo no mester kumpra tur kos awe. Bo por duna un siguiente paso.",
      ]
    ),
  },
  {
    id: "tip-presence",
    category: "ministry",
    scriptureReference: "1 Thessalonicenzen 2:8",
    ...copy(
      [
        "Je aanwezigheid is al waardevol.",
        "Niet elk gesprek eindigt met een vervolg. Soms is een warme groet precies wat iemand nodig had.",
        "Schrijf later op wat je raakte. Dat helpt je herinneren waarom je dienst betekenis heeft.",
      ],
      [
        "Your presence already matters.",
        "Not every conversation leads to a follow-up. Sometimes a warm greeting is exactly what someone needed.",
        "Write down later what touched you. It helps you remember why the ministry has meaning.",
      ],
      [
        "Tu presencia ya vale.",
        "No toda conversación termina en un seguimiento. A veces un saludo cálido es justo lo que alguien necesitaba.",
        "Anota después lo que te llegó. Te ayuda a recordar por qué el ministerio tiene sentido.",
      ],
      [
        "Bo presensia kaba tin balor.",
        "No tur konversashon ta kaba ku un siguiente paso. Tin biaha un saludu kayente ta eksaktamente loke un hende mester.",
        "Skirbi despues kiko a toka bo. Esaki ta yuda bo kòrda pakiko servicio tin sentido.",
      ]
    ),
  },
  {
    id: "tip-protect-rest",
    category: "time",
    scriptureReference: "Marcus 6:31",
    ...copy(
      [
        "Bescherm ook je rust.",
        "Een pioniermaand vraagt om wijsheid, niet om uitputting. Plan dienst én herstel.",
        "Rust in je agenda is geen tekort. Het is wat je helpt om morgen weer met vreugde te dienen.",
      ],
      [
        "Protect your rest too.",
        "A pioneer month asks for wisdom, not exhaustion. Plan ministry and recovery.",
        "Rest on the calendar is not a shortage. It is what helps you serve with joy again tomorrow.",
      ],
      [
        "Protege también tu descanso.",
        "Un mes de precursor pide sabiduría, no agotamiento. Planifica ministerio y recuperación.",
        "El descanso en la agenda no es un fallo. Es lo que te ayuda a servir mañana con gozo.",
      ],
      [
        "Protehá bo deskanso tambe.",
        "Un luna di pionero ta pidi sabiduria, no kansamentu. Planeá servicio i rekuperashon.",
        "Deskanse den agenda no ta un falta. Ta esaki ta yuda bo sirbi mañan atrobe ku alegria.",
      ]
    ),
  },
  {
    id: "tip-simple-return",
    category: "return",
    scriptureReference: "Filippenzen 2:4",
    ...copy(
      [
        "Een nabezoek mag eenvoudig blijven.",
        "Je hoeft geen lange les klaar te hebben. Belangstelling tonen en één korte gedachte is al een stevige volgende stap.",
        "Zet een herinnering voor het vervolg. Kleine, warme bezoeken bouwen vertrouwen.",
      ],
      [
        "A return visit may stay simple.",
        "You do not need a long lesson ready. Showing interest and sharing one short thought is already a solid next step.",
        "Set a reminder for the follow-up. Small, warm visits build trust.",
      ],
      [
        "Una revisita puede seguir siendo sencilla.",
        "No necesitas una lección larga. Mostrar interés y dejar un pensamiento breve ya es un buen siguiente paso.",
        "Pon un recordatorio. Las visitas cortas y cálidas construyen confianza.",
      ],
      [
        "Un revisita por keda simpel.",
        "Bo no mester tin un lès largu kla. Mustra interes i laga un pensamentu kòrtiku ta kaba un bon siguiente paso.",
        "Pone un rekordatorio. Bishitanan kòrtiku i kayente ta konstruí konfiansa.",
      ]
    ),
  },
  {
    id: "tip-companion",
    category: "ministry",
    scriptureReference: "Prediker 4:9",
    ...copy(
      [
        "Werk samen waar het kan.",
        "Een metgezel maakt een ochtend lichter — in gesprek, in timing en in bemoediging.",
        "Als je alleen dient, mag dat ook. Kies dan een tempo dat bij jou past.",
      ],
      [
        "Work together when you can.",
        "A companion makes a morning lighter — in conversation, in timing, and in encouragement.",
        "Serving alone is fine too. Then choose a pace that fits you.",
      ],
      [
        "Trabaja en compañía cuando puedas.",
        "Un compañero hace la mañana más ligera: en la conversación, en el ritmo y en el ánimo.",
        "Servir solo también está bien. Entonces elige un ritmo que te quede.",
      ],
      [
        "Traha huntu unda por.",
        "Un kompañero ta hasi un mainta mas lihé — den konversashon, den ritmo i den ánimo.",
        "Sirbi so tambe ta bon. E ora ei skoge un ritmo ku ta keda bo.",
      ]
    ),
  },
  {
    id: "tip-listen",
    category: "ministry",
    scriptureReference: "Jakobus 1:19",
    ...copy(
      [
        "Luister langer dan je spreekt.",
        "Begin met hun dag, hun zorg of hun vraag. Daarna past een korte tekst vaak vanzelf.",
        "Mensen onthouden hoe je hen behandelde, niet hoe volledig je uitleg was.",
      ],
      [
        "Listen longer than you speak.",
        "Start with their day, their worry, or their question. Then a short verse often fits naturally.",
        "People remember how you treated them, not how complete your explanation was.",
      ],
      [
        "Escucha más de lo que hablas.",
        "Empieza por su día, su preocupación o su pregunta. Después un versículo breve suele encajar solo.",
        "La gente recuerda cómo la trataste, no lo completa que fue tu explicación.",
      ],
      [
        "Skucha mas largu ku bo papia.",
        "Kuminsá ku nan dia, nan preokupashon òf nan pregunta. Despues un teksto kòrtiku ta keda naturalmente.",
        "Hende ta kòrda kon bo a trata nan, no kon kompletá bo splikashon tabata.",
      ]
    ),
  },
  {
    id: "tip-informal-bag",
    category: "informal",
    scriptureReference: "1 Petrus 3:15",
    ...copy(
      [
        "Houd iets kleins bij de hand.",
        "Een kaartje of een korte tekst in je tas maakt informeel getuigenis rustiger. Je hoeft niet te improviseren onder druk.",
        "Gewone plekken — winkel, bushalte, werk — horen bij je dienst, niet ernaast.",
      ],
      [
        "Keep something small with you.",
        "A card or a short verse in your bag makes informal witnessing calmer. You do not have to improvise under pressure.",
        "Ordinary places — the shop, the bus stop, work — belong to your ministry, not beside it.",
      ],
      [
        "Lleva algo pequeño encima.",
        "Una tarjeta o un versículo breve en el bolso hace el testimonio informal más calmado. No tienes que improvisar bajo presión.",
        "Los lugares normales — la tienda, la parada, el trabajo — forman parte del ministerio, no quedan al margen.",
      ],
      [
        "Tene un kos chikí kla.",
        "Un karta òf un teksto kòrtiku den tas ta hasi testimonio informal mas kalm. Bo no mester improvisá bou di preshon.",
        "Lugánan normal — tienda, parada, trabou — ta parti di servicio, no pafo di dje.",
      ]
    ),
  },
  {
    id: "tip-one-scripture",
    category: "study",
    scriptureReference: "2 Timoteüs 2:15",
    ...copy(
      [
        "Bereid één tekst goed voor, niet vijf half.",
        "Kies voor je dienstblok één Schriftplaats die je zelf begrijpt. Dan praat je rustiger en blijf je bij het punt.",
        "Korte, heldere voorbereiding helpt meer dan een te volle tas met ideeën.",
      ],
      [
        "Prepare one verse well, not five halfway.",
        "For your session, pick one scripture you actually understand. Then you speak more calmly and stay on the point.",
        "Short, clear preparation helps more than a bag that is too full of ideas.",
      ],
      [
        "Prepara bien un texto, no cinco a medias.",
        "Elige para tu turno un versículo que tú entiendes. Así hablas con más calma y no te sales del punto.",
        "Una preparación breve y clara ayuda más que una bolsa llena de ideas.",
      ],
      [
        "Prepara un teksto bon, no sinku half.",
        "Pa bo seshon, skoge un teksto ku bo mes ta komprondé. Asina bo ta papia mas kalm i keda na punto.",
        "Preparashon kòrtiku i kla ta yuda mas ku un tas yen di idea.",
      ]
    ),
  },
  {
    id: "tip-closed-door",
    category: "challenges",
    scriptureReference: "1 Korintiërs 3:6",
    ...copy(
      [
        "Een dichte deur is geen mislukte dag.",
        "Jij plant en begiet. Groei is niet jouw maatstaf voor vandaag. Ga verder naar de volgende persoon met dezelfde vriendelijkheid.",
        "Tel niet alleen reacties. Tel ook dat je er was.",
      ],
      [
        "A closed door is not a failed day.",
        "You plant and water. Growth is not today’s scoreboard. Move to the next person with the same kindness.",
        "Do not count only responses. Also count that you showed up.",
      ],
      [
        "Una puerta cerrada no es un día fallido.",
        "Tú siembras y riegas. El crecimiento no es el marcador de hoy. Sigue con la siguiente persona con la misma amabilidad.",
        "No cuentes solo las respuestas. Cuenta también que estuviste ahí.",
      ],
      [
        "Un porta sera no ta un dia pèrdí.",
        "Bo ta planta i drupa. Krese no ta e skor di awe. Bai serka e siguiente hende ku e mesun amabelidat.",
        "No konta solamente reashon. Konta tambe ku bo a show up.",
      ]
    ),
  },
  {
    id: "tip-hours-without-pressure",
    category: "pioneering",
    scriptureReference: "Filippenzen 4:6",
    ...copy(
      [
        "Houd je uren bij zonder dat het cijfer de vreugde steelt.",
        "Noteer je tijd eerlijk, en kijk daarna weer naar mensen. Het doel helpt je plannen; het is geen vonnis over je waarde.",
        "Als je achterloopt, kies het volgende vrije moment — niet een schuldgevoel voor de rest van de week.",
      ],
      [
        "Track your hours without letting the number steal the joy.",
        "Record your time honestly, then look at people again. The goal helps you plan; it is not a verdict on your worth.",
        "If you are behind, pick the next free slot — not a guilty feeling for the rest of the week.",
      ],
      [
        "Anota tus horas sin que el número te quite el gozo.",
        "Registra el tiempo con honestidad y vuelve a mirar a las personas. El objetivo ayuda a planificar; no es una sentencia sobre tu valor.",
        "Si vas atrasado, elige el siguiente hueco libre, no un sentimiento de culpa para el resto de la semana.",
      ],
      [
        "Tene bo ora sin laga e number hula e alegria.",
        "Notá bo tempu honestamente, i mira hende atrobe. E meta ta yuda planeá; e no ta un verdikto riba bo balor.",
        "Si bo ta atras, skoge e siguiente momentu liber — no un culpa pa resto di e siman.",
      ]
    ),
  },
  {
    id: "tip-personal-detail",
    category: "return",
    scriptureReference: "Spreuken 27:23",
    ...copy(
      [
        "Schrijf één persoonlijk detail op.",
        "Na een nabezoek: hun naam, een zorg, of wat ze zelf zeiden. Dan voelt het volgende bezoek als een vervolg, niet als een herstart.",
        "Twee zinnen in je notities zijn genoeg. Je hoeft geen dossier bij te houden.",
      ],
      [
        "Write down one personal detail.",
        "After a return visit: their name, a concern, or what they said. Then the next visit feels like a continuation, not a restart.",
        "Two sentences in your notes are enough. You do not need a file on everyone.",
      ],
      [
        "Anota un detalle personal.",
        "Después de una revisita: su nombre, una preocupación o lo que dijeron. Así la siguiente visita se siente como continuación, no como un reinicio.",
        "Dos frases en tus notas bastan. No hace falta un expediente.",
      ],
      [
        "Skirbi un detaye personal.",
        "Despues di un revisita: nan nòmber, un preokupashon, òf loke nan a bisa. E siguiente bishita ta sinti komo kontinuashon, no kuminsamentu nobo.",
        "Dos sentence den nota ta sufisiente. Bo no mester un dosjé.",
      ]
    ),
  },
  {
    id: "tip-ordinary-places",
    category: "informal",
    scriptureReference: "Johannes 4:7",
    ...copy(
      [
        "Gewone momenten tellen mee.",
        "Jezus begon een gesprek bij een put, tijdens iets alledaags. Jij mag hetzelfde doen in de rij, op het werk of bij de buren.",
        "Informeel is geen ‘extra’ als de deur-aan-deur tegenzit. Het is echte dienst.",
      ],
      [
        "Ordinary moments count.",
        "Jesus started a conversation at a well, during something everyday. You may do the same in a queue, at work, or with a neighbor.",
        "Informal witnessing is not a consolation prize when house-to-house is hard. It is real ministry.",
      ],
      [
        "Los momentos normales también cuentan.",
        "Jesús empezó una conversación en un pozo, en algo cotidiano. Tú puedes hacer lo mismo en una cola, en el trabajo o con un vecino.",
        "El testimonio informal no es un premio de consuelo si casa en casa se pone difícil. Es ministerio de verdad.",
      ],
      [
        "Momentunan normal ta konta.",
        "Jesus a kuminsá un konversashon na un pos, durante un kos di tur dia. Bo por hasi e mesun kos den rei, na trabou òf ku bisiña.",
        "Informal no ta un premio di konsuelo si kas-pa-kas ta masha. E ta servicio di bèrdat.",
      ]
    ),
  },
  {
    id: "tip-short-study",
    category: "study",
    scriptureReference: "Psalm 119:105",
    ...copy(
      [
        "Tien minuten studie voor je de deur uitgaat.",
        "Lees de tekst van de dag of één alinea die je zelf bemoedigt. Dan begin je dienst vanuit iets dat je zelf hebt geproefd.",
        "Persoonlijke studie hoeft niet lang te zijn om je gesprekken warmer te maken.",
      ],
      [
        "Ten minutes of study before you leave.",
        "Read the day’s text or one paragraph that encourages you. Then you start ministry from something you have tasted yourself.",
        "Personal study does not have to be long to make your conversations warmer.",
      ],
      [
        "Diez minutos de estudio antes de salir.",
        "Lee el texto del día o un párrafo que te anime. Así empiezas el ministerio desde algo que tú mismo has saboreado.",
        "El estudio personal no tiene que ser largo para hacer más cálidas tus conversaciones.",
      ],
      [
        "Dies minüt di estudio promé ku bo sali.",
        "Lesa e teksto di e dia òf un parágrafo ku ta dá bo ánimo. Asina bo ta kuminsá servicio for di un kos ku bo mes a proba.",
        "Estudio personal no mester ta largu pa hasi bo konversashon mas kayente.",
      ]
    ),
  },
  {
    id: "tip-thank-companion",
    category: "encourage",
    scriptureReference: "Hebreeën 10:24",
    ...copy(
      [
        "Dank je metgezel tussendoor.",
        "Een korte zin na afloop — ‘fijn dat je meeging’ — maakt de volgende afspraak lichter voor jullie allebei.",
        "Pionieren is teamwerk, ook als je maar een ochtend samen bent.",
      ],
      [
        "Thank your companion along the way.",
        "A short sentence afterwards — “I’m glad you came” — makes the next arrangement lighter for both of you.",
        "Pioneering is teamwork, even if you are only together for one morning.",
      ],
      [
        "Agradece a tu compañero por el camino.",
        "Una frase breve al terminar — «me alegró que vinieras» — hace más ligero el siguiente acuerdo para los dos.",
        "El precursorado es trabajo en equipo, aunque solo estén juntos una mañana.",
      ],
      [
        "Danká bo kompañero na kaminda.",
        "Un frase kòrtiku despues — ‘mi ta kontentu ku bo a bai’ — ta hasi e siguiente afspraak mas lihé pa both.",
        "Pionerashon ta trabou di team, incluso si boso ta huntu un mainta so.",
      ]
    ),
  },
  {
    id: "tip-behind-hours",
    category: "challenges",
    scriptureReference: "Romeinen 12:12",
    ...copy(
      [
        "Als je uren achterlopen: kies de eerstvolgende ochtend.",
        "Niet de hele maand inhalen in één weekend. Zet één realistisch blok in je agenda en houd je daaraan.",
        "Volhouden is vaker een kleine afspraak nakomen dan een groot plan maken.",
      ],
      [
        "If your hours are behind: take the next morning.",
        "Do not try to catch the whole month in one weekend. Put one realistic block on the calendar and keep it.",
        "Persevering is more often keeping a small appointment than making a large plan.",
      ],
      [
        "Si vas atrasado en horas: toma la siguiente mañana.",
        "No intentes recuperar el mes entero en un fin de semana. Pon un bloque realista y cúmplelo.",
        "Perseverar suele ser cumplir un acuerdo pequeño, no hacer un plan enorme.",
      ],
      [
        "Si bo ora ta atras: skoge e siguiente mainta.",
        "No purba kumpra e luna kompletu den un weekend. Pone un blòki realista i kumprié.",
        "Perseverá ta mas biaha kumpri un afspraak chikí ku hasi un plan grandi.",
      ]
    ),
  },
  {
    id: "tip-batch-letters",
    category: "time",
    scriptureReference: "1 Korintiërs 14:40",
    ...copy(
      [
        "Bundel soortgelijk werk.",
        "Brieven, telefoon of notities gaan sneller als je ze in één blok doet in plaats van tussendoor.",
        "Een ordelijke agenda geeft je hoofd rust, zodat je in het gesprek aanwezig kunt zijn.",
      ],
      [
        "Batch similar work.",
        "Letters, phone calls, or notes go faster in one block than squeezed between other things.",
        "An orderly calendar gives your mind rest, so you can be present in the conversation.",
      ],
      [
        "Agrupa el trabajo parecido.",
        "Cartas, llamadas o notas van más rápido en un solo bloque que metidas entre otras cosas.",
        "Una agenda ordenada da descanso a la mente, para que puedas estar presente en la conversación.",
      ],
      [
        "Grupo trabou similar.",
        "Karta, telefòn òf nota ta bai mas lihé den un blòki ku tussendoor.",
        "Un agenda òrdu ta dá bo kabes deskanso, pa bo por ta presente den e konversashon.",
      ]
    ),
  },
  {
    id: "tip-timely-word",
    category: "pioneering",
    scriptureReference: "Spreuken 15:23",
    ...copy(
      [
        "Een tijdige zin weegt zwaarder dan een lang betoog.",
        "Bereid één bemoedigende gedachte voor die bij dit seizoen past — weer, zorgen, feestdagen — en laat de rest los.",
        "Je mag kort zijn. Korte dienst kan diep zijn.",
      ],
      [
        "A timely sentence weighs more than a long speech.",
        "Prepare one encouraging thought that fits this season — weather, worries, holidays — and let the rest go.",
        "You are allowed to be brief. Short ministry can still go deep.",
      ],
      [
        "Una frase a tiempo pesa más que un discurso largo.",
        "Prepara un pensamiento alentador que encaje en esta temporada — el tiempo, las preocupaciones, las fiestas — y suelta lo demás.",
        "Puedes ser breve. El ministerio corto también puede ser profundo.",
      ],
      [
        "Un frase na tempu ta peza mas ku un discurso largu.",
        "Prepara un pensamentu di ánimo ku ta keda e temporada aki — tempo, preokupashon, fiesta — i laga resto bai.",
        "Bo por ta kòrtiku. Servicio kòrtiku por ta profundo.",
      ]
    ),
  },
  {
    id: "tip-joy-in-small",
    category: "pioneering",
    scriptureReference: "Lukas 10:17",
    ...copy(
      [
        "Vier ook de kleine dingen.",
        "Iemand die bleef staan. Een afspraak voor volgende week. Een rustige ochtend met je metgezel. Dat hoort bij pionieren.",
        "Vreugde in kleine stappen houdt je langer vol dan alleen grote resultaten.",
      ],
      [
        "Celebrate the small things too.",
        "Someone who stayed to talk. An appointment for next week. A calm morning with your companion. That is pioneering too.",
        "Joy in small steps keeps you going longer than big results alone.",
      ],
      [
        "Celebra también lo pequeño.",
        "Alguien que se quedó a hablar. Una cita para la semana que viene. Una mañana tranquila con tu compañero. Eso también es precursorado.",
        "El gozo en pasos pequeños te sostiene más que solo los resultados grandes.",
      ],
      [
        "Selebrá kosnan chikí tambe.",
        "Un hende ku a keda papia. Un afspraak pa siguiente siman. Un mainta kalm ku bo kompañero. Esaki tambe ta pionerashon.",
        "Alegria den paso chikí ta tene bo mas largu ku resultado grandi so.",
      ]
    ),
  },
  {
    id: "tip-study-one-question",
    category: "studies",
    scriptureReference: "Johannes 17:3",
    ...copy(
      [
        "Bereid één vraag voor je studie.",
        "Niet een hele les herschrijven. Eén warme vraag over wat ze zelf lazen, houdt de studie levend en persoonlijk.",
        "Laat hen meer praten dan jij. Dan merk je wat echt binnenkwam.",
      ],
      [
        "Prepare one question for your study.",
        "Do not rewrite a whole lesson. One warm question about what they read keeps the study alive and personal.",
        "Let them talk more than you. Then you notice what actually landed.",
      ],
      [
        "Prepara una pregunta para el estudio.",
        "No reescribas toda la lección. Una pregunta cálida sobre lo que leyeron mantiene el estudio vivo y personal.",
        "Deja que hablen más que tú. Así notas qué llegó de verdad.",
      ],
      [
        "Prepara un pregunta pa bo estudio.",
        "No skirbi un lès kompletu di nobo. Un pregunta kayente tokante loke nan mes a lesa ta tene e estudio bibu i personal.",
        "Laga nan papia mas ku abo. Asina bo ta mira kiko a drenta di bèrdat.",
      ]
    ),
  },
  {
    id: "tip-study-keep-short",
    category: "studies",
    scriptureReference: "Prediker 3:1",
    ...copy(
      [
        "Houd een studie kort en warm.",
        "Eindig op tijd, met één duidelijke volgende afspraak. Een studie die te lang duurt, voelt zwaarder dan nodig.",
        "Een prettig einde maakt de volgende keer makkelijker om ja te zeggen.",
      ],
      [
        "Keep a study short and warm.",
        "Finish on time, with one clear next appointment. A study that runs too long feels heavier than it needs to.",
        "A kind ending makes it easier to say yes next time.",
      ],
      [
        "Mantén el estudio breve y cálido.",
        "Termina a tiempo, con una próxima cita clara. Un estudio demasiado largo se siente más pesado de lo necesario.",
        "Un final agradable hace más fácil decir que sí la próxima vez.",
      ],
      [
        "Tene un estudio kòrtiku i kayente.",
        "Kaba na tempu, ku un siguiente afspraak kla. Un estudio ku ta dura muchu ta sinti mas pisa ku mester.",
        "Un final bunita ta hasi e siguiente biaha mas fásil pa bisa sí.",
      ]
    ),
  },
]

export function pickCopy(
  value: PioneerTip["title"],
  lang: LocaleCode
): string {
  if (typeof value === "string") return value
  return value[lang] || value.nl
}
