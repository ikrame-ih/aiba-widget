/** Ask Aiba topics + offline FAQ answers. */

export const HELP_TOPICS = [
  {
    id: "morning-plan",
    intents: [
      "morning",
      "plan",
      "plan today",
      "priorities",
      "mañana",
      "planificar",
      "prioridades",
    ],
    answer:
      "Plan is where you set today's goal, add up to three tasks, and jot quick notes. When you're ready, switch to Focus and start the timer.",
    actions: [{ type: "switch-phase", phase: "morning" }],
  },
  {
    id: "afternoon-focus",
    intents: [
      "focus",
      "timer",
      "deep work",
      "block",
      "enfoque",
      "temporizador",
      "bloque",
      "start focus",
      "iniciar enfoque",
    ],
    answer:
      "Open Focus (or tap Start focus on a Plan task). Pick duration and task type, then press Begin — Aiba switches to the compact timer.",
    actions: [{ type: "switch-phase", phase: "afternoon" }],
  },
  {
    id: "evening-unwind",
    intents: [
      "evening",
      "shutdown",
      "wrap up",
      "unwind",
      "close day",
      "noche",
      "cerrar",
      "cierre",
      "desconectar",
    ],
    answer:
      "Unwind is a short close-out: write one thing that went well, and the first step for tomorrow. Nothing longer than that.",
    actions: [{ type: "switch-phase", phase: "evening" }],
  },
  {
    id: "recovery",
    intents: ["recovery", "break", "rest", "descanso", "recuperación", "pausa"],
    answer:
      "After a focus block, recovery scales with how long you worked: about 5–20 minutes. Step away from the screen; the timer advances automatically when time is up.",
    actions: [{ type: "open-help" }],
  },
  {
    id: "quick-notes",
    intents: [
      "notes",
      "brain dump",
      "open loops",
      "capture",
      "notas",
      "apuntes",
      "capturar",
    ],
    answer:
      "Quick notes live in the Plan view. Use the Notes section to capture open loops without changing your task list.",
    actions: [{ type: "switch-phase", phase: "morning" }],
  },
  {
    id: "sessions",
    intents: [
      "sessions",
      "history",
      "patterns",
      "sesiones",
      "historial",
      "patrones",
    ],
    answer:
      "Past focus blocks show up in Plan, under History. After three completed sessions, Aiba can suggest your best hour and task type there.",
    actions: [{ type: "switch-tool", tool: "sessions" }],
  },
  {
    id: "preferences",
    intents: [
      "preferences",
      "settings",
      "options",
      "preferencias",
      "ajustes",
      "opciones",
    ],
    answer:
      "Preferences covers theme, language, reduced motion, screen dimming, and optional site blocking. Site blocking only applies after you click Apply.",
    actions: [{ type: "switch-tool", tool: "preferences" }],
  },
  {
    id: "patterns",
    intents: [
      "patterns",
      "best hour",
      "task type",
      "patrones",
      "mejor hora",
      "tipo de tarea",
    ],
    answer:
      "Patterns unlock in Plan → History after three saved sessions. Best hour needs three sessions that start at the same clock hour. Best type uses the type you pick when starting focus.",
    actions: [{ type: "switch-tool", tool: "sessions" }],
  },
  {
    id: "tunnel-vision",
    intents: [
      "tunnel vision",
      "overlay",
      "dim screen",
      "visión túnel",
      "overlay",
    ],
    answer:
      "Tunnel vision dims the area outside the widget during focus. Turn it on in Preferences before or during a block.",
    actions: [{ type: "switch-tool", tool: "preferences" }],
  },
  {
    id: "guard",
    intents: [
      "guard",
      "block sites",
      "distraction",
      "bloquear",
      "sitios",
      "guardia",
    ],
    answer:
      "Deep work guard mutes notifications and can block listed domains during focus. Enable it in Preferences and confirm Windows Focus Assist if prompted.",
    actions: [{ type: "switch-tool", tool: "preferences" }],
  },
  {
    id: "shortcuts",
    intents: ["shortcut", "hotkey", "keyboard", "atajo", "teclado"],
    answer:
      "Global shortcuts: toggle focus/session from the tray menu. Open Preferences for guard and motion settings.",
    actions: [{ type: "switch-tool", tool: "preferences" }],
  },
  {
    id: "expand",
    intents: ["expand", "studio", "wider", "expandir", "estudio"],
    answer:
      "Expand opens the full widget with Plan, Focus, Unwind, and Preferences. Use the − button in the header to return to the compact timer.",
    actions: [{ type: "expand" }],
  },
  {
    id: "compact",
    intents: ["compact", "minimize", "small", "minimizar", "pequeño"],
    answer:
      "Compact mode keeps the timer and current task on screen. Tap ⤢ in the header to expand, or use − in the expanded view to return here.",
    actions: [{ type: "collapse" }],
  },
  {
    id: "primary-task",
    intents: ["current task", "primary task", "tarea", "tarea actual"],
    answer:
      "Your primary task is the priority marked for focus. Set it in Today during morning, or pick any priority line and tap Set focus.",
    actions: [{ type: "switch-phase", phase: "morning" }],
  },
  {
    id: "review",
    intents: ["review", "depth", "save session", "revisión", "guardar sesión"],
    answer:
      "After recovery, review asks how deep the block felt and whether the work is done or continues later. Saving adds the session to Sessions.",
    actions: [],
  },
  {
    id: "preview-mode",
    intents: ["preview", "time mode", "rhythm", "vista previa", "modo"],
    answer:
      "Use Plan, Focus, and Unwind in the sidebar to switch sections. Your choice is saved until you change it.",
    actions: [],
  },
  {
    id: "privacy",
    intents: ["privacy", "data", "offline", "local", "privacidad", "datos"],
    answer:
      "Aiba stores everything locally on your machine. Ask Aiba works offline with no account, no cloud, and no conversation history saved.",
    actions: [],
  },
  {
    id: "fine-tune",
    intents: ["skill", "challenge", "flow", "calibration", "habilidad", "reto"],
    answer:
      "Fine-tune focus adjusts skill and challenge sliders so the block feels aligned. If challenge is too high, break the output into a smaller milestone.",
    actions: [{ type: "start-focus" }],
  },
  {
    id: "interruption",
    intents: ["interruption", "interrupted", "interrupción"],
    answer:
      "Log interruption during a block to track how often focus breaks. It does not pause the timer unless you choose Pause.",
    actions: [],
  },
  {
    id: "done-today",
    intents: [
      "done today",
      "completed",
      "priorities done",
      "completado",
      "hecho",
    ],
    answer:
      "Done today counts checked priorities against your list of up to three. It is a lightweight scoreboard, not a session log.",
    actions: [{ type: "switch-phase", phase: "morning" }],
  },
  {
    id: "aiba-behavior",
    intents: ["aiba", "companion", "geisha", "mascot", "compañera"],
    answer:
      "Aiba reacts to your phase and session: brighter in morning, steady during focus, resting at night. Ask her about any section when you need orientation.",
    actions: [],
  },
  {
    id: "windows-focus",
    intents: [
      "windows focus",
      "focus assist",
      "notifications",
      "notificaciones",
    ],
    answer:
      "For full guard protection, confirm Windows Focus Assist is on. Preferences includes a link to open those settings.",
    actions: [{ type: "switch-tool", tool: "preferences" }],
  },
  {
    id: "reduced-motion",
    intents: [
      "motion",
      "animation",
      "reduced motion",
      "animación",
      "movimiento",
    ],
    answer:
      "Reduced motion turns off roaming and decorative movement while keeping essential feedback. Toggle it in Preferences.",
    actions: [{ type: "switch-tool", tool: "preferences" }],
  },
  {
    id: "what-is-aiba",
    intents: [
      "what is aiba",
      "what does this do",
      "help me",
      "qué es",
      "para qué sirve",
      "ayuda",
    ],
    answer:
      "Aiba is a calm desktop companion for planning, focus sessions, and unwinding at day end. Tap a question below for any section.",
    actions: [],
  },
  {
    id: "hide-widget",
    intents: [
      "hide",
      "close widget",
      "minimize to tray",
      "ocultar",
      "cerrar widget",
      "How do I hide the widget",
    ],
    answer:
      "Tap × in the header to hide the widget to the system tray. Use the tray icon to bring Aiba back.",
    actions: [],
  },
  {
    id: "main-goal",
    intents: [
      "main goal",
      "outcome",
      "concrete outcome",
      "objetivo",
      "meta del día",
      "What is the main goal field",
    ],
    answer:
      "Today's main goal is the one thing that would make today a success. Add up to three tasks underneath, then start a focus session on your main task.",
    actions: [{ type: "switch-phase", phase: "morning" }],
  },
  {
    id: "unwind-help",
    intents: ["unwind", "How does Unwind work", "wrap up", "desconectar"],
    answer:
      "Unwind appears in the evening. Write what went well and tomorrow's first step. That's all.",
    actions: [{ type: "switch-phase", phase: "evening" }],
  },
];

export const FAQ_TOPIC_IDS = [
  "morning-plan",
  "afternoon-focus",
  "evening-unwind",
  "sessions",
  "preferences",
  "patterns",
];

const HELP_ANSWERS_ES = {
  "morning-plan":
    "Plan sirve para fijar el objetivo del día, añadir hasta tres tareas y apuntar notas. Cuando quieras, pasa a Focus e inicia el temporizador.",
  "afternoon-focus":
    "Abre Focus (o pulsa Iniciar enfoque en una tarea de Plan). Elige duración y tipo, y pulsa Comenzar: Aiba pasa al temporizador compacto.",
  "evening-unwind":
    "Unwind es un cierre corto: escribe una cosa que salió bien y el primer paso de mañana. Nada más largo.",
  preferences:
    "En Preferencias cambias tema, idioma, movimiento reducido, atenuación de pantalla y bloqueo opcional de sitios. El bloqueo solo se aplica al pulsar Aplicar.",
  patterns:
    "Los patrones se desbloquean en Plan → Historial tras tres sesiones guardadas. Mejor hora pide tres sesiones a la misma hora. Mejor tipo usa el que eliges al iniciar enfoque.",
  recovery:
    "Tras un bloque de enfoque, el descanso dura unos 5–20 minutos según lo trabajado. Aparta la vista de la pantalla.",
  "quick-notes":
    "Las notas rápidas están en Plan. Usa la sección Notas para bucles abiertos sin tocar la lista de tareas.",
  sessions:
    "Los bloques pasados aparecen en Plan, en Historial. Tras tres sesiones, Aiba puede sugerir tu mejor hora y tipo de tarea.",
  "tunnel-vision":
    "La atenuación de pantalla oscurece el resto del escritorio durante el enfoque. Actívala en Preferencias.",
  guard:
    "El modo concentración reduce distracciones y puede bloquear dominios listados. Actívalo en Preferencias.",
  shortcuts:
    "Atajos globales: alternar sesión desde la bandeja. Más opciones en Preferencias.",
  expand:
    "Expandir abre la vista completa con Plan, Focus, Unwind y Preferencias. Usa − en la cabecera para volver al temporizador compacto.",
  compact:
    "El modo compacto muestra el temporizador y la tarea actual. Pulsa ⤢ arriba a la derecha para expandir.",
  "primary-task":
    "La tarea principal es la que marcas para enfocar. Elígela en Plan o pulsa Iniciar enfoque en una tarea.",
  review:
    "Tras el descanso, la revisión pregunta qué tan profunda fue la sesión. Guardar la añade a Sesiones.",
  "preview-mode":
    "Usa Plan, Focus y Unwind en la barra lateral para cambiar de sección. Tu elección se guarda hasta que la cambies.",
  privacy:
    "Aiba guarda todo en local. Ask Aiba funciona sin cuenta ni historial en la nube.",
  "fine-tune":
    "Ajustar dificultad equilibra habilidad y reto. Si el reto es alto, divide el resultado en un hito menor.",
  interruption:
    "Puedes registrar interrupciones para ver cuánto se rompe el enfoque. El temporizador solo pausa si tú lo pausas.",
  "done-today":
    "Hecho hoy cuenta tareas marcadas de tu lista de hasta tres. Es un marcador ligero, no un historial.",
  "aiba-behavior":
    "Aiba reacciona a la fase y la sesión: más viva por la mañana, estable al enfocar, en reposo de noche.",
  "windows-focus":
    "Para protección completa, confirma Enfoque de Windows. Preferencias incluye un enlace a esos ajustes.",
  "reduced-motion":
    "Movimiento reducido apaga animaciones decorativas. Actívalo en Preferencias.",
  "what-is-aiba":
    "Aiba es una compañera de escritorio para planificar, enfocar y cerrar el día. Toca una pregunta abajo.",
  "hide-widget":
    "Pulsa × para ocultar el widget a la bandeja. Usa el icono de la bandeja para volver.",
  "main-goal":
    "El objetivo principal es lo que haría exitoso el día. Añade hasta tres tareas e inicia enfoque.",
  "unwind-help":
    "Unwind aparece por la noche. Escribe qué salió bien y el primer paso de mañana.",
};

/** @param {"en" | "es"} locale */
export function getHelpTopics(locale) {
  if (locale !== "es") return HELP_TOPICS;
  return HELP_TOPICS.map((topic) => ({
    ...topic,
    answer: HELP_ANSWERS_ES[topic.id] ?? topic.answer,
  }));
}

/** @param {string} topicId @param {"en" | "es"} locale */
export function getHelpTopicById(topicId, locale = "en") {
  const topics = getHelpTopics(locale === "es" ? "es" : "en");
  return topics.find((topic) => topic.id === topicId) ?? null;
}

export const SUGGESTED_QUESTIONS = [
  "How do I start focus?",
  "What are Quick notes?",
  "Where do sessions appear?",
  "How does Unwind work?",
  "What is the main goal field?",
  "How do I hide the widget?",
];

export const SUGGESTED_QUESTIONS_ES = [
  "¿Cómo inicio enfoque?",
  "¿Qué son las notas rápidas?",
  "¿Dónde veo las sesiones?",
  "¿Cómo funciona Unwind?",
  "¿Qué pongo en el objetivo del día?",
  "¿Cómo oculto el widget?",
];

export const BREAK_RULES_COPY = {
  pageTitle: "Aiba Help",
  label: "Focus guide",
  close: "Close",
  closeAria: "Close help",
  workedCol: "Worked",
  breakCol: "Break",
  title: "Deep work rhythm",
  intro:
    "Aiba keeps one focus block simple. When you stop the timer, your break length scales with how long you stayed in flow.",
  rows: [
    { worked: "Under 25 min", break: "5 min" },
    { worked: "25 to 50 min", break: "8 min" },
    { worked: "50 to 90 min", break: "15 min" },
    { worked: "Over 90 min", break: "20+ min" },
  ],
};

export const BREAK_RULES_COPY_ES = {
  pageTitle: "Ayuda de Aiba",
  label: "Guía de enfoque",
  close: "Cerrar",
  closeAria: "Cerrar ayuda",
  workedCol: "Trabajado",
  breakCol: "Descanso",
  title: "Ritmo de trabajo profundo",
  intro:
    "Aiba mantiene un bloque de enfoque simple. Al parar el temporizador, el descanso se ajusta según cuánto tiempo estuviste en flujo.",
  rows: [
    { worked: "Menos de 25 min", break: "5 min" },
    { worked: "25 a 50 min", break: "8 min" },
    { worked: "50 a 90 min", break: "15 min" },
    { worked: "Más de 90 min", break: "20+ min" },
  ],
};

export function getBreakRulesCopy(locale) {
  return locale === "es" ? BREAK_RULES_COPY_ES : BREAK_RULES_COPY;
}
